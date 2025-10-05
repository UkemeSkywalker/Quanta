'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/research/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          user_id: 'demo_user',
          priority: 1
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Workflow started! ID: ${result.workflow_id}`);
        setQuery('');
      } else {
        alert('Failed to submit research query');
      }
    } catch {
      alert('Error connecting to backend');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            AI-Powered Research
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Automation Platform
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Orchestrate five specialized AI agents to conduct comprehensive research workflows 
            from hypothesis to visualization, all through a single query.
          </p>
        </div>

        {/* Research Query Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="research-query" className="block text-sm font-medium text-gray-300 mb-3">
                Research Query
              </label>
              <textarea
                id="research-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research question or hypothesis..."
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Initiating Research...</span>
                </div>
              ) : (
                'Start Research Workflow'
              )}
            </button>
          </form>
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