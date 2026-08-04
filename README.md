# 🎓 CampSupport AI — RAG-Powered Institutional Campus Helpdesk

> **WEcode GOA Hackathon Submission · Pranay Kumar**  
> An AI-powered Campus Support System built as a module inside a college ERP/website — not a standalone app, but an official institutional portal for students, faculty, and administrators.

---

## 🌟 What is CampSupport AI?

CampSupport AI is an intelligent, RAG (Retrieval-Augmented Generation) powered campus helpdesk that gives students, faculty, and administrators **instant, source-cited answers** from official college documents — and automatically escalates unresolved queries as structured support tickets stored in **MongoDB Atlas**.

### Key Features
- 🤖 **AI Helpdesk Chat** — Answers grounded in official campus policies (Wi-Fi SOPs, dress codes, syllabus, attendance rules, fee structures, hostel regulations, and more)
- 📄 **RAG Citation Engine** — Every AI answer cites its exact source document and match confidence score
- 🎫 **Support Ticket System** — Students can raise tickets from the AI Chat or the My Tickets page; all tickets persist in MongoDB Atlas
- 🔐 **Role-Based Portal** — Separate authenticated experiences for Students, Faculty & Staff, and Administrators
- 📚 **Admin Knowledge Base** — Administrators can upload new policy documents that instantly re-index the AI's knowledge base (live RAG update, no restart needed)
- 📊 **Admin Dashboard** — Full overview of pending tickets, resolved requests, and indexed documents

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python), Uvicorn ASGI |
| **AI/RAG** | LlamaIndex · LangGraph · LangChain |
| **LLM** | OpenAI GPT-4o Mini |
| **Embeddings** | OpenAI `text-embedding-3-small` |
| **Database (Tickets)** | MongoDB Atlas |
| **Database (Auth + KB)** | SQLite (`admins.db`) |
| **Knowledge Base** | 19 JSON datasets + 3 SOP `.txt` files in `data/approved_docs/` |

---

## 📁 Project Structure

```
WEcodeGOA---PRANAY-KUMAR/
└── campsupport-ai/
    ├── backend/                   # FastAPI backend
    │   ├── main.py                # App entrypoint with CORS
    │   ├── requirements.txt
    │   ├── data/
    │   │   └── approved_docs/     # 22 official campus knowledge base documents
    │   └── app/
    │       ├── api/v1/            # REST API endpoints
    │       │   ├── chat.py        # AI Chat endpoint
    │       │   ├── tickets.py     # Ticket CRUD → MongoDB Atlas
    │       │   ├── kb.py          # Knowledge Base upload + RAG re-index
    │       │   └── auth.py        # Student/Faculty/Admin authentication
    │       ├── db/
    │       │   ├── mongodb.py     # MongoDB Atlas ticket store
    │       │   ├── kb_db.py       # SQLite knowledge base metadata
    │       │   └── auth_db.py     # SQLite auth management
    │       ├── langgraph/         # LangGraph RAG + escalation workflow
    │       │   ├── nodes.py       # understand → retrieve → verify → generate/escalate
    │       │   └── workflow.py    # StateGraph orchestration
    │       ├── llamaindex/
    │       │   └── retriever.py   # CampusRAGRetriever (singleton, live reload)
    │       └── schemas/           # Pydantic data models
    │
    └── frontend/                  # Next.js 14 institutional portal
        └── src/
            ├── app/
            │   ├── page.tsx                  # Role Selection Home
            │   ├── student/
            │   │   ├── auth/page.tsx          # Student login
            │   │   ├── dashboard/page.tsx     # Student dashboard
            │   │   └── tickets/page.tsx       # My Tickets (live from Atlas)
            │   ├── faculty/
            │   │   ├── auth/page.tsx
            │   │   └── dashboard/page.tsx
            │   ├── admin/
            │   │   ├── auth/page.tsx
            │   │   └── dashboard/page.tsx
            │   └── chat/page.tsx             # AI Helpdesk Chat
            └── components/
                ├── StudentDashboard.tsx       # Live recent tickets
                ├── FacultyDashboard.tsx
                ├── AdminDashboard.tsx         # KB upload + ticket management
                ├── ChatHelpdesk.tsx           # AI chat with RAG citations
                └── RoleAuthCard.tsx
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier)
- OpenAI API key

### 1. Clone the repo
```bash
git clone https://github.com/pranayyy024/WEcodeGOA---PRANAY-KUMAR.git
cd WEcodeGOA---PRANAY-KUMAR
```

### 2. Configure environment
```bash
cd campsupport-ai/backend
cp .env.example .env
# Edit .env and fill in:
# - OPENAI_API_KEY
# - DATABASE_URL (MongoDB Atlas connection string)
```

### 3. Start the Backend (FastAPI + RAG)
```bash
cd campsupport-ai/backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend live at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

### 4. Start the Frontend (Next.js)
```bash
cd campsupport-ai/frontend
npm install
npm run dev -- -p 3000
```
Portal live at: **http://localhost:3000**

---

## 🧠 How the AI Works

```
User Question
     ↓
[LangGraph Workflow]
     ↓
understand_query_node   → Detects intent (FAQ / IT_ISSUE / HOSTEL / ESCALATE)
     ↓
retrieve_docs_node      → CampusRAGRetriever queries LlamaIndex vector store
                          over 22 approved campus documents
     ↓
verify_answer_node      → Checks confidence score vs. threshold (0.75)
     ↓
     ├── High confidence → generate_answer_node → Full text from source doc
     └── Low confidence  → collect_details_node → create_ticket_node
                                                  → Saved to MongoDB Atlas
```

---

## 🎫 Ticket Flow

```
Student submits ticket (from /chat or /student/tickets)
     ↓
POST /api/v1/tickets  →  MongoDBTicketStore.save_ticket()
     ↓
MongoDB Atlas "campsupport" db → "tickets" collection
     ↓
Visible in:
  ✅ /student/tickets  (My Tickets — full list with status & staff replies)
  ✅ /student/dashboard (Recent Tickets — live top 3)
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | AI Helpdesk Chat, My Tickets (view + create), Dashboard |
| **Faculty & Staff** | AI Assistant, Report Issues, Support Requests, Payroll Info |
| **Administrator** | Full Ticket Management, Knowledge Base Upload, Activity Feed |

> ⚠️ Role security enforced: Students attempting to access `/admin` are automatically redirected to `/student/dashboard`.

---

## 📚 Knowledge Base Documents

The AI is grounded in **22 official campus documents** stored in `data/approved_docs/`:

- `faq.json` — General campus FAQs
- `rules_and_regulations.json` — Student code of conduct & dress code
- `wifi_email_sop.txt` — Campus Wi-Fi & email setup SOP
- `cse_syllabus_sem3.json` — CSE 3rd semester syllabus
- `fee_structure.json` — Fee structure & payment details
- `hostel_rules.json` — Hostel regulations
- `exam_schedule.json` — Examination timetable
- `scholarship_info.json` — Scholarship eligibility & process
- `library_rules.json` — Library regulations
- `lab_safety_guidelines.json` — Lab safety rules
- `sports_facilities.json` — Sports & recreation facilities
- `club_activities.json` — Student clubs & activities
- `canteen_menu.json` — Campus canteen menu & timings
- `transportation.json` — Campus bus routes & transport
- `placement_process.json` — Campus placement process
- `anti_ragging_policy.json` — Anti-ragging policy
- `grievance_redressal.json` — Grievance redressal process
- `medical_facilities.json` — Campus medical services
- `mental_health_support.json` — Mental health & counselling resources
- `it_infrastructure.json` — IT infrastructure & support
- `academic_calendar.json` — Academic calendar & holidays
- `faculty_resources.txt` — Faculty SOP & resources

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat` | AI Helpdesk query (RAG + LangGraph) |
| `GET` | `/api/v1/tickets` | List tickets (filter by `user_id`) |
| `POST` | `/api/v1/tickets` | Create new support ticket → Atlas |
| `PATCH` | `/api/v1/tickets/{id}/status` | Update ticket status |
| `GET` | `/api/v1/kb/documents` | List knowledge base documents |
| `POST` | `/api/v1/kb/upload` | Upload new document + trigger RAG re-index |
| `DELETE` | `/api/v1/kb/documents/{id}` | Remove document + reload AI index |
| `POST` | `/api/v1/auth/login` | Role-based authentication |

---

## 🧪 Running Tests

```bash
cd campsupport-ai/backend
python -m unittest tests/test_backend_flow.py
# Ran 7 tests in ~1.1s — OK
```

---

## 🎨 Design System

- **Primary**: `#7C3AED` (Institutional Purple)
- **Accent**: `#14B8A6` (Teal)
- **Background**: `#FAFAFC` (Off-white)
- **Cards**: `#FFFFFF` with `#E5E7EB` borders
- **Typography**: Geist (clean, modern, institutional)
- **Design Philosophy**: Clean, minimal, productivity-focused university portal — not a startup landing page
