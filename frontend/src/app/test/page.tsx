'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function TestPage() {
  const { submitResearchQuery, submitState, checkHealth, healthState, resetSubmitState, getWorkflowStatus } = useApi();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(null);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testHealthEndpoint = async () => {
    try {
      addTestResult('🧪 Testing health endpoint...');
      await checkHealth();
      if (healthState.data) {
        addTestResult('✅ Health endpoint test passed');
      }
    } catch (error) {
      addTestResult(`❌ Health endpoint test failed: ${error}`);
    }
  };

  const testResearchSubmit = async () => {
    try {
      addTestResult('🧪 Testing research submit endpoint...');
      const testQuery = {
        query: 'Analyze the impact of artificial intelligence on scientific research productivity',
        user_id: 'test_user_123',
        priority: 3
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
      addTestResult('❌ No workflow ID available. Submit a research query first.');
      return;
    }

    try {
      addTestResult('🧪 Testing workflow status endpoint...');
      const status = await getWorkflowStatus(lastWorkflowId);
      addTestResult(`✅ Workflow status test passed: ${status.status} (${status.progress_percentage}%)`);
    } catch (error) {
      addTestResult(`❌ Workflow status test failed: ${error}`);
    }
  };

  const testValidation = async () => {
    try {
      addTestResult('🧪 Testing validation with invalid data...');
      const invalidQuery = {
        query: 'hi', // Too short
        user_id: '', // Empty
        priority: 10 // Out of range
      };
      
      await submitResearchQuery(invalidQuery);
      addTestResult('❌ Validation test failed (should have been rejected)');
    } catch (error) {
      addTestResult('✅ Validation test passed (correctly rejected invalid data)');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🚀 Starting comprehensive API integration tests...');
    
    await testHealthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    
    await testResearchSubmit();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testWorkflowStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    resetSubmitState();
    await testValidation();
    
    addTestResult('🏁 All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
    resetSubmitState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API Integration Test Page</h1>
          <p className="text-gray-300">Visual verification of API endpoints and error handling</p>
        </div>

        {/* Test Controls */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={testHealthEndpoint}
              disabled={healthState.loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {healthState.loading ? <LoadingSpinner size="sm" /> : <span>🏥</span>}
              <span>Health</span>
            </button>
            
            <button
              onClick={testResearchSubmit}
              disabled={submitState.loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {submitState.loading ? <LoadingSpinner size="sm" /> : <span>📝</span>}
              <span>Submit</span>
            </button>
            
            <button
              onClick={testWorkflowStatus}
              disabled={!lastWorkflowId}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Status</span>
            </button>
            
            <button
              onClick={testValidation}
              disabled={submitState.loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {submitState.loading ? <LoadingSpinner size="sm" /> : <span>⚠️</span>}
              <span>Validation</span>
            </button>
            
            <button
              onClick={runAllTests}
              disabled={healthState.loading || submitState.loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {(healthState.loading || submitState.loading) ? <LoadingSpinner size="sm" /> : <span>🚀</span>}
              <span>All Tests</span>
            </button>
          </div>
          
          <button
            onClick={clearResults}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Results
          </button>
        </div>

        {/* Workflow Info */}
        {lastWorkflowId && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-green-400 font-semibold mb-2">Active Workflow</h3>
            <p className="text-green-300 font-mono text-sm">ID: {lastWorkflowId}</p>
            <p className="text-green-200 text-xs mt-1">You can now test the workflow status endpoint</p>
          </div>
        )}

        {/* API States */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Health State */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Health State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Loading:</span>
                <span className={healthState.loading ? 'text-yellow-400' : 'text-gray-400'}>
                  {healthState.loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={healthState.data ? 'text-green-400' : 'text-gray-400'}>
                  {healthState.data?.status || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Error:</span>
                <span className={healthState.error ? 'text-red-400' : 'text-gray-400'}>
                  {healthState.error || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit State */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Submit State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Loading:</span>
                <span className={submitState.loading ? 'text-yellow-400' : 'text-gray-400'}>
                  {submitState.loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Workflow ID:</span>
                <span className={submitState.data ? 'text-green-400' : 'text-gray-400'}>
                  {submitState.data?.workflow_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Error:</span>
                <span className={submitState.error ? 'text-red-400' : 'text-gray-400'}>
                  {submitState.error ? 'Yes' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
          <div className="bg-black/20 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No tests run yet. Click a test button above to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-gray-300 mb-1">
                  {result}
                </div>
              ))
            )}
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