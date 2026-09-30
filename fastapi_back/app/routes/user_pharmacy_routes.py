"""Patient pharmacy APIs — JWT auth only (never calls PharmaSync directly)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response

from app.middleware.auth import auth_user
from app.services import pharmacy_service
from app.services import hospital_pharmacy_service as hps

router = APIRouter(prefix="/api/user/pharmacy", tags=["User Pharmacy"])


from typing import Optional
from app.config.db import db


@router.get("/catalog")
async def get_patient_medicine_catalog(
    q: Optional[str] = None,
    category: Optional[str] = None,
    dosage_form: Optional[str] = None,
    hospital_id: Optional[int] = None,
    sort: Optional[str] = "popular",
    page: int = 1,
    limit: int = 30,
):
    """Public Medicine Catalog for Patient Web Store.
    Browse, search, and filter real medicines and pack box photos from verified hospital pharmacies.
    """
    offset = max(0, (page - 1) * limit)

    where_clauses = ["pm.is_active = true"]
    params = []
    param_idx = 1

    if q and q.strip():
        term = f"%{q.strip()}%"
        where_clauses.append(f"(pm.name ILIKE ${param_idx} OR pm.salt ILIKE ${param_idx} OR pm.brand ILIKE ${param_idx})")
        params.append(term)
        param_idx += 1

    if category and category.strip() and category.lower() != 'all':
        where_clauses.append(f"pm.category ILIKE ${param_idx}")
        params.append(category.strip())
        param_idx += 1

    if dosage_form and dosage_form.strip() and dosage_form.lower() != 'all':
        where_clauses.append(f"pm.dosage_form ILIKE ${param_idx}")
        params.append(dosage_form.strip())
        param_idx += 1

    if hospital_id:
        where_clauses.append(f"pm.hospital_id = ${param_idx}")
        params.append(int(hospital_id))
        param_idx += 1

    where_str = " AND ".join(where_clauses)

    # Sorting logic
    if sort == "price_asc":
        order_str = "price ASC"
    elif sort == "price_desc":
        order_str = "price DESC"
    elif sort == "discount":
        order_str = "discount_pct DESC"
    elif sort == "name":
        order_str = "name ASC"
    else:
        # Popular / Default
        order_str = "CASE WHEN image IS NOT NULL THEN 0 ELSE 1 END, total_stock DESC, name ASC"

    # Query distinct medicines grouped by name for clean product presentation
    catalog_query = f"""
        WITH grouped_meds AS (
            SELECT 
                MIN(pm.id) as id,
                pm.name,
                MIN(pm.brand) as brand,
                MIN(pm.salt) as salt,
                MIN(pm.category) as category,
                MIN(pm.dosage_form) as dosage_form,
                MIN(pm.strength) as strength,
                MAX(pm.mrp) as mrp,
                MIN(pm.price) as price,
                ROUND(MAX(CASE WHEN pm.mrp > pm.price AND pm.mrp > 0 THEN ((pm.mrp - pm.price) / pm.mrp) * 100 ELSE 0 END), 0) as discount_pct,
                SUM(pm.stock) as total_stock,
                MAX(pm.image) as image,
                BOOL_OR(pm.requires_rx) as requires_rx,
                COUNT(DISTINCT pm.hospital_id) as hospital_count,
                ARRAY_AGG(DISTINCT ht.name) FILTER (WHERE ht.name IS NOT NULL) as available_hospitals
            FROM pharmacy_medicines pm
            LEFT JOIN hospital_tieups ht ON pm.hospital_id = ht.id
            WHERE {where_str}
            GROUP BY pm.name
        )
        SELECT * FROM grouped_meds
        ORDER BY {order_str}
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """

    count_query = f"""
        SELECT COUNT(DISTINCT pm.name) as total
        FROM pharmacy_medicines pm
        WHERE {where_str}
    """

    data_params = list(params) + [limit, offset]
    medicines = await db.query(catalog_query, *data_params)
    total_row = await db.fetch_row(count_query, *params)
    total = total_row["total"] if total_row else 0

    # Extract distinct categories with counts for filter sidebar / chips
    cat_where = ["is_active = true", "category IS NOT NULL", "category != ''"]
    cat_params = []
    if hospital_id:
        cat_where.append("hospital_id = $1")
        cat_params.append(int(hospital_id))
    cat_where_str = " AND ".join(cat_where)

    cat_rows = await db.query(f"""
        SELECT category, COUNT(DISTINCT name) as count
        FROM pharmacy_medicines
        WHERE {cat_where_str}
        GROUP BY category
        ORDER BY count DESC
    """, *cat_params)

    # Extract hospitals
    hosp_rows = await db.query("""
        SELECT id, name, address FROM hospital_tieups ORDER BY name ASC
    """)

    return {
        "success": True,
        "medicines": [dict(m) for m in medicines],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit if limit else 1,
        "categories": [dict(c) for c in cat_rows],
        "hospitals": [dict(h) for h in hosp_rows],
    }


@router.get("/prescriptions")
async def list_prescriptions(user_id: int = Depends(auth_user)):
    data = await hps.get_patient_prescriptions_with_counter_orders(int(user_id))
    return {"success": True, "data": data}



@router.get("/counter-orders/{order_id}")
async def get_counter_order(order_id: int, user_id: int = Depends(auth_user)):
    order = await hps.lookup_order_by_token(str(order_id))
    if not order:
        return {"success": False, "message": "Order not found"}
    return {"success": True, "data": order}


@router.get("/search")
async def search_medicines(query: str = "", user_id: int = Depends(auth_user)):
    return await pharmacy_service.search_medicine_catalog(query)


@router.post("/availability")
async def probe_availability(req: Request, user_id: int = Depends(auth_user)):
    body = await req.json()
    return await pharmacy_service.probe_availability(int(user_id), body or {})



@router.get("/orders")
async def list_orders(user_id: int = Depends(auth_user)):
    return await pharmacy_service.list_patient_orders(int(user_id))


@router.get("/payments")
async def list_payments(user_id: int = Depends(auth_user)):
    return await pharmacy_service.list_patient_payments(int(user_id))


@router.get("/orders/{order_id}")
async def get_order(order_id: int, user_id: int = Depends(auth_user)):
    return await pharmacy_service.get_patient_order(int(user_id), order_id)


@router.post("/orders")
async def place_order(req: Request, user_id: int = Depends(auth_user)):
    body = await req.json()
    return await pharmacy_service.place_order(int(user_id), body or {})


@router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: int, req: Request, user_id: int = Depends(auth_user)):
    body = {}
    try:
        body = await req.json()
    except Exception:
        pass
    return await pharmacy_service.cancel_patient_order(
        int(user_id), order_id, (body or {}).get("reason"),
    )


@router.post("/orders/{order_id}/refill")
async def refill_order(order_id: int, user_id: int = Depends(auth_user)):
    return await pharmacy_service.refill_order(int(user_id), order_id)


@router.post("/orders/{order_id}/pay")
async def pay_order(order_id: int, user_id: int = Depends(auth_user)):
    return await pharmacy_service.create_pay_order(int(user_id), order_id)


@router.post("/orders/{order_id}/pay/verify")
async def verify_pay(order_id: int, req: Request, user_id: int = Depends(auth_user)):
    body = await req.json()
    return await pharmacy_service.verify_pharmacy_payment(
        int(user_id),
        order_id,
        str(body.get("razorpay_order_id") or body.get("razorpayOrderId") or ""),
        str(body.get("razorpay_payment_id") or body.get("razorpayPaymentId") or ""),
        str(body.get("razorpay_signature") or body.get("razorpaySignature") or ""),
    )


@router.get("/orders/{order_id}/invoice.pdf")
async def invoice_pdf(order_id: int, user_id: int = Depends(auth_user)):
    result = await pharmacy_service.build_invoice_pdf(int(user_id), order_id)
    if not result.get("success"):
        return result
    return Response(
        content=result["content"],
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{result["filename"]}"',
        },
    )
