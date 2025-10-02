
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, GameErrorBoundary } from '../ErrorBoundary';
import { vi } from 'vitest';

// A component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Suppress console.error output from the error boundary
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('renders fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom fallback UI for GameErrorBoundary', () => {
    render(
      <GameErrorBoundary>
        <ErrorComponent />
      </GameErrorBoundary>
    );
    expect(screen.getByText('The narrative has been corrupted')).toBeInTheDocument();
  });
});
