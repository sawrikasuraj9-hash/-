import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020612] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#111822] border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Application Notice
            </h2>

            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'A temporary display error occurred. Please click reload to restore.'}
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application (නැවත පූරණය කරන්න)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
