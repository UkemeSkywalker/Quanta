import { useState, useEffect, useCallback, useRef } from 'react';

// WebSocket message types
export interface WebSocketMessage {
    type: string;
    timestamp: number;
    content?: string;
    [key: string]: unknown;
}

export interface WorkflowUpdate extends WebSocketMessage {
    type: 'workflow_started' | 'workflow_completed' | 'agent_status';
    workflow_id: string;
    status: string;
    message: string;
    progress_percentage?: number;
    agent_name?: string;
    user_id?: string;
    results?: Record<string, unknown>;
}

export interface ConnectionStatus extends WebSocketMessage {
    type: 'connection' | 'pong' | 'subscription_confirmed';
    status?: string;
    workflow_id?: string;
}

// WebSocket connection states
export enum WebSocketState {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error'
}

// Hook configuration
interface UseWebSocketConfig {
    url?: string;
    clientId: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    pingInterval?: number;
}

// Hook return type
interface UseWebSocketReturn {
    connectionState: WebSocketState;
    lastMessage: WebSocketMessage | null;
    messages: WebSocketMessage[];
    sendMessage: (message: Record<string, unknown> | string) => void;
    clearMessages: () => void;
    reconnect: () => void;
    isConnected: boolean;
    reconnectAttempts: number;
}

export function useWebSocket({
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    clientId,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    pingInterval = 30000
}: UseWebSocketConfig): UseWebSocketReturn {
    
    const [connectionState, setConnectionState] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    // Clean up function
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    // Send ping to keep connection alive
    const sendPing = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
    }, []);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!mountedRef.current) return;

        cleanup();
        setConnectionState(WebSocketState.CONNECTING);

        try {
            const wsUrl = `${url}/ws/${clientId}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!mountedRef.current) return;
                
                console.log('WebSocket connected');
                setConnectionState(WebSocketState.CONNECTED);
                setReconnectAttempts(0);

                // Start ping interval
                pingIntervalRef.current = setInterval(sendPing, pingInterval);
            };

            ws.onmessage = (event) => {
                if (!mountedRef.current) return;

                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);
                    setMessages(prev => [...prev, message]);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    // Handle plain text messages
                    const textMessage: WebSocketMessage = {
                        type: 'text',
                        content: event.data,
                        timestamp: Date.now()
                    };
                    setLastMessage(textMessage);
                    setMessages(prev => [...prev, textMessage]);
                }
            };

            ws.onclose = (event) => {
                if (!mountedRef.current) return;

                console.log('WebSocket disconnected:', event.code, event.reason);
                setConnectionState(WebSocketState.DISCONNECTED);
                
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Attempt reconnection if not a normal closure and under max attempts
                if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                    setConnectionState(WebSocketState.RECONNECTING);
                    setReconnectAttempts(prev => prev + 1);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            connect();
                        }
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                if (!mountedRef.current) return;
                
                console.error('WebSocket error:', error);
                setConnectionState(WebSocketState.ERROR);
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            setConnectionState(WebSocketState.ERROR);
        }
    }, [url, clientId, reconnectInterval, maxReconnectAttempts, pingInterval, reconnectAttempts, cleanup, sendPing]);

    // Send message
    const sendMessage = useCallback((message: Record<string, unknown> | string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
            wsRef.current.send(messageStr);
        } else {
            console.warn('WebSocket is not connected. Cannot send message:', message);
        }
    }, []);

    // Manual reconnect
    const reconnect = useCallback(() => {
        setReconnectAttempts(0);
        connect();
    }, [connect]);

    // Clear messages
    const clearMessages = useCallback(() => {
        setMessages([]);
        setLastMessage(null);
    }, []);

    // Connect on mount and cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        connect();

        return () => {
            mountedRef.current = false;
            cleanup();
        };
    }, [connect, cleanup]);

    // Derived state
    const isConnected = connectionState === WebSocketState.CONNECTED;

    return {
        connectionState,
        lastMessage,
        messages,
        sendMessage,
        clearMessages,
        reconnect,
        isConnected,
        reconnectAttempts
    };
}

// Hook for workflow-specific WebSocket updates
export function useWorkflowWebSocket(clientId: string, workflowId?: string) {
    const webSocket = useWebSocket({ clientId });
    const [workflowUpdates, setWorkflowUpdates] = useState<WorkflowUpdate[]>([]);
    const [currentWorkflowStatus, setCurrentWorkflowStatus] = useState<{
        status: string;
        progress: number;
        currentAgent: string;
        message: string;
    } | null>(null);

    // Subscribe to workflow updates when connected and workflowId is available
    useEffect(() => {
        if (webSocket.isConnected && workflowId) {
            webSocket.sendMessage({
                type: 'subscribe',
                workflow_id: workflowId,
                timestamp: Date.now()
            });
        }
    }, [webSocket.isConnected, workflowId, webSocket]);

    // Process workflow-related messages
    useEffect(() => {
        if (webSocket.lastMessage) {
            const message = webSocket.lastMessage;
            
            if (message.type === 'workflow_started' || 
                message.type === 'workflow_completed' || 
                message.type === 'agent_status') {
                
                const workflowUpdate = message as WorkflowUpdate;
                setWorkflowUpdates(prev => [...prev, workflowUpdate]);
                
                // Update current status
                setCurrentWorkflowStatus({
                    status: workflowUpdate.status,
                    progress: workflowUpdate.progress_percentage || 0,
                    currentAgent: workflowUpdate.agent_name || '',
                    message: workflowUpdate.message
                });
            }
        }
    }, [webSocket.lastMessage]);

    const clearWorkflowUpdates = useCallback(() => {
        setWorkflowUpdates([]);
        setCurrentWorkflowStatus(null);
    }, []);

    return {
        ...webSocket,
        workflowUpdates,
        currentWorkflowStatus,
        clearWorkflowUpdates
    };
}