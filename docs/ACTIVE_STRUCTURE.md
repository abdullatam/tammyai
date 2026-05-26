# Active Workspace Structure

The Tammy codebase has been successfully transformed into a modern, enterprise-grade monorepo. This separation of concerns significantly improves maintainability, debugging, and future scaling.

## Root Directories

### `/ai/` (Intelligence Core)
Contains all LLM interactions, prompts, context building, and RAG pipelines.
- `core/`: LLM clients, context builders, tool registries.
- `prompts/`: System prompts, admin prompt interfaces.
- `rag/`: Retrieval pipelines, embedding integration.

### `/backend/` (FastAPI Server & Services)
Contains the primary FastAPI application and all internal services.
- `server.py`: The main entry point for the API and static mounts.
- `auth/`: Identity, session, and admin authentication.
- `core_services/`: Memory routing, schedulers, file processing.
- `db/`: MongoDB, Redis, and Pinecone adapters.
- `intelligence/`: Internal state tracking (decisions, relationships, DNA, emotional threads).

### `/frontend/` (User Interface)
Contains all user-facing web code, isolated from backend logic.
- `public/`: Static HTML, CSS, logos (`index.html`, `admin_index.html`).
- `src/components/`: Reusable React components (Orb, Nav, etc.).
- `src/pages/`: Main application screens (Chat, Calendar, DNA, etc.).
- `src/admin/`: Admin dashboard pages.
- `data/`: Static configuration JSON/JS data.

### `/docs/` (Documentation)
- Contains Markdown files (like this one, READMEs, optimization reports).

### `/scripts/` (Utilities)
- Maintenance tools, cache cleaners, and database checkers.

### `/archive/` (Graveyard)
Contains deprecated code safely preserved.
- `deprecated-backend/`: Old CLI versions, Gradio implementations.
- `legacy-ui/`: Unused screens, older admin panel versions.
- `old-tests/`: Deprecated python tests.

## Running the Application

To start the application, you no longer run `python server.py`. Instead, run it as a package module from the root:
```bash
./run_tammy.sh
```
Or manually:
```bash
PYTHONPATH=$(pwd) python -m backend.server
```
