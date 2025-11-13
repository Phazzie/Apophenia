
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import EndScreen from '../EndScreen';
import { vi, Mock } from 'vitest';
import { GameState } from '../../types';

// Mock the zustand stores
vi.mock('../../stores/gameStateStore');
vi.mock('../../stores/storyHistoryStore');
vi.mock('../../services/gameStateManager', () => ({
  GameStateManager: {
    resetAllStores: vi.fn() // Mock to prevent errors during tests
  }
}));

const mockSetGameState = vi.fn();

describe('EndScreen', () => {
  beforeEach(() => {
    (useGameStateStore as unknown as Mock).mockReturnValue({
      setGameState: mockSetGameState,
    });
    (useStoryHistoryStore as unknown as Mock).mockReturnValue({
      storyHistory: [{ id: '1', text: 'The end.', images: {}, timestamp: Date.now() }],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the end screen with the final story segment', () => {
    render(<EndScreen />);
    expect(screen.getByText('The End')).toBeInTheDocument();
    expect(screen.getByText('Your journey has concluded.')).toBeInTheDocument();
  });

  it('calls setGameState to go to the MENU on button click', () => {
    render(<EndScreen />);
    fireEvent.click(screen.getByText('Play Again'));
    expect(mockSetGameState).toHaveBeenCalledWith(GameState.MENU);
  });
});
