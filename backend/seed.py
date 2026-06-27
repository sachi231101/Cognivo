"""Seed Acme Corp India demo workspace (idempotent, refreshes if old data exists)."""
import uuid
from datetime import datetime, timezone

from auth_utils import hash_password
from doc_parser import chunk_text

DEMO_COMPANY = "Acme Corp India"
DEMO_SLUG = "acme-corp-india"
DEMO_ADMIN_EMAIL = "admin@acmecorp.in"
DEMO_ADMIN_PASSWORD = "Admin@123"
DEMO_EMPLOYEE_EMAIL = "employee@acmecorp.in"
DEMO_EMPLOYEE_PASSWORD = "Employee@123"

SAMPLE_DOCS = [
    {
        "name": "HR Policy Handbook.txt",
        "department": "HR",
        "content": """ACME CORP INDIA — HR POLICY HANDBOOK

LEAVE POLICY
- Annual paid leave: 18 days per year for all full-time employees.
- Sick leave: 10 days per year, doctor's certificate required after 3 consecutive days.
- Maternity leave: 26 weeks of fully-paid leave.
- Paternity leave: 5 days of fully-paid leave.
- Leave applications must be submitted via the HR portal at least 5 working days in advance, except for emergencies.

WORK FROM HOME POLICY
- Employees are allowed to work from home up to 2 days per week.
- Prior approval from the line manager is required.
- A stable internet connection and quiet workspace are mandatory.

EXPENSE & REIMBURSEMENT POLICY
- Expenses under INR 5,000 can be self-approved by the employee.
- Expenses above INR 5,000 require approval from the line manager.
- Maximum expense reimbursement per month: INR 10,000.
- All expense claims must be submitted within 7 days with valid receipts.

OFFICE HOURS
- 9:00 AM to 6:00 PM IST, Monday to Friday.
- Lunch break: 1:00 PM to 2:00 PM IST.

CODE OF CONDUCT
- Dress code: smart casual; business formal during client meetings.
- Zero tolerance for harassment of any kind.
""",
    },
    {
        "name": "Sales SOP.txt",
        "department": "Sales",
        "content": """ACME CORP INDIA — SALES STANDARD OPERATING PROCEDURE

CRM TOOL
- The official CRM used is Salesforce.
- All leads, opportunities and customer interactions must be logged in Salesforce within 24 hours.

QUOTATION PROCESS
- Quotations must be sent within 24 hours of customer inquiry.
- All quotations must include GST and follow the standard Quote Template v3.2.
- Validity of every quotation is 15 days unless explicitly extended.

DISCOUNT POLICY
- Maximum discount allowed without approval: 10%.
- Any discount above 10% requires CEO approval (no exceptions).

FOLLOW-UP RHYTHM
- Follow up with active leads every 3 days.
- Mark leads as cold after 30 days of no response.

CLIENT ONBOARDING
- Client onboarding is completed within 7 days of signed contract.
- Welcome email goes out within 24 hours of contract signing.

PAYMENT TERMS
- 50% advance, 50% on delivery for new clients.
- Net 30 for repeat clients with CFO approval.
""",
    },
    {
        "name": "Finance Process.txt",
        "department": "Finance",
        "content": """ACME CORP INDIA — FINANCE PROCESS DOCUMENT

GST FILING
- GSTR-1 filing deadline: 11th of every month.
- GSTR-3B filing deadline: 20th of every month.
- All input tax credits reconciled monthly against GSTR-2A/2B.

INVOICE GENERATION
- Invoices must be generated within 24 hours of payment received.
- Every invoice must include GSTIN, PAN, HSN/SAC codes and a unique invoice number.

REIMBURSEMENT
- All reimbursement claims must be submitted within 7 days with valid receipts.
- Reimbursements are processed in the next payroll cycle.

VENDOR PAYMENTS
- Vendor payments are processed every Friday.
- Net 30 payment terms unless otherwise agreed.

PURCHASE ORDERS
- Minimum purchase order value: INR 25,000.
- POs above INR 5 lakh require CFO approval.

CONTACT
- Finance team email: finance@acmecorp.in
""",
    },
]


async def seed_demo_company(db) -> dict:
    """Create / refresh demo company. Drops old 'Acme Corp' if present."""
    # Clean up legacy demo if exists
    legacy = await db.companies.find_one({"name": "Acme Corp"})
    if legacy:
        cid = legacy["id"]
        await db.users.delete_many({"company_id": cid})
        await db.documents.delete_many({"company_id": cid})
        await db.chats.delete_many({"company_id": cid})
        await db.invites.delete_many({"company_id": cid})
        await db.companies.delete_one({"id": cid})

    existing = await db.companies.find_one({"name": DEMO_COMPANY})
    if existing:
        return {"seeded": False, "reason": "demo already exists"}

    now = datetime.now(timezone.utc).isoformat()
    company_id = str(uuid.uuid4())
    admin_id = str(uuid.uuid4())
    employee_id = str(uuid.uuid4())

    await db.companies.insert_one({
        "id": company_id,
        "name": DEMO_COMPANY,
        "slug": DEMO_SLUG,
        "created_at": now,
    })

    await db.users.insert_many([
        {
            "id": admin_id,
            "company_id": company_id,
            "email": DEMO_ADMIN_EMAIL,
            "name": "Acme Admin",
            "password_hash": hash_password(DEMO_ADMIN_PASSWORD),
            "role": "admin",
            "created_at": now,
        },
        {
            "id": employee_id,
            "company_id": company_id,
            "email": DEMO_EMPLOYEE_EMAIL,
            "name": "Acme Employee",
            "password_hash": hash_password(DEMO_EMPLOYEE_PASSWORD),
            "role": "employee",
            "created_at": now,
        },
    ])

    for d in SAMPLE_DOCS:
        doc_id = str(uuid.uuid4())
        chunks = chunk_text(d["content"])
        await db.documents.insert_one({
            "id": doc_id,
            "company_id": company_id,
            "name": d["name"],
            "department": d["department"],
            "type": "txt",
            "content": d["content"],
            "chunks": chunks,
            "size_bytes": len(d["content"].encode("utf-8")),
            "uploaded_by": admin_id,
            "created_at": now,
        })

    return {
        "seeded": True,
        "company_id": company_id,
        "admin_email": DEMO_ADMIN_EMAIL,
        "employee_email": DEMO_EMPLOYEE_EMAIL,
    }
