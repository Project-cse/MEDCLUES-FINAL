"""Native In-House Hospital Pharmacy Service.
Handles auto-creation of counter orders on consultation end,
real-time pharmacist packaging & dispensing, inventory calculations,
and token/QR pickup passes.
"""
from __future__ import annotations

import asyncio
import secrets
from typing import Any, Optional
from datetime import datetime

from app.config.db import db
from app.utils.app_logger import get_logger

log = get_logger(__name__)


async def auto_create_counter_order(consultation_id: int, hospital_id: int | None, appointment_id: int | None) -> dict | None:
    """Invoked when doctor completes consultation — creates/updates pharmacy_counter_orders."""
    if not hospital_id or not consultation_id:
        return None

    try:
        # 1. Fetch consultation, doctor, patient details
        consult = await db.fetch_row(
            """
            SELECT c.*, a.id AS appt_id, a.user_id, a.doctor_id, a.hospital_id,
                   a.doctor_data AS doc_data,
                   u.name AS patient_name, u.phone AS patient_phone,
                   h.name AS hospital_name
            FROM consultations c
            JOIN appointments a ON a.id = c.appointment_id
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN hospital_tieups h ON h.id = a.hospital_id
            WHERE c.id = $1
            """,
            consultation_id,
        )
        if not consult:
            return None

        consult = dict(consult)
        doc_data = consult.get("doc_data") or {}
        if isinstance(doc_data, str):
            try:
                import json
                doc_data = json.loads(doc_data)
            except Exception:
                doc_data = {}
        if not isinstance(doc_data, dict):
            doc_data = {}
        doctor_name = doc_data.get("name") or "Hospital Doctor"
        doctor_specialty = doc_data.get("specialty") or "General Medicine"
        patient_name = consult.get("patient_name") or "Patient"
        patient_phone = consult.get("patient_phone") or "0000000000"
        patient_id = consult.get("user_id")

        # 2. Find hospital pharmacy
        ph_row = await db.fetch_row(
            "SELECT id FROM pharmacies WHERE hospital_id = $1 AND is_active = true LIMIT 1",
            hospital_id,
        )
        pharmacy_id = ph_row["id"] if ph_row else None

        # 3. Fetch structured prescription line items
        from app.models import prescription_item_model
        rx_items = await prescription_item_model.list_for_consultation(consultation_id)
        
        # If no structured items, parse text notes as a fallback line item
        if not rx_items and consult.get("prescription"):
            rx_items = [{
                "name": (consult.get("prescription") or "Prescribed Medicines")[:100],
                "dosage": "As directed",
                "frequency": "1-0-1",
                "duration": "3 days",
                "quantity": 1,
                "instructions": consult.get("prescription"),
            }]

        # 4. Check if counter order already exists for this consultation
        existing_order = await db.fetch_row(
            "SELECT * FROM pharmacy_counter_orders WHERE consultation_id = $1",
            consultation_id,
        )

        if existing_order:
            order_id = existing_order["id"]
            public_id = existing_order["public_id"]
            status = existing_order["status"]
            # If already dispensed, don't revert status
        else:
            public_id = f"RX-{consultation_id:04d}-{secrets.token_hex(2).upper()}"
            status = "received"
            new_row = await db.fetch_row(
                """
                INSERT INTO pharmacy_counter_orders (
                    public_id, consultation_id, appointment_id, hospital_id, pharmacy_id,
                    patient_id, patient_name, patient_phone, doctor_name, doctor_specialty,
                    status, payment_status, payment_method, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'cash', $12)
                RETURNING id
                """,
                public_id, consultation_id, appointment_id, hospital_id, pharmacy_id,
                patient_id, patient_name, patient_phone, doctor_name, doctor_specialty,
                status, consult.get("prescription") or "",
            )
            order_id = new_row["id"]

        # 5. Populate and price line items from hospital pharmacy_medicines
        await db.execute("DELETE FROM pharmacy_counter_order_items WHERE order_id = $1", order_id)
        
        total_amount = 0.0
        for item in rx_items:
            item_name = str(item.get("name") or "Medicine").strip()
            qty = int(item.get("quantity") or 1)
            
            # Lookup price from pharmacy_medicines for this hospital
            med_match = await db.fetch_row(
                """
                SELECT id, name, price, mrp, rack_location
                FROM pharmacy_medicines
                WHERE hospital_id = $1 AND (name ILIKE $2 OR salt ILIKE $2 OR brand ILIKE $2)
                ORDER BY CASE WHEN name ILIKE $3 THEN 1 ELSE 2 END, id ASC
                LIMIT 1
                """,
                hospital_id, f"%{item_name}%", item_name,
            )

            unit_price = float(med_match["price"]) if med_match else 40.00
            line_total = round(unit_price * qty, 2)
            total_amount += line_total
            medicine_id = med_match["id"] if med_match else None

            await db.execute(
                """
                INSERT INTO pharmacy_counter_order_items (
                    order_id, medicine_id, name, dosage, frequency, duration, quantity, unit_price, line_total, instructions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                order_id, medicine_id, item_name, item.get("dosage") or "1 tab",
                item.get("frequency") or "Twice daily", item.get("duration") or "3 days",
                qty, unit_price, line_total, item.get("instructions") or "",
            )

        # 6. Update order total amount
        await db.execute(
            """
            UPDATE pharmacy_counter_orders
            SET amount_subtotal = $1, amount_total = $1, updated_at = NOW()
            WHERE id = $2
            """,
            total_amount, order_id,
        )

        # 7. Realtime Socket Broadcast to Hospital Pharmacy Counter
        try:
            from app.services import socket_service
            sio = getattr(socket_service, "sio", None)
            if sio:
                payload = {
                    "orderId": order_id,
                    "token": public_id,
                    "patientName": patient_name,
                    "doctorName": doctor_name,
                    "hospitalId": hospital_id,
                    "total": total_amount,
                    "status": status,
                    "time": "Just now",
                }
                await sio.emit("new_counter_order", payload, room=f"hospital_pharmacy:{hospital_id}")
                await sio.emit("pharmacy_order_status", payload, room=f"patient_rx:{consultation_id}")
        except Exception as sock_err:
            log.warning("Socket broadcast failed for counter order: %s", sock_err)

        return {"order_id": order_id, "public_id": public_id, "status": status, "total": total_amount}

    except Exception as exc:
        log.exception("Error auto-creating counter order: %s", exc)
        return None


async def get_counter_orders_for_hospital(hospital_id: int, status: str | None = None, search: str | None = None) -> list[dict]:
    """Retrieve queue of orders for hospital pharmacist."""
    query = """
        SELECT o.*, h.name AS hospital_name,
               json_agg(json_build_object(
                   'id', i.id,
                   'medicineId', i.medicine_id,
                   'name', i.name,
                   'dosage', i.dosage,
                   'frequency', i.frequency,
                   'duration', i.duration,
                   'quantity', i.quantity,
                   'unitPrice', i.unit_price,
                   'lineTotal', i.line_total,
                   'instructions', i.instructions
               )) AS items
        FROM pharmacy_counter_orders o
        LEFT JOIN hospital_tieups h ON h.id = o.hospital_id
        LEFT JOIN pharmacy_counter_order_items i ON i.order_id = o.id
        WHERE o.hospital_id = $1
    """
    params: list[Any] = [hospital_id]
    param_idx = 2

    if status and status != "all":
        query += f" AND o.status = ${param_idx}"
        params.append(status)
        param_idx += 1

    if search:
        query += f" AND (o.public_id ILIKE ${param_idx} OR o.patient_name ILIKE ${param_idx} OR o.patient_phone ILIKE ${param_idx})"
        params.append(f"%{search}%")
        param_idx += 1

    query += " GROUP BY o.id, h.name ORDER BY o.created_at DESC LIMIT 100"
    rows = await db.query(query, *params)
    
    orders = []
    for r in rows:
        r = dict(r)
        orders.append({
            "id": r["id"],
            "token": r["public_id"],
            "consultationId": r.get("consultation_id"),
            "appointmentId": r.get("appointment_id"),
            "hospitalId": r["hospital_id"],
            "hospitalName": r.get("hospital_name") or "Hospital Pharmacy",
            "patientName": r["patient_name"],
            "patientPhone": r.get("patient_phone") or "",
            "doctorName": r.get("doctor_name") or "Doctor",
            "doctorSpecialty": r.get("doctor_specialty") or "General Medicine",
            "status": r["status"],
            "paymentStatus": r["payment_status"],
            "paymentMethod": r.get("payment_method") or "cash",
            "amountTotal": float(r["amount_total"]) if r.get("amount_total") is not None else 0.0,
            "items": r.get("items") or [],
            "createdAt": r["created_at"].isoformat() if r.get("created_at") else None,
            "dispensedAt": r["dispensed_at"].isoformat() if r.get("dispensed_at") else None,
            "notes": r.get("notes") or "",
        })
    return orders


async def lookup_order_by_token(token: str, hospital_id: int | None = None) -> dict | None:
    """Find order by token ID (e.g. RX-1042-AB12) or ID."""
    clean_token = token.strip()
    query = """
        SELECT o.*, h.name AS hospital_name,
               json_agg(json_build_object(
                   'id', i.id,
                   'medicineId', i.medicine_id,
                   'name', i.name,
                   'dosage', i.dosage,
                   'frequency', i.frequency,
                   'duration', i.duration,
                   'quantity', i.quantity,
                   'unitPrice', i.unit_price,
                   'lineTotal', i.line_total,
                   'instructions', i.instructions
               )) AS items
        FROM pharmacy_counter_orders o
        LEFT JOIN hospital_tieups h ON h.id = o.hospital_id
        LEFT JOIN pharmacy_counter_order_items i ON i.order_id = o.id
        WHERE (o.public_id ILIKE $1 OR CAST(o.id AS TEXT) = $1)
    """
    params: list[Any] = [clean_token]
    if hospital_id:
        query += " AND o.hospital_id = $2"
        params.append(hospital_id)

    query += " GROUP BY o.id, h.name LIMIT 1"
    row = await db.fetch_row(query, *params)
    if not row:
        return None
    r = dict(row)
    return {
        "id": r["id"],
        "token": r["public_id"],
        "consultationId": r.get("consultation_id"),
        "hospitalId": r["hospital_id"],
        "hospitalName": r.get("hospital_name") or "Hospital Pharmacy",
        "patientName": r["patient_name"],
        "patientPhone": r.get("patient_phone") or "",
        "doctorName": r.get("doctor_name") or "Doctor",
        "doctorSpecialty": r.get("doctor_specialty") or "General Medicine",
        "status": r["status"],
        "paymentStatus": r["payment_status"],
        "paymentMethod": r.get("payment_method") or "cash",
        "amountTotal": float(r["amount_total"]) if r.get("amount_total") is not None else 0.0,
        "items": r.get("items") or [],
        "createdAt": r["created_at"].isoformat() if r.get("created_at") else None,
        "notes": r.get("notes") or "",
    }


async def update_counter_order_status(order_id: int, hospital_id: int, new_status: str) -> dict:
    """Move order to packing or ready status."""
    valid_statuses = ("received", "packing", "ready", "cancelled")
    if new_status not in valid_statuses:
        return {"success": False, "message": f"Invalid status: {new_status}"}

    row = await db.fetch_row(
        """
        UPDATE pharmacy_counter_orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND hospital_id = $3
        RETURNING *
        """,
        new_status, order_id, hospital_id,
    )
    if not row:
        return {"success": False, "message": "Order not found"}

    # Socket broadcast
    try:
        from app.services import socket_service
        sio = getattr(socket_service, "sio", None)
        if sio:
            payload = {"orderId": order_id, "token": row["public_id"], "status": new_status}
            await sio.emit("counter_order_updated", payload, room=f"hospital_pharmacy:{hospital_id}")
            if row.get("consultation_id"):
                await sio.emit("pharmacy_order_status", payload, room=f"patient_rx:{row['consultation_id']}")
    except Exception:
        pass

    return {"success": True, "status": new_status, "message": f"Order marked as {new_status}"}


async def dispense_counter_order(
    order_id: int, hospital_id: int, payment_method: str, staff_id: int | None = None
) -> dict:
    """Dispense medicines at counter: marks paid & dispensed, and deducts inventory stock."""
    row = await db.fetch_row(
        "SELECT * FROM pharmacy_counter_orders WHERE id = $1 AND hospital_id = $2",
        order_id, hospital_id,
    )
    if not row:
        return {"success": False, "message": "Order not found"}

    if row["status"] == "dispensed":
        return {"success": False, "message": "Order has already been dispensed"}

    # 1. Deduct stock for each line item in hospital inventory
    items = await db.query(
        "SELECT * FROM pharmacy_counter_order_items WHERE order_id = $1",
        order_id,
    )
    for it in items:
        med_id = it.get("medicine_id")
        qty = int(it.get("quantity") or 1)
        if med_id:
            await db.execute(
                """
                UPDATE pharmacy_medicines
                SET stock = GREATEST(0, stock - $1), updated_at = NOW()
                WHERE id = $2 AND hospital_id = $3
                """,
                qty, med_id, hospital_id,
            )

    # 2. Mark order as dispensed and paid
    method = payment_method if payment_method in ("counter_upi", "cash") else "cash"
    updated = await db.fetch_row(
        """
        UPDATE pharmacy_counter_orders
        SET status = 'dispensed',
            payment_status = 'paid',
            payment_method = $1,
            dispensed_at = NOW(),
            dispensed_by = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
        """,
        method, staff_id, order_id,
    )

    # 3. Socket broadcast
    try:
        from app.services import socket_service
        sio = getattr(socket_service, "sio", None)
        if sio:
            payload = {
                "orderId": order_id,
                "token": updated["public_id"],
                "status": "dispensed",
                "paymentStatus": "paid",
                "paymentMethod": method,
            }
            await sio.emit("counter_order_updated", payload, room=f"hospital_pharmacy:{hospital_id}")
            if updated.get("consultation_id"):
                await sio.emit("pharmacy_order_status", payload, room=f"patient_rx:{updated['consultation_id']}")
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Order {updated['public_id']} dispensed successfully via {method.upper()}",
        "data": dict(updated),
    }


async def get_patient_prescriptions_with_counter_orders(user_id: int) -> list[dict]:
    """Retrieve patient's doctor prescriptions with real-time counter status and pickup passes."""
    rows = await db.query(
        """
        SELECT c.id AS consultation_id, c.appointment_id, c.prescription, c.created_at AS consult_date,
               a.hospital_id, a.doctor_data,
               h.name AS hospital_name, h.address AS hospital_address,
               o.id AS order_id, o.public_id AS token, o.status AS order_status,
               o.payment_status, o.payment_method, o.amount_total, o.dispensed_at
        FROM consultations c
        JOIN appointments a ON a.id = c.appointment_id
        LEFT JOIN hospital_tieups h ON h.id = a.hospital_id
        LEFT JOIN pharmacy_counter_orders o ON o.consultation_id = c.id
        WHERE a.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT 50
        """,
        user_id,
    )

    prescriptions = []
    for r in rows:
        r = dict(r)
        cid = int(r["consultation_id"])
        
        # Line items
        from app.models import prescription_item_model
        items = await prescription_item_model.list_for_consultation(cid)
        doc_data = r.get("doctor_data") or {}

        # If counter order items exist, fetch priced items
        priced_items = []
        if r.get("order_id"):
            oi = await db.query(
                "SELECT * FROM pharmacy_counter_order_items WHERE order_id = $1",
                r["order_id"],
            )
            priced_items = [
                {
                    "name": i["name"],
                    "dosage": i.get("dosage") or "1 tab",
                    "frequency": i.get("frequency") or "Twice daily",
                    "duration": i.get("duration") or "3 days",
                    "quantity": int(i.get("quantity") or 1),
                    "unitPrice": float(i.get("unit_price") or 0.0),
                    "lineTotal": float(i.get("line_total") or 0.0),
                }
                for i in oi
            ]
        else:
            priced_items = [
                {
                    "name": i.get("name") or "Medicine",
                    "dosage": i.get("dosage") or "1 tab",
                    "frequency": i.get("frequency") or "Twice daily",
                    "duration": i.get("duration") or "3 days",
                    "quantity": int(i.get("quantity") or 1),
                    "unitPrice": 40.00,
                    "lineTotal": 40.00 * int(i.get("quantity") or 1),
                }
                for i in items
            ]

        token = r.get("token") or f"RX-{cid:04d}"
        status = r.get("order_status") or "received"

        prescriptions.append({
            "consultationId": cid,
            "appointmentId": r["appointment_id"],
            "hospitalId": r.get("hospital_id"),
            "hospitalName": r.get("hospital_name") or "Hospital In-House Pharmacy",
            "hospitalAddress": r.get("hospital_address") or "Hospital Main Campus",
            "doctorName": doc_data.get("name") or "Hospital Doctor",
            "doctorSpecialty": doc_data.get("specialty") or "General Medicine",
            "prescriptionNotes": r.get("prescription") or "",
            "date": r["consult_date"].strftime("%d %b %Y, %I:%M %p") if r.get("consult_date") else "",
            "orderId": r.get("order_id"),
            "token": token,
            "status": status,
            "paymentStatus": r.get("payment_status") or "pending",
            "paymentMethod": r.get("payment_method") or "cash",
            "totalAmount": float(r.get("amount_total") or sum(it["lineTotal"] for it in priced_items)),
            "items": priced_items,
        })

    return prescriptions
