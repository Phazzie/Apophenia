
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import GlitchedText from '../GlitchedText';

describe('GlitchedText', () => {
  it('renders the initial text', () => {
    const { container } = render(<GlitchedText text="Apophenia" />);
    expect(container.firstChild).toHaveTextContent('Apophenia');
  });

  it('applies a glitch effect over time', () => {
    jest.useFakeTimers();
    // Mock Math.random to control the glitch effect
    jest.spyOn(Math, 'random').mockReturnValue(0.05); // Should glitch

    const { container } = render(<GlitchedText text="Apophenia" />);

    // Initial render should have the text
    expect(container.firstChild).toHaveTextContent('Apophenia');

    // Advance timers to trigger the glitch effect
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // The text is now wrapped in spans
    expect(container.firstChild.textContent).toBe('Apophenia');
    expect(container.querySelectorAll('span').length).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});
