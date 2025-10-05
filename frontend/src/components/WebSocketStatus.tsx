'use client';

import { WebSocketState } from '../hooks/useWebSocket';

interface WebSocketStatusProps {
    connectionState: WebSocketState;
    reconnectAttempts: number;
    onReconnect: () => void;
}

export default function WebSocketStatus({ 
    connectionState, 
    reconnectAttempts, 
    onReconnect 
}: WebSocketStatusProps) {
    
    const getStatusColor = () => {
        switch (connectionState) {
            case WebSocketState.CONNECTED:
                return 'bg-green-400';
            case WebSocketState.CONNECTING:
            case WebSocketState.RECONNECTING:
                return 'bg-yellow-400 animate-pulse';
            case WebSocketState.ERROR:
            case WebSocketState.DISCONNECTED:
                return 'bg-red-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusText = () => {
        switch (connectionState) {
            case WebSocketState.CONNECTED:
                return 'Real-time Connected';
            case WebSocketState.CONNECTING:
                return 'Connecting...';
            case WebSocketState.RECONNECTING:
                return `Reconnecting... (${reconnectAttempts})`;
            case WebSocketState.ERROR:
                return 'Connection Error';
            case WebSocketState.DISCONNECTED:
                return 'Disconnected';
            default:
                return 'Unknown';
        }
    };

    const showReconnectButton = connectionState === WebSocketState.ERROR || 
                               connectionState === WebSocketState.DISCONNECTED;

    return (
        <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm text-gray-300">
                {getStatusText()}
            </span>
            {showReconnectButton && (
                <button
                    onClick={onReconnect}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                    Reconnect
                </button>
            )}
        </div>
    );
}