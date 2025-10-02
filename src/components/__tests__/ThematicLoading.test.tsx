
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
    render(<ThematicLoading />);
    expect(screen.getByRole('complementary')).toHaveClass('loading-spinner');
  });

  it('displays an unsettling phrase', () => {
    render(<ThematicLoading />);
    // The phrase changes, so we can't check for a specific one.
    // Instead, we check that the container for the phrase is there.
    const phraseContainer = screen.getByRole('complementary').nextSibling;
    expect(phraseContainer).toBeInTheDocument();
  });

  it('changes the phrase and glitch style over time', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    render(<ThematicLoading />);

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check that the phrase container has a style applied to it
    const phraseContainer = screen.getByRole('complementary').nextSibling;
    expect(phraseContainer).toHaveStyle('filter: blur(1px)');
  });
});
