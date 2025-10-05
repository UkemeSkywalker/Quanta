from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Dict, Any, Optional
import json
import asyncio
from models import ResearchQuery, WorkflowResult, WorkflowStatus
from agent_factory import AgentFactory

app = FastAPI(title="Quanta AI Scientist API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AgentFactory
agent_factory = AgentFactory()

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
        # Send connection confirmation
        await self.send_status_update(client_id, {
            "type": "connection",
            "status": "connected",
            "message": "WebSocket connection established",
            "timestamp": asyncio.get_event_loop().time()
        })

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                print(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)

    async def send_status_update(self, client_id: str, update: Dict[str, Any]):
        """Send structured status updates to client"""
        if client_id in self.active_connections:
            try:
                message = json.dumps(update)
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                print(f"Error sending status update to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast_status(self, update: Dict[str, Any]):
        """Broadcast status update to all connected clients"""
        message = json.dumps(update)
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

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
            "agents_status": "GET /api/agents/status - Get all agents status",
            "agent_status": "GET /api/agents/{agent_type}/status - Get specific agent status",
            "initialize_agent": "POST /api/agents/{agent_type}/initialize - Initialize specific agent",
            "websocket": "WS /ws/{client_id} - Real-time updates",
            "api_info": "GET /api/info - This endpoint"
        },
        "agents": ["Research", "Data", "Experiment", "Critic", "Visualization"],
        "strands_sdk": "Integrated with Strands Agents SDK v1.10.0"
    }

@app.post("/api/research/submit", response_model=WorkflowResponse)
async def submit_research_query(query: ResearchQuery):
    # The Pydantic model will automatically validate the input
    # If validation fails, FastAPI will return a 422 error with details
    
    workflow_id = f"workflow_{query.user_id}_{hash(query.query) % 10000}"
    
    # Send real-time update to connected clients
    await manager.broadcast_status({
        "type": "workflow_started",
        "workflow_id": workflow_id,
        "status": "initiated",
        "message": f"Research workflow started for query: {query.query[:50]}...",
        "timestamp": asyncio.get_event_loop().time(),
        "user_id": query.user_id
    })
    
    # Start mock workflow simulation
    asyncio.create_task(simulate_workflow_progress(workflow_id, query.user_id))
    
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

@app.get("/api/websocket/status")
async def websocket_status():
    """Get WebSocket connection status"""
    return {
        "active_connections": manager.get_connection_count(),
        "status": "operational",
        "endpoint": "/ws/{client_id}"
    }

@app.get("/api/agents/status")
async def get_all_agents_status():
    """Get status of all agents"""
    try:
        statuses = agent_factory.get_all_agent_statuses()
        return {
            "status": "success",
            "agents": statuses,
            "total_agents": len(statuses),
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent statuses: {str(e)}")

@app.get("/api/agents/{agent_type}/status")
async def get_agent_status(agent_type: str):
    """Get status of a specific agent"""
    try:
        status = agent_factory.get_agent_status(agent_type)
        return {
            "status": "success",
            "agent": status,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")

@app.post("/api/agents/{agent_type}/initialize")
async def initialize_agent(agent_type: str):
    """Initialize a specific agent"""
    try:
        agent_creators = {
            "research": agent_factory.create_research_agent,
            "data": agent_factory.create_data_agent,
            "experiment": agent_factory.create_experiment_agent,
            "critic": agent_factory.create_critic_agent,
            "visualization": agent_factory.create_visualization_agent
        }
        
        if agent_type not in agent_creators:
            raise HTTPException(status_code=400, detail=f"Unknown agent type: {agent_type}")
        
        # Create the agent
        agent = agent_creators[agent_type]()
        
        # Get the updated status
        status = agent_factory.get_agent_status(agent_type)
        
        # Broadcast agent initialization to connected clients
        await manager.broadcast_status({
            "type": "agent_initialized",
            "agent_type": agent_type,
            "agent_name": agent.name,
            "status": "ready",
            "message": f"{agent.name} has been initialized and is ready",
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return {
            "status": "success",
            "message": f"{agent_type.capitalize()} agent initialized successfully",
            "agent": status,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize agent: {str(e)}")

async def simulate_workflow_progress(workflow_id: str, user_id: str):
    """Simulate workflow progress for testing WebSocket functionality"""
    agents = [
        {"name": "Research", "duration": 3, "message": "Discovering data sources and research papers"},
        {"name": "Data", "duration": 4, "message": "Processing and analyzing collected data"},
        {"name": "Experiment", "duration": 5, "message": "Running experiments and hypothesis testing"},
        {"name": "Critic", "duration": 3, "message": "Validating results and methodology"},
        {"name": "Visualization", "duration": 2, "message": "Generating charts and final report"}
    ]
    
    total_agents = len(agents)
    
    for i, agent in enumerate(agents):
        # Agent started
        await manager.broadcast_status({
            "type": "agent_status",
            "workflow_id": workflow_id,
            "agent_name": agent["name"],
            "status": "processing",
            "message": agent["message"],
            "progress_percentage": (i / total_agents) * 100,
            "timestamp": asyncio.get_event_loop().time(),
            "user_id": user_id
        })
        
        # Simulate processing time
        await asyncio.sleep(agent["duration"])
        
        # Agent completed
        await manager.broadcast_status({
            "type": "agent_status",
            "workflow_id": workflow_id,
            "agent_name": agent["name"],
            "status": "completed",
            "message": f"{agent['name']} agent completed successfully",
            "progress_percentage": ((i + 1) / total_agents) * 100,
            "timestamp": asyncio.get_event_loop().time(),
            "user_id": user_id
        })
    
    # Workflow completed
    await manager.broadcast_status({
        "type": "workflow_completed",
        "workflow_id": workflow_id,
        "status": "completed",
        "message": "Research workflow completed successfully",
        "progress_percentage": 100,
        "timestamp": asyncio.get_event_loop().time(),
        "user_id": user_id,
        "results": {
            "summary": "Mock research workflow completed with all 5 agents",
            "agents_completed": total_agents,
            "total_duration": sum(agent["duration"] for agent in agents)
        }
    })

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Listen for client messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await manager.send_status_update(client_id, {
                        "type": "pong",
                        "timestamp": asyncio.get_event_loop().time()
                    })
                elif message.get("type") == "subscribe":
                    # Client subscribing to workflow updates
                    workflow_id = message.get("workflow_id")
                    await manager.send_status_update(client_id, {
                        "type": "subscription_confirmed",
                        "workflow_id": workflow_id,
                        "message": f"Subscribed to updates for workflow {workflow_id}",
                        "timestamp": asyncio.get_event_loop().time()
                    })
                else:
                    # Echo unknown messages
                    await manager.send_personal_message(f"Received: {data}", client_id)
                    
            except json.JSONDecodeError:
                # Handle plain text messages
                await manager.send_personal_message(f"Received: {data}", client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        print(f"Client {client_id} disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)