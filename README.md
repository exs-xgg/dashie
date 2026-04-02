# 🏛️ Architect AI - Dynamic Dashboard Builder

Architect AI is an advanced, AI-powered analytical platform that transforms how you interact with your data. It leverages **Google Gemini** and the **Model Context Protocol (MCP)** to provide a seamless natural language interface for PostgreSQL databases, allowing anyone to build professional-grade dashboards in minutes.

---

## ✨ Features

- **🗣️ Natural Language to SQL**: Simply ask questions like *"Show me the monthly revenue growth"* or *"Which users are most active?"*.
- **📊 AI-Generated Visualizations**: Automatically selects the best chart type (Line, Bar, Pie, or Table) for your data.
- **🔌 MCP Integration**: Uses the **Model Context Protocol** for secure, standardized database introspection and query execution.
- **🏗️ Dynamic Grid Layout**: Drag-and-drop dashboard components to create the perfect view.
- **🌓 Modern UI**: Sleek, high-performance interface with dark mode support and micro-animations.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Visualization**: [Recharts](https://recharts.org/)
- **UI Components**: Tailwind CSS + Headless UI + Lucide Icons

### Backend
- **Core**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **ORMs/Data**: [SQLModel](https://sqlmodel.tiangolo.com/) & [SQLAlchemy](https://www.sqlalchemy.org/)
- **AI Agent Orchestration**: [LangGraph](https://python.langchain.com/docs/langgraph/)
- **AI Model**: [Google Gemini 1.5 Pro/Flash](https://deepmind.google/technologies/gemini/)
- **Protocol**: [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.0.0+
- **Python**: v3.10+
- **Google Gemini API Key**: [Get one here](https://aistudio.google.com/)

### 🚀 Quick Start

#### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Setup virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   - Copy the example config:
     ```bash
     cp .env.example .env
     ```
   - Update `GOOGLE_API_KEY` in `.env`.

5. **Run the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚙️ Configuration

The `backend/.env` file supports the following options:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GOOGLE_API_KEY` | Your Google Gemini API Key | *Required* |
| `LLM_MODEL` | Gemini Model (Flash recommended for speed) | `gemini-1.5-flash` |
| `APP_DATABASE_URL` | App state storage (SQLite/PostgreSQL) | `sqlite:///./app_state.db` |
| `DEBUG` | Enable verbose logs and SQL echo | `true` |

---

## 📖 How It Works

1. **Connect**: Add a PostgreSQL data source via the Settings page.
2. **Sync**: The backend uses MCP to introspect the schema and generate a manifest for the AI.
3. **Query**: Ask a question on the Dashboard.
4. **Generate**: LangGraph orchestrates the Gemini model to:
   - Understand the schema.
   - Generate valid SQL.
   - Suggest the best visualization.
5. **Visualize**: The frontend executes the SQL and renders the chart in real-time.

---

## 📜 License

MIT License - Copyright (c) 2024 Architect AI
