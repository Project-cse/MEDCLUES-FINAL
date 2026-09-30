import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SPECIALTIES = [
    {
        "name": "General Physician",
        "phone": "1800-123-4567",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Cardiologist",
        "phone": "1800-123-4568",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Pediatricians",
        "phone": "1800-123-4569",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Dermatologist",
        "phone": "1800-123-4570",
        "availability": "Working Hours",
        "status": "Active"
    },
    {
        "name": "Gynecologist",
        "phone": "1800-123-4571",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Neurologist",
        "phone": "1800-123-4572",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Gastroenterologist",
        "phone": "1800-123-4573",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Orthopedics",
        "phone": "1800-123-4574",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "Ophthalmologist",
        "phone": "1800-123-4575",
        "availability": "Working Hours",
        "status": "Active"
    },
    {
        "name": "Psychiatrist",
        "phone": "1800-123-4576",
        "availability": "24x7",
        "status": "Active"
    },
    {
        "name": "ENT Specialist",
        "phone": "1800-123-4577",
        "availability": "Working Hours",
        "status": "Active"
    },
    {
        "name": "Dentistry",
        "phone": "1800-123-4578",
        "availability": "Working Hours",
        "status": "Active"
    }
]

async def run():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("DATABASE_URL not found!")
        return

    conn = await asyncpg.connect(db_url)
    try:
        # Delete junk load test records
        await conn.execute("DELETE FROM specialties WHERE specialty_name ~ '^Cardiology [0-9]+'")
        
        # Delete dummy/empty rows where helpline is null
        await conn.execute("DELETE FROM specialties WHERE helpline_number IS NULL")

        for item in SPECIALTIES:
            existing = await conn.fetchrow(
                "SELECT id FROM specialties WHERE LOWER(specialty_name) = LOWER($1)",
                item["name"]
            )
            if existing:
                await conn.execute(
                    "UPDATE specialties SET helpline_number = $1, availability = $2, status = $3 WHERE id = $4",
                    item["phone"], item["availability"], item["status"], existing["id"]
                )
            else:
                await conn.execute(
                    "INSERT INTO specialties (specialty_name, helpline_number, availability, status) VALUES ($1, $2, $3, $4)",
                    item["name"], item["phone"], item["availability"], item["status"]
                )

        rows = await conn.fetch("SELECT id, specialty_name, helpline_number, availability, status FROM specialties ORDER BY id ASC")
        print(f"Successfully configured {len(rows)} verified specialties:")
        for r in rows:
            print(f"  #{r['id']}: {r['specialty_name']} -> {r['helpline_number']} ({r['availability']}) [{r['status']}]")

    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
