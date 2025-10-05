from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class AgentStatus(str, Enum):
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"

class ResearchQuery(BaseModel):
    query: str
    user_id: str
    priority: int = 1
    metadata: Optional[Dict[str, Any]] = None

class AgentTask(BaseModel):
    task_id: str
    agent_type: str
    description: str
    status: AgentStatus
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    dependencies: List[str] = []
    created_at: str
    completed_at: Optional[str] = None

class WorkflowResult(BaseModel):
    workflow_id: str
    status: WorkflowStatus
    tasks: List[AgentTask]
    final_results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    progress_percentage: float = 0.0

class A2AMessage(BaseModel):
    from_agent: str
    to_agent: str
    message_type: str
    content: Dict[str, Any]
    timestamp: str