/**
 * @file ErrorBoundary.tsx
 * @description Defines a generic React Error Boundary and a game-specific implementation
 * to catch and handle runtime errors gracefully within the application.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * @interface Props
 * @description Props for the generic ErrorBoundary component.
 * @property {ReactNode} children - The child components that the boundary will wrap.
 * @property {ReactNode} [fallback] - An optional custom component to render on error.
 * @property {(error: Error, errorInfo: ErrorInfo) => void} [onError] - An optional callback function to execute when an error is caught.
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * @interface State
 * @description State for the generic ErrorBoundary component.
 * @property {boolean} hasError - Flag indicating if an error has been caught.
 * @property {Error} [error] - The caught error object.
 */
interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A generic error boundary that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * @extends Component<Props, State>
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * Initializes the component's state.
   * @param {Props} props - The component's props.
   */
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * A static lifecycle method that is invoked after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * @param {Error} error - The error that was thrown.
   * @returns {State} An object to update the state.
   */
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  /**
   * This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives two parameters: the error, and an object with a `componentStack` key.
   * @param {Error} error - The error that was thrown.
   * @param {ErrorInfo} errorInfo - An object containing information about which component threw the error.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for monitoring/debugging
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Renders the component. If an error is caught, it renders the fallback UI.
   * Otherwise, it renders the child components.
   * @returns {ReactNode} The rendered component tree.
   */
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
 * A game-specific error boundary that provides a themed fallback UI.
 * This component wraps the main game content, ensuring that if any unhandled errors occur,
 * the user is presented with a thematic error message instead of a broken application.
 *
 * @param {object} props - The component's props.
 * @param {ReactNode} props.children - The child components to be rendered within the boundary.
 * @returns {React.ReactElement} A React component that provides a game-themed error boundary.
 */
export const GameErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  /**
   * A callback function to handle errors caught by the boundary.
   * This is a good place to integrate with an error reporting service.
   * @param {Error} error - The caught error.
   * @param {ErrorInfo} errorInfo - Information about the component stack.
   */
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