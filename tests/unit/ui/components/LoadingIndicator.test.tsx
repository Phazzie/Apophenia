/**
 * LoadingIndicator Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator, LoadingText } from '../../../../src/ui/components/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingIndicator />);

    expect(container.querySelector('.loading-indicator')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingIndicator text="LOADING GAME" />);

    expect(screen.getByText('LOADING GAME')).toBeInTheDocument();
  });

  it('renders spinner variant', () => {
    const { container } = render(<LoadingIndicator variant="spinner" />);

    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    const { container } = render(<LoadingIndicator variant="dots" />);

    expect(container.querySelector('.loading-dots')).toBeInTheDocument();
  });

  it('renders pulse variant', () => {
    const { container } = render(<LoadingIndicator variant="pulse" />);

    expect(container.querySelector('.loading-pulse')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<LoadingIndicator size="small" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('w-6');
  });

  it('applies medium size class', () => {
    const { container } = render(<LoadingIndicator size="medium" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('w-10');
  });

  it('applies large size class', () => {
    const { container } = render(<LoadingIndicator size="large" />);

    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('w-16');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingIndicator className="custom-loading" />);

    const indicator = container.querySelector('.loading-indicator');
    expect(indicator).toHaveClass('custom-loading');
  });
});

describe('LoadingText', () => {
  it('renders with default text', () => {
    render(<LoadingText />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingText text="Processing" />);

    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders loading dots', () => {
    const { container } = render(<LoadingText />);

    expect(container.querySelector('.loading-dots-inline')).toBeInTheDocument();
  });
});
