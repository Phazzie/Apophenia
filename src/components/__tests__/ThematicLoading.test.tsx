
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ThematicLoading from '../ThematicLoading';

describe('ThematicLoading', () => {
  it('renders the loading spinner and an unsettling phrase', async () => {
    render(<ThematicLoading />);

    // The spinner should be there immediately
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // The phrase appears asynchronously, so we wait for it
    const phrase = await screen.findByText(/.+/); // Wait for any text content
    expect(phrase).toBeInTheDocument();
  });

  it('changes the phrase over time', async () => {
    jest.useFakeTimers();
    render(<ThematicLoading />);

    // Wait for the first phrase
    const phrase1 = await screen.findByText(/.+/);
    const initialText = phrase1.textContent;

    // Advance time to trigger a new phrase
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const phrase2 = await screen.findByText(/.+/);
    expect(phrase2.textContent).not.toBe(initialText);

    jest.useRealTimers();
  });
});
