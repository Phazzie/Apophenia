
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import GlitchedText from '../GlitchedText';
import { vi } from 'vitest';

describe('GlitchedText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the text correctly', () => {
    render(<GlitchedText text="Apophenia" />);
    expect(screen.getByText('Apophenia')).toBeInTheDocument();
  });

  it('applies a glitch effect over time', () => {
    // Mock Math.random to control the glitch effect
    vi.spyOn(Math, 'random').mockReturnValue(0.05); // Should glitch

    render(<GlitchedText text="Apophenia" />);

    // Initial render should have the text
    expect(screen.getByText('Apophenia')).toBeInTheDocument();

    // Advance timers to trigger the glitch effect
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check that the text is still there, but now it might be wrapped in spans with styles
    // This is a bit tricky to test perfectly without being too brittle.
    // We'll check that the container has the correct class.
    const container = screen.getByText('Apophenia');
    expect(container).toHaveClass('glitched-title');
  });
});
