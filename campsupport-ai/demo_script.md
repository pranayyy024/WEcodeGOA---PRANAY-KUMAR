# 🏆 CampSupport AI — 3-Minute Hackathon Winning Demo Script

> **Target Duration**: 3 Minutes  
> **Target Audience**: Hackathon Judges & Technical Reviewers  
> **Key Value Proposition**: Zero-Speculation RAG Grounding + LangGraph Guided Escalation + MongoDB Atlas Cloud Persistence

---

## 🎙️ Section 1: The Hook & The Campus Problem (0:00 – 0:35)

**[Speaker 1 / Team Lead]**:
> *"Hello Judges! We are presenting **CampSupport AI**, our full-stack autonomous helpdesk built specifically for university campuses.*
>
> *Every semester, campus administration is overwhelmed by thousands of repetitive emails asking about Wi-Fi setups, exam attendance rules, and hostel repairs. While students wait days for replies, critical emergency tickets get buried in generic inboxes.*
>
> *Existing AI chatbots are dangerous for campus policies because they **hallucinate** or invent rules. We built **CampSupport AI** to solve this using **Zero-Speculation RAG** and deterministic **LangGraph orchestration**."*

---

## 💻 Section 2: Zero-Speculation RAG & Grounded Chat Demo (0:35 – 1:30)

**[Action]**: Open web browser to **`http://localhost:3000/`** (Helpdesk Chat).

**[Speaker 2]**:
> *"Let's see it in action. Here is our student helpdesk interface.*
>
> *First, let's ask a campus policy question:*
> **[Action: Click 'How do I connect to campus Wi-Fi in Block B?']**
>
> *Notice how fast our FastAPI + LlamaIndex engine retrieves the exact approved Standard Operating Procedure from our knowledge base. Look at this badge:* **`[Source: wifi_email_sop.txt - 85% Match]`**.
>
> *When we click it* **[Action: Click Citation Badge]**, *students and administrators can see the exact verified paragraph from the official campus policy, including the confidence grounding score. CampSupport AI is mathematically constrained to **never speculate**."*

---

## ⚡ Section 3: LangGraph Guided Escalation & Auto-Routing (1:30 – 2:15)

**[Speaker 1]**:
> *"Now what happens when a student reports an actual maintenance issue? Let's type:*
> **`"There is an electrical repair fault in Hostel Block A room light"`**
> **[Action: Send message]**
>
> *Unlike standard chatbots that just say 'I reported it', our **LangGraph state machine** detects that a hostel repair requires two mandatory details: **Room Number** and **Hostel Block**.*
>
> *Look right here:* **[Action: Point to inline Detail Collector Form]**. *It renders an interactive inline form directly inside the chat bubble!*
>
> *Let's enter Room `204` and click Submit.* **[Action: Submit form]**  
> *Instantly, CampSupport AI creates a formal support ticket—**`#TICK-1002`**—and automatically routes it to **Hostel Admin** without requiring a human dispatcher!"*

---

## 🏛️ Section 4: Admin Analytics & MongoDB Atlas Dashboard (2:15 – 3:00)

**[Action]**: Click **"Tickets Dashboard"** (`/tickets`) in the top navigation bar.

**[Speaker 2]**:
> *"Let's click over to our **Tickets Dashboard**. Here, campus staff can see every ticket automatically sorted by department—whether it's **Campus IT**, **Academic Registrar**, or **Hostel Admin**—with live status tracking stored in our cloud **MongoDB Atlas** database.*
>
> **[Action: Click 'Admin Knowledge Base' (`/admin`)]**
>
> *Finally, our **Admin Knowledge Base Dashboard** gives campus leadership complete oversight: tracking our **96.4% RAG grounding accuracy**, inspecting indexed SOP files, and even testing vector retrieval in our live sandbox.*
>
> *CampSupport AI delivers instant answers to students, zero workload waste for staff, and 100% verified policy compliance. Thank you!"*

---

## 🛠️ Pre-Demo Checklist for the Team

1. [ ] Check `.env` in `backend/` has `OPENAI_API_KEY` and `MONGODB_URL` configured.
2. [ ] Launch FastAPI Backend:  
   ```powershell
   cd campsupport-ai\backend
   python -m uvicorn main:app --port 8000
   ```
3. [ ] Launch Next.js Frontend:  
   ```powershell
   cd campsupport-ai\frontend
   npm run dev -- -p 3000
   ```
4. [ ] Open browser to **http://localhost:3000** and set zoom to 100% for crisp glassmorphism rendering!
