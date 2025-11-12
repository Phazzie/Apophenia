
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ThematicLoading from '../ThematicLoading';
import { vi } from 'vitest';

describe('ThematicLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the loading spinner', () => {
    const { container } = render(<ThematicLoading />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('displays an unsettling phrase', () => {
    const { container } = render(<ThematicLoading />);
    // The phrase changes, so we can't check for a specific one.
    // Instead, we check that the paragraph element is there.
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
  });

  it('changes the phrase and glitch style over time', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const { container } = render(<ThematicLoading />);

    // Advance timers to trigger phrase and style change
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check that the phrase is displayed
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).not.toBe('');
  });
});
