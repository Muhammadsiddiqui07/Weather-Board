/**
 * Top-level React error boundary to capture component tree crashes.
 */

import React, { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-semibold text-zinc-100">
              Something encountered an issue
            </h1>

            <p className="text-xs text-zinc-400 leading-relaxed">
              WeatherBoard ran into an unexpected client error. You can reload the application safely.
            </p>

            {this.state.error && (
              <div className="p-3 bg-zinc-950 rounded-lg text-left overflow-auto max-h-32 border border-zinc-800">
                <code className="text-[11px] text-rose-300 font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <Button
              variant="primary"
              onClick={this.handleReset}
              className="w-full mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
