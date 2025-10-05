import { useState, useCallback } from 'react';
import { ResearchQuery } from '../types/models';

// API response types
export interface WorkflowResponse {
    workflow_id: string;
    status: string;
    message: string;
}

export interface ApiError {
    detail: string | { loc: string[]; msg: string; type: string }[];
    status?: number;
}

// Hook state types
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Custom hook for API communication
export function useApi() {
    const [submitState, setSubmitState] = useState<ApiState<WorkflowResponse>>({
        data: null,
        loading: false,
        error: null
    });

    const [healthState, setHealthState] = useState<ApiState<{ status: string; service: string }>>({
        data: null,
        loading: false,
        error: null
    });

    // Base API configuration
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Generic API call function with error handling
    const apiCall = useCallback(async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {
        const url = `${API_BASE_URL}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorData: ApiError = await response.json();
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else if (Array.isArray(errorData.detail)) {
                        // Handle Pydantic validation errors
                        errorMessage = errorData.detail
                            .map(err => `${err.loc.join('.')}: ${err.msg}`)
                            .join(', ');
                    }
                } catch {
                    // If error response is not JSON, use default message
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error: Unable to connect to the API');
        }
    }, [API_BASE_URL]);

    // Submit research query
    const submitResearchQuery = useCallback(async (query: ResearchQuery): Promise<WorkflowResponse> => {
        setSubmitState({ data: null, loading: true, error: null });

        try {
            const response = await apiCall<WorkflowResponse>('/api/research/submit', {
                method: 'POST',
                body: JSON.stringify(query),
            });

            setSubmitState({ data: response, loading: false, error: null });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setSubmitState({ data: null, loading: false, error: errorMessage });
            throw error;
        }
    }, [apiCall]);

    // Check API health
    const checkHealth = useCallback(async () => {
        setHealthState({ data: null, loading: true, error: null });

        try {
            const response = await apiCall<{ status: string; service: string }>('/health');
            setHealthState({ data: response, loading: false, error: null });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Health check failed';
            setHealthState({ data: null, loading: false, error: errorMessage });
            throw error;
        }
    }, [apiCall]);

    // Get workflow status
    const getWorkflowStatus = useCallback(async (workflowId: string) => {
        try {
            const response = await apiCall<{
                workflow_id: string;
                status: string;
                progress_percentage: number;
                current_agent: string;
                message: string;
            }>(`/api/workflow/${workflowId}/status`);
            return response;
        } catch (error) {
            throw error;
        }
    }, [apiCall]);

    // Reset states
    const resetSubmitState = useCallback(() => {
        setSubmitState({ data: null, loading: false, error: null });
    }, []);

    const resetHealthState = useCallback(() => {
        setHealthState({ data: null, loading: false, error: null });
    }, []);

    return {
        // Submit research query
        submitResearchQuery,
        submitState,
        resetSubmitState,

        // Health check
        checkHealth,
        healthState,
        resetHealthState,

        // Future workflow status
        getWorkflowStatus,

        // Utility
        apiCall,
    };
}

// Hook for managing multiple API states
export function useApiStates() {
    const [states, setStates] = useState<Record<string, ApiState<unknown>>>({});

    const updateState = useCallback(<T>(key: string, newState: Partial<ApiState<T>>) => {
        setStates(prev => ({
            ...prev,
            [key]: { ...prev[key], ...newState }
        }));
    }, []);

    const getState = useCallback(<T>(key: string): ApiState<T> => {
        return (states[key] as ApiState<T>) || { data: null, loading: false, error: null };
    }, [states]);

    const resetState = useCallback((key: string) => {
        setStates(prev => ({
            ...prev,
            [key]: { data: null, loading: false, error: null }
        }));
    }, []);

    return {
        updateState,
        getState,
        resetState,
        states
    };
}