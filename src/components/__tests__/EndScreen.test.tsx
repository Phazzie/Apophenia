
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import EndScreen from '../EndScreen';
import { vi } from 'vitest';
import { GameState } from '../../types';

// Mock the zustand stores
vi.mock('../../stores/gameStateStore');
vi.mock('../../stores/storyHistoryStore');

const mockSetGameState = vi.fn();

describe('EndScreen', () => {
  beforeEach(() => {
    (useGameStateStore as unknown as jest.Mock).mockReturnValue({
      setGameState: mockSetGameState,
    });
    (useStoryHistoryStore as unknown as jest.Mock).mockReturnValue({
      storyHistory: [{ id: '1', text: 'The end.', images: {} }],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the end screen with the final story segment', () => {
    render(<EndScreen />);
    expect(screen.getByText('The story has concluded.')).toBeInTheDocument();
    expect(screen.getByText('The end.')).toBeInTheDocument();
  });

  it('calls setGameState to go to the MENU on button click', () => {
    render(<EndScreen />);
    fireEvent.click(screen.getByText('Start New Game'));
    expect(mockSetGameState).toHaveBeenCalledWith(GameState.MENU);
  });
});
