import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            {/* Glow blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative bg-slate-800/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={30} className="text-red-400" />
              </div>

              <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
              <p className="text-slate-400 text-sm mb-1">
                AI LifeOS encountered an unexpected error.
              </p>
              {this.state.error && (
                <p className="text-xs text-slate-600 font-mono bg-slate-900/60 border border-slate-700/30 rounded-lg px-3 py-2 mt-3 text-left truncate">
                  {this.state.error.message}
                </p>
              )}

              <button
                onClick={this.handleReload}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={18} />
                Reload Application
              </button>

              <p className="text-xs text-slate-600 mt-4">
                If this keeps happening, try clearing your browser cache.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
