'use client';

import { useState, useEffect } from 'react';
import { WorkflowUpdate } from '../hooks/useWebSocket';

interface WorkflowProgressProps {
    workflowUpdates: WorkflowUpdate[];
    currentStatus: {
        status: string;
        progress: number;
        currentAgent: string;
        message: string;
    } | null;
    workflowId?: string;
}

interface AgentStatus {
    name: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    message: string;
    icon: string;
}

export default function WorkflowProgress({ 
    workflowUpdates, 
    currentStatus, 
    workflowId 
}: WorkflowProgressProps) {
    
    const [agents, setAgents] = useState<AgentStatus[]>([
        { name: 'Research', status: 'idle', message: 'Waiting to start...', icon: '🔍' },
        { name: 'Data', status: 'idle', message: 'Waiting to start...', icon: '📊' },
        { name: 'Experiment', status: 'idle', message: 'Waiting to start...', icon: '🧪' },
        { name: 'Critic', status: 'idle', message: 'Waiting to start...', icon: '🔍' },
        { name: 'Visualization', status: 'idle', message: 'Waiting to start...', icon: '📈' }
    ]);

    const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [overallProgress, setOverallProgress] = useState(0);

    // Update agents based on workflow updates
    useEffect(() => {
        workflowUpdates.forEach(update => {
            if (update.type === 'agent_status' && update.agent_name) {
                setAgents(prev => prev.map(agent => 
                    agent.name === update.agent_name 
                        ? { 
                            ...agent, 
                            status: update.status as AgentStatus['status'], 
                            message: update.message 
                          }
                        : agent
                ));
            } else if (update.type === 'workflow_started') {
                setWorkflowStatus('running');
            } else if (update.type === 'workflow_completed') {
                setWorkflowStatus('completed');
                setOverallProgress(100);
            }
        });
    }, [workflowUpdates]);

    // Update overall progress
    useEffect(() => {
        if (currentStatus) {
            setOverallProgress(currentStatus.progress);
        }
    }, [currentStatus]);

    const getAgentStatusColor = (status: AgentStatus['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 border-green-500/40 text-green-300';
            case 'processing':
                return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
            case 'error':
                return 'bg-red-500/20 border-red-500/40 text-red-300';
            default:
                return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
        }
    };

    const getAgentStatusIcon = (status: AgentStatus['status']) => {
        switch (status) {
            case 'completed':
                return '✅';
            case 'processing':
                return '⏳';
            case 'error':
                return '❌';
            default:
                return '⏸️';
        }
    };

    if (!workflowId && workflowUpdates.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Workflow Progress</h3>
                {workflowId && (
                    <span className="text-sm text-gray-400">ID: {workflowId}</span>
                )}
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Overall Progress</span>
                    <span className="text-sm text-gray-300">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Current Status Message */}
            {currentStatus && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 text-sm">
                        <span className="font-medium">Status:</span> {currentStatus.message}
                    </p>
                    {currentStatus.currentAgent && (
                        <p className="text-blue-400 text-xs mt-1">
                            Current Agent: {currentStatus.currentAgent}
                        </p>
                    )}
                </div>
            )}

            {/* Agent Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {agents.map((agent) => (
                    <div 
                        key={agent.name}
                        className={`p-3 rounded-lg border transition-all duration-300 ${getAgentStatusColor(agent.status)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{agent.icon}</span>
                                <span className="font-medium text-sm">{agent.name}</span>
                            </div>
                            <span className="text-lg">{getAgentStatusIcon(agent.status)}</span>
                        </div>
                        <p className="text-xs opacity-80 line-clamp-2">
                            {agent.message}
                        </p>
                    </div>
                ))}
            </div>

            {/* Workflow Status */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Workflow Status:</span>
                    <span className={`text-sm font-medium ${
                        workflowStatus === 'completed' ? 'text-green-400' :
                        workflowStatus === 'running' ? 'text-yellow-400' :
                        workflowStatus === 'error' ? 'text-red-400' :
                        'text-gray-400'
                    }`}>
                        {workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1)}
                    </span>
                </div>
            </div>

            {/* Recent Updates */}
            {workflowUpdates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Updates</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {workflowUpdates.slice(-5).reverse().map((update, index) => (
                            <div key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                                <span className="text-gray-500">
                                    {new Date(update.timestamp * 1000).toLocaleTimeString()}
                                </span>
                                <span>•</span>
                                <span>{update.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}