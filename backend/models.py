from pydantic import BaseModel, Field, field_validator
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
    query: str = Field(..., min_length=10, max_length=1000, description="Research query must be between 10 and 1000 characters")
    user_id: str = Field(..., min_length=1, description="User ID is required")
    priority: int = Field(default=1, ge=1, le=5, description="Priority must be between 1 and 5")
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('query')
    @classmethod
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty or only whitespace')
        # Check for basic research keywords to ensure it's a meaningful query
        research_indicators = ['analyze', 'study', 'research', 'investigate', 'examine', 'explore', 'compare', 'evaluate', 'assess', 'what', 'how', 'why', 'when', 'where']
        if not any(indicator in v.lower() for indicator in research_indicators):
            raise ValueError('Query should contain research-oriented language (e.g., analyze, study, investigate, etc.)')
        return v.strip()

    @field_validator('user_id')
    @classmethod
    def validate_user_id(cls, v):
        if not v.strip():
            raise ValueError('User ID cannot be empty')
        return v.strip()

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