# Quanta AI Scientist

A modern web-based multi-agent research system built on the Strands SDK that orchestrates five specialized AI agents to conduct comprehensive research workflows.

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Python FastAPI with WebSocket support
- **Agents**: Powered by Strands SDK

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:8000

### Manual Setup

If you prefer to run services separately:

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
python run_dev.py
```

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `POST /api/research/submit` - Submit research query
- `WebSocket /ws/{client_id}` - Real-time updates

## Project Structure

```
├── frontend/          # Next.js frontend
│   ├── src/app/       # App router pages
│   └── ...
├── backend/           # FastAPI backend
│   ├── main.py        # Main API server
│   ├── models.py      # Data models
│   └── run_dev.py     # Development server
└── package.json       # Root package.json for scripts
```

## Development

The project is configured with hot reload for both frontend and backend. Changes will be automatically reflected in the browser.

## Features

- Modern, responsive web interface
- Real-time progress monitoring
- Agent-to-agent communication
- Comprehensive research workflows
- Visual feedback and status indicators