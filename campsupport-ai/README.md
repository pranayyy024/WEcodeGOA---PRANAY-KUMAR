# campsupport-ai

This repository contains a starter structure for a campus support AI project with a React/Next.js frontend and a FastAPI backend.

## Clone the project

```bash
git clone https://github.com/pranayyy024/WEcodeGOA---PRANAY-KUMAR.git
cd WEcodeGOA---PRANAY-KUMAR
```

## Project structure

- frontend: Next.js app shell for the chat widget and ticket views
- backend: FastAPI service for API endpoints and orchestration modules

## Run the backend

```bash
cd campsupport-ai/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be available at http://127.0.0.1:8000.

## Run the frontend

```bash
cd campsupport-ai/frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## Notes

This is a starter scaffold. You can extend the frontend components, API routes, and LangGraph workflow as the project grows.
