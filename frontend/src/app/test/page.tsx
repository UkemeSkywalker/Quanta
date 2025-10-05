"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "../../hooks/useApi";
import { useWorkflowWebSocket, WebSocketState } from "../../hooks/useWebSocket";
import WebSocketStatus from "../../components/WebSocketStatus";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function TestPage() {
  const {
    submitResearchQuery,
    submitState,
    checkHealth,
    healthState,
    resetSubmitState,
    getWorkflowStatus,
  } = useApi();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(null);
  const [clientId] = useState(
    () => `test_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // WebSocket connection for testing
  const {
    connectionState,
    reconnectAttempts,
    reconnect,
    sendMessage,
    messages,
    clearMessages,
    workflowUpdates,
    currentWorkflowStatus,
  } = useWorkflowWebSocket(clientId, lastWorkflowId || undefined);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testHealthEndpoint = async () => {
    try {
      addTestResult("🧪 Testing health endpoint...");
      await checkHealth();
      if (healthState.data) {
        addTestResult("✅ Health endpoint test passed");
      }
    } catch (error) {
      addTestResult(`❌ Health endpoint test failed: ${error}`);
    }
  };

  const testResearchSubmit = async () => {
    try {
      addTestResult("🧪 Testing research submit endpoint...");
      const testQuery = {
        query:
          "Analyze the impact of artificial intelligence on scientific research productivity with WebSocket updates",
        user_id: "test_user_123",
        priority: 3,
      };

      const result = await submitResearchQuery(testQuery);
      setLastWorkflowId(result.workflow_id);
      addTestResult(`✅ Research submit test passed: ${result.workflow_id}`);
    } catch (error) {
      addTestResult(`❌ Research submit test failed: ${error}`);
    }
  };

  const testWorkflowStatus = async () => {
    if (!lastWorkflowId) {
      addTestResult(
        "❌ No workflow ID available. Submit a research query first."
      );
      return;
    }

    try {
      addTestResult("🧪 Testing workflow status endpoint...");
      const status = await getWorkflowStatus(lastWorkflowId);
      addTestResult(
        `✅ Workflow status test passed: ${status.status} (${status.progress_percentage}%)`
      );
    } catch (error) {
      addTestResult(`❌ Workflow status test failed: ${error}`);
    }
  };

  const testWebSocketPing = () => {
    addTestResult("🧪 Testing WebSocket ping...");
    sendMessage({ type: "ping", timestamp: Date.now() });
  };

  const testWebSocketMessage = () => {
    addTestResult("🧪 Testing WebSocket custom message...");
    sendMessage({
      type: "test",
      message: "Hello WebSocket!",
      timestamp: Date.now(),
    });
  };

  const testValidation = async () => {
    try {
      addTestResult("🧪 Testing validation with invalid data...");
      const invalidQuery = {
        query: "hi", // Too short
        user_id: "", // Empty
        priority: 10, // Out of range
      };

      await submitResearchQuery(invalidQuery);
      addTestResult("❌ Validation test failed (should have been rejected)");
    } catch {
      addTestResult(
        "✅ Validation test passed (correctly rejected invalid data)"
      );
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    clearMessages();
    addTestResult(
      "🚀 Starting comprehensive API & WebSocket integration tests..."
    );

    await testHealthEndpoint();
    await new Promise((resolve) => setTimeout(resolve, 500));

    testWebSocketPing();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testResearchSubmit();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testWorkflowStatus();
    await new Promise((resolve) => setTimeout(resolve, 500));

    testWebSocketMessage();
    await new Promise((resolve) => setTimeout(resolve, 500));

    resetSubmitState();
    await testValidation();

    addTestResult("🏁 All tests completed!");
  };

  const clearResults = () => {
    setTestResults([]);
    clearMessages();
    resetSubmitState();
  };

  // Monitor WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === "pong") {
        addTestResult("✅ WebSocket ping successful - connection is alive");
      } else if (lastMessage.type === "connection") {
        addTestResult("✅ WebSocket connection established");
      } else if (lastMessage.type === "subscription_confirmed") {
        addTestResult("✅ WebSocket workflow subscription confirmed");
      } else {
        addTestResult(`📨 WebSocket message received: ${lastMessage.type}`);
      }
    }
  }, [messages]);

  // Monitor workflow updates
  useEffect(() => {
    if (workflowUpdates.length > 0) {
      const lastUpdate = workflowUpdates[workflowUpdates.length - 1];
      addTestResult(`🔄 Workflow update: ${lastUpdate.message}`);
    }
  }, [workflowUpdates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              API & WebSocket Integration Test
            </h1>
            <p className="text-gray-300">
              Visual verification of API endpoints, WebSocket communication, and
              real-time updates
            </p>
          </div>
          <WebSocketStatus
            connectionState={connectionState}
            reconnectAttempts={reconnectAttempts}
            onReconnect={reconnect}
          />
        </div>

        {/* Test Controls */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Test Controls
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={testHealthEndpoint}
              disabled={healthState.loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              {healthState.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>🏥</span>
              )}
              <span>Health</span>
            </button>

            <button
              onClick={testResearchSubmit}
              disabled={submitState.loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              {submitState.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>📝</span>
              )}
              <span>Submit</span>
            </button>

            <button
              onClick={testWorkflowStatus}
              disabled={!lastWorkflowId}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <span>📊</span>
              <span>Status</span>
            </button>

            <button
              onClick={testWebSocketPing}
              disabled={connectionState !== WebSocketState.CONNECTED}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <span>🏓</span>
              <span>Ping</span>
            </button>

            <button
              onClick={testWebSocketMessage}
              disabled={connectionState !== WebSocketState.CONNECTED}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <span>💬</span>
              <span>Message</span>
            </button>

            <button
              onClick={testValidation}
              disabled={submitState.loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              {submitState.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>⚠️</span>
              )}
              <span>Validation</span>
            </button>

            <button
              onClick={runAllTests}
              disabled={healthState.loading || submitState.loading}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              {healthState.loading || submitState.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>🚀</span>
              )}
              <span>All Tests</span>
            </button>
          </div>

          <button
            onClick={clearResults}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear All Results
          </button>
        </div>

        {/* Connection Status Panel */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Connection Status
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">WebSocket:</span>
              <span
                className={`font-medium ${
                  connectionState === WebSocketState.CONNECTED
                    ? "text-green-400"
                    : connectionState === WebSocketState.CONNECTING
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {connectionState}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Messages:</span>
              <span className="text-blue-400 font-medium">
                {messages.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Workflow Updates:</span>
              <span className="text-green-400 font-medium">
                {workflowUpdates.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Client ID:</span>
              <span className="text-gray-300 font-mono text-xs">
                {clientId.slice(-8)}
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Info */}
        {lastWorkflowId && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-green-400 font-semibold mb-2">
              Active Workflow
            </h3>
            <p className="text-green-300 font-mono text-sm">
              ID: {lastWorkflowId}
            </p>
            <p className="text-green-200 text-xs mt-1">
              WebSocket is subscribed to updates for this workflow
            </p>
          </div>
        )}

        {/* Current Workflow Status */}
        {currentWorkflowStatus && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-blue-400 font-semibold mb-3">
              Real-time Workflow Status
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white font-medium">
                  {currentWorkflowStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Progress:</span>
                <span className="text-white font-medium">
                  {currentWorkflowStatus.progress}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Agent:</span>
                <span className="text-white font-medium">
                  {currentWorkflowStatus.currentAgent}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400">Message:</span>
                <span className="ml-2 text-white">
                  {currentWorkflowStatus.message}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* API States */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              API States
            </h3>

            {/* Health State */}
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">
                Health Endpoint
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Loading:</span>
                  <span
                    className={
                      healthState.loading ? "text-yellow-400" : "text-gray-400"
                    }
                  >
                    {healthState.loading ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span
                    className={
                      healthState.data ? "text-green-400" : "text-gray-400"
                    }
                  >
                    {healthState.data?.status || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Error:</span>
                  <span
                    className={
                      healthState.error ? "text-red-400" : "text-gray-400"
                    }
                  >
                    {healthState.error ? "Yes" : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit State */}
            <div className="p-3 bg-green-500/10 rounded-lg">
              <h4 className="text-green-400 font-medium mb-2">
                Submit Endpoint
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Loading:</span>
                  <span
                    className={
                      submitState.loading ? "text-yellow-400" : "text-gray-400"
                    }
                  >
                    {submitState.loading ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Workflow ID:</span>
                  <span
                    className={
                      submitState.data ? "text-green-400" : "text-gray-400"
                    }
                  >
                    {submitState.data?.workflow_id?.slice(-8) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Error:</span>
                  <span
                    className={
                      submitState.error ? "text-red-400" : "text-gray-400"
                    }
                  >
                    {submitState.error ? "Yes" : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Test Results
            </h3>
            <div className="bg-black/20 rounded-lg p-3 font-mono text-xs max-h-80 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400">
                  No tests run yet. Click a test button above to start.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-gray-300 mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* WebSocket Messages */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              WebSocket Messages
            </h3>
            <div className="bg-black/20 rounded-lg p-3 max-h-80 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No WebSocket messages yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.slice(-8).map((message, index) => (
                    <div
                      key={index}
                      className="text-xs border-l-2 border-purple-500/30 pl-2"
                    >
                      <div className="text-purple-400 font-medium">
                        {message.type}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      {"content" in message && message.content && (
                        <div className="text-gray-300 mt-1 truncate">
                          {typeof message.content === "string"
                            ? message.content
                            : JSON.stringify(message.content)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>←</span>
            <span>Back to Main App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
