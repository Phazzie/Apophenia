'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  t?: any; // A bit of a hack to pass the t function to a class component
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-left bg-gray-800 p-4 rounded-lg">
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            <br />
            <br />
            {this.state.error?.stack}
          </details>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const GameErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const t = useI18n();
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Game error:', { error, errorInfo });
  };

  const fallback = (
    <div className="min-h-screen flex justify-center items-center p-8">
      <div className="text-center max-w-xl bg-black/50 p-8 rounded-2xl border border-red-500 shadow-xl shadow-red-500/30">
        <h1 className="font-creepster text-4xl text-red-500 mb-4">{t.error.title}</h1>
        <p className="text-gray-300">{t.error.message}</p>
        <div className="mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-300 ease-in-out hover:bg-red-700 hover:scale-105"
          >
            {t.error.restart}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
