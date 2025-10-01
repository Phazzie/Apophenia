import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameScreen from '../GameScreen';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { useWorldStateStore } from '../../stores/worldStateStore';
import { executeCommandQueue } from '../../services/commandExecutor';
import { triggerSummary } from '../../services/flows/gameFlow';
import { getNextStep } from '../../services/gameService';
import { GameStateManager } from '../../services/gameStateManager';
import { GameState } from '../../types';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../stores/gameStateStore');
jest.mock('../../stores/storyHistoryStore');
jest.mock('../../stores/worldStateStore');
jest.mock('../../services/commandExecutor');
jest.mock('../../services/flows/gameFlow');
jest.mock('../../services/gameService');
jest.mock('../../services/gameStateManager');

const mockUseGameStateStore = useGameStateStore as jest.Mock;
const mockUseStoryHistoryStore = useStoryHistoryStore as jest.Mock;
const mockUseWorldStateStore = useWorldStateStore as jest.Mock;
const mockGetNextStep = getNextStep as jest.Mock;

describe('GameScreen', () => {
  beforeEach(() => {
    // Provide default mock implementations
    mockUseGameStateStore.mockReturnValue({
      choices: [{ text: 'Go left' }, { text: 'Go right' }],
      intrusiveThought: undefined,
      gameState: GameState.PLAYING,
      setGameState: jest.fn(),
      isGenerating: false,
      setIsGenerating: jest.fn(),
    });
    mockUseStoryHistoryStore.mockReturnValue({
      storyHistory: [{ id: '1', text: 'You are in a dark room.', isPlayer: false }],
      replaceStoryHistory: jest.fn(),
    });
    mockUseWorldStateStore.mockReturnValue({
      worldState: { systemHealth: 100, setting: 'A dark room' },
      updateWorldState: jest.fn(),
    });
    mockGetNextStep.mockResolvedValue({ commands: [] });
  });

  it('renders the last story segment', () => {
    render(<GameScreen />);
    expect(screen.getByText('You are in a dark room.')).toBeInTheDocument();
  });

  it('renders choices', () => {
    render(<GameScreen />);
    expect(screen.getByText('Go left')).toBeInTheDocument();
    expect(screen.getByText('Go right')).toBeInTheDocument();
  });

  it('shows a loading indicator when generating', () => {
    mockUseGameStateStore.mockReturnValue({
      choices: [],
      intrusiveThought: undefined,
      gameState: GameState.PLAYING,
      setGameState: jest.fn(),
      isGenerating: true,
      setIsGenerating: jest.fn(),
    });
    render(<GameScreen />);
    expect(screen.getByText(/Processing your choice/)).toBeInTheDocument();
  });

  it('calls getNextStep when a choice is clicked', async () => {
    render(<GameScreen />);
    fireEvent.click(screen.getByText('Go left'));
    expect(mockGetNextStep).toHaveBeenCalled();
  });
});