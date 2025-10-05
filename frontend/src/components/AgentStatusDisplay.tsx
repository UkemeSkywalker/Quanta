'use client';

import { useState, useEffect } from 'react';

interface AgentStatus {
  agent_type: string;
  status: 'not_created' | 'ready';
  name: string | null;
  description: string | null;
  agent_id?: string;
  model_id?: string;
  message_count?: number;
}

interface AgentStatusResponse {
  status: string;
  agents: Record<string, AgentStatus>;
  total_agents: number;
  timestamp: number;
}

interface AgentStatusDisplayProps {
  className?: string;
}

const agentIcons: Record<string, string> = {
  research: '🔍',
  data: '📊',
  experiment: '🧪',
  critic: '🔍',
  visualization: '📈'
};

const agentDescriptions: Record<string, string> = {
  research: 'Data source discovery',
  data: 'Data processing',
  experiment: 'Hypothesis testing',
  critic: 'Result validation',
  visualization: 'Report generation'
};

export default function AgentStatusDisplay({ className = '' }: AgentStatusDisplayProps) {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAgentStatuses = async () => {
    try {
      setError(null);
      // Try the proxied route first, fallback to direct backend URL
      const urls = ['/api/agents/status', 'http://localhost:8000/api/agents/status'];
      let response;
      let lastError;
      
      for (const url of urls) {
        try {
          response = await fetch(url);
          if (response.ok) break;
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
          lastError = err;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('Failed to fetch from all endpoints');
      }
      
      const data: AgentStatusResponse = await response.json();
      setAgentStatuses(data.agents);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch agent statuses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agent statuses');
    } finally {
      setLoading(false);
    }
  };

  const initializeAgent = async (agentType: string) => {
    try {
      setError(null);
      // Try the proxied route first, fallback to direct backend URL
      const urls = [`/api/agents/${agentType}/initialize`, `http://localhost:8000/api/agents/${agentType}/initialize`];
      let response;
      let lastError;
      
      for (const url of urls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) break;
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
          lastError = err;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('Failed to initialize from all endpoints');
      }
      
      // Refresh statuses after initialization
      await fetchAgentStatuses();
    } catch (err) {
      console.error(`Failed to initialize ${agentType} agent:`, err);
      setError(err instanceof Error ? err.message : `Failed to initialize ${agentType} agent`);
    }
  };

  useEffect(() => {
    fetchAgentStatuses();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchAgentStatuses, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'not_created':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✅';
      case 'not_created':
        return '⚪';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Agent Status</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
        </div>
        <div className="text-gray-400 text-sm">Loading agent statuses...</div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Agent Status</h3>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAgentStatuses}
            className="text-green-400 hover:text-green-300 transition-colors"
            title="Refresh status"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">❌</span>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(agentStatuses).map(([agentType, status]) => (
          <div
            key={agentType}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status.status)}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{agentIcons[agentType] || '🤖'}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-white capitalize">{agentType}</h4>
                  <span className="text-sm">{getStatusIcon(status.status)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {status.description || agentDescriptions[agentType] || 'AI Agent'}
                </p>
                {status.status === 'ready' && status.message_count !== undefined && (
                  <p className="text-xs text-gray-500">
                    Messages: {status.message_count}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                {status.status === 'ready' ? 'Ready' : 'Not Created'}
              </span>
              {status.status === 'not_created' && (
                <button
                  onClick={() => initializeAgent(agentType)}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-400 transition-colors"
                >
                  Initialize
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Total Agents: {Object.keys(agentStatuses).length}</span>
          <span>
            Ready: {Object.values(agentStatuses).filter(s => s.status === 'ready').length}
          </span>
        </div>
      </div>
    </div>
  );
}