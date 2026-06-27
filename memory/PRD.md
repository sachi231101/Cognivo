# Business Brain — Internal AI Knowledge Assistant (Multi-tenant B2B SaaS)

## Problem Statement
Build a B2B SaaS app where companies upload their knowledge docs and employees ask questions in plain English. Multi-tenant — each company is fully isolated workspace. Admin uploads docs, invites employees, employees chat. AI answers only from uploaded company documents.

## Architecture
- Backend: FastAPI + MongoDB (motor)
- Frontend: React + Tailwind + Shadcn UI
- Auth: JWT + bcrypt (custom email/password)
- LLM: Claude Sonnet 4.5 via emergentintegrations (EMERGENT_LLM_KEY)
- Document parsing: pypdf, python-docx, openpyxl

## What's been implemented (Feb 2026)
- Multi-tenant auth (signup creates workspace as admin; login; /me)
- Invite link flow (admin creates → shareable link → employee accepts → joins workspace as employee)
- Document upload: PDF/DOCX/TXT/XLSX with department tagging (HR/Finance/Sales/Marketing/Engineering/Operations)
- Knowledge base list: search, filter by dept, delete (admin only)
- Chat interface: ChatGPT-style UI, dept filter, source citation, "couldn't find" fallback
- Admin dashboard: 4 stat cards, recent questions activity, docs by department breakdown
- Employee management: members list, pending invites list with copy link, remove employee
- Landing page: hero + how-it-works + features grid + CTA + footer
- Seed demo workspace "Acme Corp" with 3 sample documents and 2 demo users on startup
- Role-based routing: admin → /dashboard, employee → /chat
- Mobile responsive sidebar (collapses to hamburger)

## User Personas
- Admin (HR Head / Owner): manages workspace, uploads knowledge, invites team
- Employee: asks questions in plain English, gets cited answers

## Backlog / Next
- P1: Email delivery for invites (Resend/SendGrid)
- P1: Streaming chat responses (SSE)
- P2: Full vector embeddings RAG for very large doc bases
- P2: Document update/versioning
- P2: Admin-side analytics: most-asked topics, knowledge gap detection
- P2: Pricing/billing (Stripe) to monetize
