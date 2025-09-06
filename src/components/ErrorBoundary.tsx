import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic error boundary that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for monitoring/debugging
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
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
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Game-specific error boundary with custom fallback UI
 */
export const GameErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Could send to error reporting service here
    console.error('Game error:', { error, errorInfo });
  };

  const fallback = (
    <div className="game-error-boundary">
      <div className="error-content">
        <h1>The narrative has been corrupted</h1>
        <p>Something went wrong in the cosmic depths. The signal has been lost.</p>
        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()}
            className="primary-button"
          >
            Restart the transmission
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