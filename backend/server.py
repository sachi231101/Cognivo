"""Business Brain — multi-tenant B2B AI knowledge assistant."""
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from auth_utils import (
    create_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from doc_parser import chunk_text, extract_text, score_chunk
from seed import seed_demo_company

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ─────────────── DB ───────────────
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

DEPARTMENTS = ["HR", "Finance", "Sales", "Marketing", "Engineering", "Operations"]

app = FastAPI(title="Business Brain")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger("business-brain")
logging.basicConfig(level=logging.INFO)


# ─────────────── Models ───────────────
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SignupRequest(BaseModel):
    company_name: str
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class InviteSignupRequest(BaseModel):
    token: str
    name: str
    password: str = Field(min_length=6)


class CreateInviteRequest(BaseModel):
    email: EmailStr


class ChatRequest(BaseModel):
    message: str
    department: Optional[str] = None  # None = all departments


# ─────────────── Helpers ───────────────
def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u["name"],
        "role": u["role"],
        "company_id": u["company_id"],
    }


def public_doc(d: dict) -> dict:
    return {
        "id": d["id"],
        "name": d["name"],
        "department": d["department"],
        "size_bytes": d.get("size_bytes", 0),
        "created_at": d.get("created_at"),
        "uploaded_by": d.get("uploaded_by"),
    }


async def get_company(company_id: str) -> dict:
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


# ─────────────── Auth Routes ───────────────
@api_router.post("/auth/signup")
async def signup(payload: SignupRequest):
    """Sign up as admin and create a new company workspace."""
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    company_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    now = now_iso()

    await db.companies.insert_one({
        "id": company_id,
        "name": payload.company_name,
        "created_at": now,
    })

    user_doc = {
        "id": user_id,
        "company_id": company_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "role": "admin",
        "created_at": now,
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, company_id, "admin")
    return {
        "token": token,
        "user": public_user(user_doc),
        "company": {"id": company_id, "name": payload.company_name},
    }


@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    company = await get_company(user["company_id"])
    token = create_token(user["id"], user["company_id"], user["role"])
    return {
        "token": token,
        "user": public_user(user),
        "company": {"id": company["id"], "name": company["name"]},
    }


@api_router.get("/auth/me")
async def me(user_jwt: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_jwt["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    company = await get_company(user["company_id"])
    return {"user": public_user(user), "company": {"id": company["id"], "name": company["name"]}}


# ─────────────── Invite Routes ───────────────
@api_router.post("/invites")
async def create_invite(payload: CreateInviteRequest, admin: dict = Depends(require_admin)):
    """Admin creates an invite link for an employee."""
    email = payload.email.lower()
    # Optional: check if user already exists
    existing = await db.users.find_one({"email": email, "company_id": admin["company_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="User already in this workspace")

    token = uuid.uuid4().hex
    await db.invites.insert_one({
        "id": str(uuid.uuid4()),
        "token": token,
        "email": email,
        "company_id": admin["company_id"],
        "invited_by": admin["user_id"],
        "accepted": False,
        "created_at": now_iso(),
    })
    return {"token": token, "email": email}


@api_router.get("/invites/{token}")
async def get_invite(token: str):
    invite = await db.invites.find_one({"token": token}, {"_id": 0})
    if not invite or invite.get("accepted"):
        raise HTTPException(status_code=404, detail="Invite not found or already used")
    company = await get_company(invite["company_id"])
    return {"email": invite["email"], "company_name": company["name"]}


@api_router.post("/invites/accept")
async def accept_invite(payload: InviteSignupRequest):
    invite = await db.invites.find_one({"token": payload.token})
    if not invite or invite.get("accepted"):
        raise HTTPException(status_code=404, detail="Invite not found or already used")

    existing_user = await db.users.find_one({"email": invite["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "company_id": invite["company_id"],
        "email": invite["email"],
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "role": "employee",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    await db.invites.update_one(
        {"token": payload.token},
        {"$set": {"accepted": True, "accepted_at": now_iso(), "user_id": user_id}},
    )
    company = await get_company(invite["company_id"])
    token = create_token(user_id, invite["company_id"], "employee")
    return {
        "token": token,
        "user": public_user(user_doc),
        "company": {"id": company["id"], "name": company["name"]},
    }


# ─────────────── Employees ───────────────
@api_router.get("/employees")
async def list_employees(admin: dict = Depends(require_admin)):
    users = await db.users.find(
        {"company_id": admin["company_id"]}, {"_id": 0, "password_hash": 0}
    ).to_list(500)
    invites = await db.invites.find(
        {"company_id": admin["company_id"], "accepted": False}, {"_id": 0}
    ).to_list(500)
    return {
        "members": [
            {"id": u["id"], "email": u["email"], "name": u["name"], "role": u["role"], "created_at": u.get("created_at")}
            for u in users
        ],
        "pending_invites": [
            {"id": i["id"], "email": i["email"], "token": i["token"], "created_at": i.get("created_at")}
            for i in invites
        ],
    }


@api_router.delete("/employees/{user_id}")
async def remove_employee(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    res = await db.users.delete_one(
        {"id": user_id, "company_id": admin["company_id"], "role": "employee"}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"success": True}


# ─────────────── Documents ───────────────
@api_router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    department: str = Form(...),
    admin: dict = Depends(require_admin),
):
    if department not in DEPARTMENTS:
        raise HTTPException(status_code=400, detail="Invalid department")

    content_bytes = await file.read()
    if len(content_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 15 MB)")

    text = extract_text(file.filename or "doc.txt", content_bytes)
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Could not extract any text from file")

    doc_id = str(uuid.uuid4())
    await db.documents.insert_one({
        "id": doc_id,
        "company_id": admin["company_id"],
        "name": file.filename,
        "department": department,
        "content": text,
        "chunks": chunks,
        "size_bytes": len(content_bytes),
        "uploaded_by": admin["user_id"],
        "created_at": now_iso(),
    })
    doc = await db.documents.find_one({"id": doc_id}, {"_id": 0, "content": 0, "chunks": 0})
    return public_doc(doc)


@api_router.get("/documents")
async def list_documents(
    department: Optional[str] = None,
    user_jwt: dict = Depends(get_current_user),
):
    query = {"company_id": user_jwt["company_id"]}
    if department and department != "All":
        query["department"] = department
    docs = await db.documents.find(query, {"_id": 0, "content": 0, "chunks": 0}).sort(
        "created_at", -1
    ).to_list(500)
    return [public_doc(d) for d in docs]


@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, admin: dict = Depends(require_admin)):
    res = await db.documents.delete_one({"id": doc_id, "company_id": admin["company_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True}


# ─────────────── Dashboard ───────────────
@api_router.get("/dashboard/stats")
async def dashboard_stats(admin: dict = Depends(require_admin)):
    company_id = admin["company_id"]
    total_docs = await db.documents.count_documents({"company_id": company_id})
    total_questions = await db.chats.count_documents({"company_id": company_id})
    total_members = await db.users.count_documents({"company_id": company_id})
    pending = await db.invites.count_documents({"company_id": company_id, "accepted": False})

    # by department
    by_dept = {}
    for dept in DEPARTMENTS:
        by_dept[dept] = await db.documents.count_documents(
            {"company_id": company_id, "department": dept}
        )

    recent_chats = await db.chats.find(
        {"company_id": company_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(10)

    # enrich with user name
    user_ids = list({c["user_id"] for c in recent_chats})
    users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "name": 1}).to_list(50)
    user_map = {u["id"]: u["name"] for u in users}
    for c in recent_chats:
        c["user_name"] = user_map.get(c["user_id"], "Unknown")

    return {
        "total_documents": total_docs,
        "total_questions": total_questions,
        "total_members": total_members,
        "pending_invites": pending,
        "by_department": by_dept,
        "recent_activity": recent_chats,
    }


# ─────────────── Chat / LLM ───────────────
def _keywords(text: str) -> list[str]:
    stop = {
        "the", "is", "are", "what", "how", "do", "i", "to", "a", "of", "for",
        "in", "on", "and", "or", "can", "with", "my", "an", "be", "have", "this",
        "that", "it", "from", "by", "we", "you", "me", "us", "your", "our",
        "at", "as", "if", "but", "not", "no", "yes", "any", "all",
    }
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return [w for w in words if len(w) > 2 and w not in stop]


async def _select_context(company_id: str, department: Optional[str], question: str):
    """Pick top-scoring chunks across all relevant docs for the question."""
    query = {"company_id": company_id}
    if department and department != "All":
        query["department"] = department
    docs = await db.documents.find(query, {"_id": 0}).to_list(200)

    kws = _keywords(question)
    scored = []
    for d in docs:
        for idx, chunk in enumerate(d.get("chunks", [])):
            s = score_chunk(chunk, kws)
            # baseline so we always include some context even without keyword match
            scored.append((s + 1, d, idx, chunk))

    # sort highest score first
    scored.sort(key=lambda x: x[0], reverse=True)

    # take top 6 chunks, ensuring source diversity
    selected = []
    seen_docs = {}
    for score, d, idx, chunk in scored:
        if len(selected) >= 6:
            break
        seen_docs.setdefault(d["id"], 0)
        if seen_docs[d["id"]] >= 3:
            continue
        seen_docs[d["id"]] += 1
        selected.append({
            "doc_id": d["id"],
            "doc_name": d["name"],
            "department": d["department"],
            "chunk_index": idx,
            "text": chunk,
        })
    return selected, docs


@api_router.post("/chat")
async def chat(payload: ChatRequest, user_jwt: dict = Depends(get_current_user)):
    company_id = user_jwt["company_id"]
    context_chunks, all_docs = await _select_context(
        company_id, payload.department, payload.message
    )

    if not all_docs:
        answer = (
            "I couldn't find this in your company knowledge base. "
            "Please check with your manager or ask admin to upload the relevant document."
        )
        sources = []
    else:
        context_text = "\n\n".join(
            f"[Source #{i+1}] Document: {c['doc_name']} (Department: {c['department']})\n{c['text']}"
            for i, c in enumerate(context_chunks)
        )
        system_message = (
            "You are Business Brain, an internal AI assistant for a company. "
            "Answer the employee's question ONLY using the provided company documents below. "
            "Be concise, accurate, and professional. "
            "Always cite the source document name in your answer (e.g., 'According to HR Policy...'). "
            "If the answer is NOT in the documents, reply exactly: "
            "\"I couldn't find this in your company knowledge base. Please check with your manager or ask admin to upload the relevant document.\"\n\n"
            f"=== COMPANY DOCUMENTS ===\n{context_text}\n=== END DOCUMENTS ==="
        )
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage

            chat_client = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"bb-{user_jwt['user_id']}-{uuid.uuid4().hex[:8]}",
                system_message=system_message,
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")

            answer = await chat_client.send_message(UserMessage(text=payload.message))
            if not isinstance(answer, str):
                answer = str(answer)
        except Exception as e:
            logger.exception("LLM call failed: %s", e)
            raise HTTPException(status_code=500, detail=f"AI service error: {e}")

        # build unique sources list
        seen = set()
        sources = []
        for c in context_chunks:
            if c["doc_id"] in seen:
                continue
            seen.add(c["doc_id"])
            sources.append({
                "doc_id": c["doc_id"],
                "doc_name": c["doc_name"],
                "department": c["department"],
            })

    # save chat history
    chat_id = str(uuid.uuid4())
    await db.chats.insert_one({
        "id": chat_id,
        "company_id": company_id,
        "user_id": user_jwt["user_id"],
        "question": payload.message,
        "answer": answer,
        "department": payload.department,
        "sources": sources,
        "created_at": now_iso(),
    })
    return {"id": chat_id, "answer": answer, "sources": sources}


@api_router.get("/chat/history")
async def chat_history(user_jwt: dict = Depends(get_current_user)):
    chats = await db.chats.find(
        {"company_id": user_jwt["company_id"], "user_id": user_jwt["user_id"]},
        {"_id": 0},
    ).sort("created_at", -1).limit(50).to_list(50)
    return list(reversed(chats))


@api_router.get("/departments")
async def get_departments():
    return DEPARTMENTS


@api_router.get("/")
async def root():
    return {"message": "Business Brain API"}


# ─────────────── App wiring ───────────────
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.companies.create_index("id", unique=True)
    await db.documents.create_index([("company_id", 1), ("department", 1)])
    await db.invites.create_index("token", unique=True)
    await db.chats.create_index([("company_id", 1), ("created_at", -1)])

    # Seed demo workspace
    try:
        res = await seed_demo_company(db)
        logger.info(f"Seed result: {res}")
    except Exception as e:
        logger.warning(f"Seed failed: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
