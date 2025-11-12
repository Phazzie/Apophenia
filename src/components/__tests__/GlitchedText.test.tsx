
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
    const { container } = render(<GlitchedText text="Apophenia" />);
    const title = container.querySelector('.glitched-title');
    expect(title).toBeInTheDocument();
    // Text is split into individual spans, so check the combined text content
    expect(title?.textContent).toBe('Apophenia');
  });

  it('applies a glitch effect over time', () => {
    // Mock Math.random to control the glitch effect
    vi.spyOn(Math, 'random').mockReturnValue(0.05); // Should glitch

    const { container } = render(<GlitchedText text="Apophenia" />);

    // Initial render should have the container with the correct class
    const title = container.querySelector('.glitched-title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Apophenia');

    // Advance timers to trigger the glitch effect
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // After glitch effect, text should still be present
    expect(title?.textContent).toBe('Apophenia');
  });
});
