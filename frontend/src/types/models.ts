// TypeScript interfaces matching backend Pydantic models

export enum WorkflowStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  PAUSED = "paused"
}

export enum AgentStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  COMPLETED = "completed",
  ERROR = "error"
}

export interface ResearchQuery {
  query: string;
  user_id: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface AgentTask {
  task_id: string;
  agent_type: string;
  description: string;
  status: AgentStatus;
  input_data: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  dependencies?: string[];
  created_at: string;
  completed_at?: string;
}

export interface WorkflowResult {
  workflow_id: string;
  status: WorkflowStatus;
  tasks: AgentTask[];
  final_results?: Record<string, unknown>;
  error_message?: string;
  progress_percentage: number;
}

export interface A2AMessage {
  from_agent: string;
  to_agent: string;
  message_type: string;
  content: Record<string, unknown>;
  timestamp: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}