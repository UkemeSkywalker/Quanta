'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function ApiStatusIndicator() {
  const { checkHealth, healthState } = useApi();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Check health on mount
    checkHealth().then(() => {
      setLastCheck(new Date());
    }).catch(() => {
      setLastCheck(new Date());
    });

    // Set up periodic health checks every 30 seconds
    const interval = setInterval(() => {
      checkHealth().then(() => {
        setLastCheck(new Date());
      }).catch(() => {
        setLastCheck(new Date());
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusColor = () => {
    if (healthState.loading) return 'bg-yellow-400 animate-pulse';
    if (healthState.error) return 'bg-red-400';
    if (healthState.data?.status === 'healthy') return 'bg-green-400';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (healthState.loading) return 'Checking...';
    if (healthState.error) return 'API Offline';
    if (healthState.data?.status === 'healthy') return 'API Online';
    return 'Unknown';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm text-gray-300">
        {getStatusText()}
      </span>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          (Last check: {lastCheck.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
}