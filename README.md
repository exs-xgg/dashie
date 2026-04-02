# 📊 dashie

**AI-Powered Dashboard Builder for PostgreSQL**

Build professional-grade data dashboards in minutes using natural language.
Powered by Google Gemini, LangGraph, and the Model Context Protocol.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?logo=langchain&logoColor=white)](https://python.langchain.com/docs/langgraph/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


---

## 📖 Overview

dashie is an AI-first analytical platform that lets anyone — from analysts to executives — create interactive data dashboards by simply describing what they want to see. Under the hood, a self-correcting LangGraph agent translates natural language into validated SQL, picks the optimal chart type, and renders it in a drag-and-drop canvas.

---

## ✨ Features

### 🤖 AI-Powered Chart Generation
- **Natural language → SQL → Chart** — Ask questions like *"Show me monthly revenue growth"* and get a fully rendered chart.
- **Self-healing SQL agent** — A LangGraph state machine that validates generated SQL against your database and automatically retries (up to 3×) with error context if the query fails.
- **Smart chart selection** — The AI picks the best visualization (Bar, Line, Area, Pie, or Table) based on your data shape, or you can override with a preferred chart type.
- **"Fix with AI" button** — If a chart breaks after schema changes, one click sends the error back through the agent loop for automatic repair.

### 📊 Rich Visualizations
- **5 chart types** — Bar, Line, Area, Pie (donut), and fully sortable Data Tables (via TanStack Table).
- **Markdown text panels** — Add Titles and Captions with full GFM Markdown support for dashboard documentation and organization.
- **Global date filter** — A shared date range picker that dynamically injects date constraints into all panel queries via `{{date_filter:column}}` placeholders.

### 🏗️ Dashboard Builder
- **Drag-and-drop grid layout** — Powered by `react-grid-layout` with responsive breakpoints (12-col desktop → 2-col mobile).
- **Persistent layouts** — Panel positions and sizes are saved to the backend and restored on reload.
- **Edit / View mode toggle** — Lock down the dashboard to prevent accidental edits while keeping the date filter interactive.
- **Floating toolbar** — A sticky, contextual toolbar for quickly adding AI charts, titles, or captions.
- **Inline panel editing** — Edit a panel's title, SQL query, chart type, and axis configuration without leaving the dashboard.

### 🔌 Data Connections
- **Multi-database support** — Register PostgreSQL (and MySQL / MongoDB placeholders) data sources with connection testing.
- **One-click schema sync** — An AI agent crawls all tables, columns, types, primary keys, and sample rows to build a queryable manifest.
- **Schema Inspector** — Browse synchronized table schemas directly in the connection modal.
- **MCP Integration** — Connect Model Context Protocol servers for secure, standardized database introspection and tool use.

### 🎨 Design & UX
- **Dark mode** — Full dark theme with carefully tuned zinc palette and glassmorphism effects.
- **Micro-animations** — Smooth transitions, hover effects, loading spinners, and backdrop blur throughout.
- **Responsive sidebar** — Persistent navigation with workspace listing, connection management, and settings.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 · Vite · Zustand · Recharts · TanStack Table · React Grid Layout · React Markdown · Tailwind CSS · Lucide Icons |
| **Backend** | FastAPI · SQLModel · SQLAlchemy · Alembic · Pydantic |
| **AI / Agent** | LangGraph (StateGraph) · LangChain Google GenAI · Google Gemini (Flash / Pro) |
| **Protocol** | Model Context Protocol (MCP) via `langchain-mcp-adapters` |
| **Database** | SQLite (app state) · PostgreSQL (target data sources) |

---

## 🏁 Getting Started

### Prerequisites

| Dependency | Version |
| :--- | :--- |
| Node.js | ≥ 18.0 |
| Python | ≥ 3.10 |
| Google Gemini API Key | [Get one here →](https://aistudio.google.com/) |

### 1. Clone the repository

```bash
git clone https://github.com/your-org/dashie.git
cd dashie
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # macOS / Linux
# venv\Scripts\activate        # Windows

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your GOOGLE_API_KEY

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Connect a Database

1. Navigate to **Connections** in the sidebar.
2. Click **Register Database** and enter your PostgreSQL credentials.
3. Click **Test Connection** to verify.
4. Save, then click the **↻ Sync** icon to let the AI agent scan your schema.
5. Head to **Workspace → New Dashboard** and start asking questions!

---

## ⚙️ Configuration

All configuration is managed via `backend/.env`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GOOGLE_API_KEY` | Your Google Gemini API key | *Required* |
| `LLM_MODEL` | Gemini model identifier | `gemini-3.0-flash` |
| `APP_DATABASE_URL` | App state storage (SQLite or PostgreSQL) | `sqlite:///./app_state.db` |
| `PORT` | Backend server port | `8000` |
| `DEBUG` | Enable verbose logging and SQL echo | `true` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,...` |

---

## 🏛️ Architecture

```
dashie/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Pydantic settings
│   ├── database.py              # SQLModel engine setup
│   ├── models/
│   │   └── domain.py            # DataSource, Dashboard, Panel, QueryHistory, MCP models
│   ├── routers/
│   │   ├── dashboards.py        # Dashboard & panel CRUD + layout persistence
│   │   ├── datasources.py       # Data source CRUD + test connection + schema sync
│   │   ├── query.py             # AI query generation, execution, and fix endpoints
│   │   └── mcp_connections.py   # MCP server CRUD
│   ├── services/
│   │   ├── agent_service.py     # LangGraph self-correcting SQL agent
│   │   ├── database_service.py  # Schema introspection & query execution
│   │   └── mcp_service.py       # MCP tool adapter
│   ├── migrations/              # Alembic migration versions
│   ├── seed_sample_db.py        # Sample database seeder for demos
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component with routing
│   │   ├── stores/useStore.js   # Zustand global state
│   │   ├── pages/
│   │   │   ├── WorkspacePage    # Dashboard listing & creation
│   │   │   ├── DashboardPage    # Grid layout canvas
│   │   │   ├── ConnectionsPage  # DB & MCP connection management
│   │   │   └── SettingsPage     # Workspace setup & AI scanner
│   │   └── components/
│   │       ├── dashboard/       # AddChartModal, PanelCard, FloatingToolbar, EditPanelModal, SettingsModal
│   │       └── layout/          # Sidebar, TopBar
│   └── package.json
└── docs/
    └── erd.md                   # Entity Relationship Diagram (Mermaid)
```

---

## 📊 Entity Relationship Diagram

See [docs/erd.md](docs/erd.md) for the full Mermaid diagram. Key entities:

- **DataSource** → registered database connections
- **SchemaManifest** → AI-scanned table metadata & sample rows
- **Dashboard** → named dashboard containers
- **DashboardPanel** → individual chart/text cards with SQL, layout, and config
- **QueryHistory** → execution audit trail
- **MCPConnection** → external MCP server registrations

---

## 📋 TODO / Roadmap

### 🔴 High Priority
- [ ] **User authentication & multi-tenancy** — Add user accounts, login, and per-user dashboard isolation
- [ ] **Dashboard sharing & export** — Generate shareable links, PDF/PNG export of dashboards
- [ ] **Error handling & toast notifications** — Replace `console.error` with user-facing toast messages across all API calls
- [ ] **Data source editing** — Support updating existing database connections (currently create-only)
- [ ] **iFrame integration** — Embed dashboards and individual panels into other applications via iFrame

### 🟡 Medium Priority
- [ ] **MySQL & MongoDB support** — Implement actual drivers beyond PostgreSQL (currently placeholder `db_type` field)
- [ ] **Dashboard duplication** — Clone an existing dashboard with all its panels
- [ ] **Panel reordering via keyboard** — Accessibility improvements for grid layout
- [ ] **Query history UI** — Surface the `QueryHistory` table as a browsable log per panel
- [ ] **Real-time collaboration** — WebSocket-based live editing for teams
- [ ] **Scheduled data refreshes** — Auto-refresh panels on a configurable interval

### 🟢 Nice to Have
- [ ] **Custom color palettes per dashboard** — Let users pick chart color themes
- [ ] **More chart types** — Scatter, Heatmap, Gauge, KPI cards, Funnel
- [ ] **Natural language dashboard builder** — *"Create a dashboard with revenue, churn, and signups"* → full dashboard in one prompt
- [ ] **Embeddable iframes** — Embed individual panels or full dashboards in external apps
- [ ] **Mobile responsive layout** — Dedicated mobile UX beyond the current responsive grid
- [ ] **Internationalization (i18n)** — Multi-language support for the UI
- [ ] **Plugin system for MCP tools** — Dynamic registration and discovery of MCP tool capabilities

### 🔧 Tech Debt
- [ ] **Settings page cleanup** — The `SettingsPage` still uses hardcoded demo data and a simulated scan flow
- [ ] **Test suite** — Add unit tests (pytest for backend, Vitest for frontend) and integration tests
- [ ] **API validation** — Strengthen request validation and error responses across all routers
- [ ] **Environment variable validation** — Fail fast on startup if required env vars are missing
- [ ] **Production build config** — Docker Compose setup, NGINX reverse proxy, and deployment docs

---

## 📜 License

MIT License — Copyright © 2024 dashie
]]>
