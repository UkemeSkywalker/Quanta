'use client';

import { useState, useEffect } from 'react';
import ResearchQueryForm from '../components/ResearchQueryForm';
import ApiStatusIndicator from '../components/ApiStatusIndicator';
import { ResearchQuery } from '../types/models';
import { useApi } from '../hooks/useApi';

export default function Home() {
  const { submitResearchQuery, submitState, resetSubmitState } = useApi();
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (queryData: ResearchQuery) => {
    setSubmitSuccess(null);
    resetSubmitState();
    
    try {
      const result = await submitResearchQuery(queryData);
      setSubmitSuccess(`Workflow started successfully! ID: ${result.workflow_id}. Status: ${result.status}`);
      
      // Log successful submission for debugging
      console.log('Research workflow submitted:', {
        workflow_id: result.workflow_id,
        status: result.status,
        query: queryData.query.substring(0, 50) + '...'
      });
    } catch (error) {
      // Error is already handled by the hook and stored in submitState.error
      console.error('Submit error:', error);
    }
  };

  // Clear success message when starting new submission
  useEffect(() => {
    if (submitState.loading) {
      setSubmitSuccess(null);
    }
  }, [submitState.loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Quanta</h1>
            </div>
            <ApiStatusIndicator />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            AI-Powered Research Lab
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Automation Platform
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Orchestrate five specialized AI agents to conduct comprehensive research workflows 
            from hypothesis to visualization, all through a single query.
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✅</span>
                <p className="text-green-300">{submitSuccess}</p>
              </div>
              <button
                onClick={() => setSubmitSuccess(null)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {submitState.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">❌</span>
                <p className="text-red-300">{submitState.error}</p>
              </div>
              <button
                onClick={resetSubmitState}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Research Query Form */}
        <div className="mb-12">
          <ResearchQueryForm onSubmit={handleSubmit} isSubmitting={submitState.loading} />
        </div>

        {/* Agent Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          {[
            { name: 'Research', icon: '🔍', description: 'Data source discovery' },
            { name: 'Data', icon: '📊', description: 'Data processing' },
            { name: 'Experiment', icon: '🧪', description: 'Hypothesis testing' },
            { name: 'Critic', icon: '🔍', description: 'Result validation' },
            { name: 'Visualization', icon: '📈', description: 'Report generation' }
          ].map((agent) => (
            <div key={agent.name} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
              <div className="text-2xl mb-2">{agent.icon}</div>
              <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
              <p className="text-xs text-gray-400">{agent.description}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 text-xl">⚡</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Progress</h3>
            <p className="text-gray-400 text-sm">Monitor agent activities and workflow progress in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 text-xl">🤖</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Agent Collaboration</h3>
            <p className="text-gray-400 text-sm">Specialized agents work together using A2A communication</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 text-xl">📋</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Comprehensive Reports</h3>
            <p className="text-gray-400 text-sm">Get detailed research reports with visualizations</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Powered by Strands SDK • Built with Next.js and FastAPI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}