
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { useWorldStateStore } from '../../stores/worldStateStore';
import EndScreen from '../EndScreen';
import { GameState } from '../../types';

// Mock the zustand stores
jest.mock('../../stores/gameStateStore');
jest.mock('../../stores/storyHistoryStore');
jest.mock('../../stores/worldStateStore');

const mockSetGameState = jest.fn();
const mockResetGameState = jest.fn();
const mockResetStoryHistory = jest.fn();
const mockResetWorldState = jest.fn();

describe('EndScreen', () => {
  beforeEach(() => {
    (useGameStateStore as unknown as jest.Mock).mockReturnValue({
      setGameState: mockSetGameState,
      reset: mockResetGameState,
    });
    (useStoryHistoryStore as unknown as jest.Mock).mockReturnValue({
      storyHistory: [{ id: '1', text: 'The end.', images: {} }],
      reset: mockResetStoryHistory,
    });
    (useWorldStateStore as unknown as jest.Mock).mockReturnValue({
      reset: mockResetWorldState,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
