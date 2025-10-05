from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Dict, Any, Optional
import json
import asyncio
from models import ResearchQuery, WorkflowResult, WorkflowStatus

app = FastAPI(title="Quanta AI Scientist API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class WorkflowResponse(BaseModel):
    workflow_id: str
    status: str
    message: str

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Quanta AI Scientist API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "quanta-api"}

@app.get("/api/info")
async def api_info():
    return {
        "service": "Quanta AI Scientist API",
        "version": "1.0.0",
        "description": "Multi-agent research system powered by Strands SDK",
        "endpoints": {
            "health": "GET /health - Health check",
            "submit_research": "POST /api/research/submit - Submit research query",
            "workflow_status": "GET /api/workflow/{workflow_id}/status - Get workflow status",
            "websocket": "WS /ws/{client_id} - Real-time updates",
            "api_info": "GET /api/info - This endpoint"
        },
        "agents": ["Research", "Data", "Experiment", "Critic", "Visualization"]
    }

@app.post("/api/research/submit", response_model=WorkflowResponse)
async def submit_research_query(query: ResearchQuery):
    # The Pydantic model will automatically validate the input
    # If validation fails, FastAPI will return a 422 error with details
    
    workflow_id = f"workflow_{query.user_id}_{hash(query.query) % 10000}"
    
    return WorkflowResponse(
        workflow_id=workflow_id,
        status="initiated",
        message=f"Research workflow started for query: {query.query[:50]}..."
    )

@app.get("/api/workflow/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    # Mock workflow status for now - will be replaced with actual workflow tracking
    return {
        "workflow_id": workflow_id,
        "status": "running",
        "progress_percentage": 25.0,
        "current_agent": "research",
        "message": "Research agent is discovering data sources..."
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - will be replaced with actual workflow updates
            await manager.send_personal_message(f"Received: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)