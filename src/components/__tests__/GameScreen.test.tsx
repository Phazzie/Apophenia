
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { useWorldStateStore } from '../../stores/worldStateStore';
import * as gameService from '../../services/gameService';
import GameScreen from '../GameScreen';
import { GameState } from '../../types';

// Mock the zustand stores and services
jest.mock('../../stores/gameStateStore');
jest.mock('../../stores/storyHistoryStore');
jest.mock('../../stores/worldStateStore');
jest.mock('../../services/gameService');

const mockSetGameState = jest.fn();
const mockAddStorySegment = jest.fn();
const mockUpdateWorldState = jest.fn();
const mockGetNextStep = jest.spyOn(gameService, 'getNextStep');

describe('GameScreen', () => {
  beforeEach(() => {
    (useGameStateStore as unknown as jest.Mock).mockReturnValue({
      choices: [{ text: 'Choice 1', style: 'default' }, { text: 'Choice 2', style: 'default' }],
      intrusiveThought: null,
      gameState: GameState.PLAYING,
      setGameState: mockSetGameState,
      isGenerating: false,
      setIsGenerating: jest.fn(),
    });
    (useStoryHistoryStore as unknown as jest.Mock).mockReturnValue({
      storyHistory: [{ id: '1', text: 'Initial story', images: {} }],
      addStorySegment: mockAddStorySegment,
      replaceStoryHistory: jest.fn(),
    });
    (useWorldStateStore as unknown as jest.Mock).mockReturnValue({
      worldState: { protagonist: 'John Doe', setting: 'A dark and stormy night' },
      updateWorldState: mockUpdateWorldState,
    });
    mockGetNextStep.mockResolvedValue({ commands: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the last story segment and choices', () => {
    render(<GameScreen />);
    expect(screen.getByText('Initial story')).toBeInTheDocument();
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  it('calls getNextStep when a choice is made', async () => {
    render(<GameScreen />);
    fireEvent.click(screen.getByText('Choice 1'));
    await waitFor(() => expect(mockGetNextStep).toHaveBeenCalled());
  });

  it('shows a loading indicator when generating', () => {
    (useGameStateStore as unknown as jest.Mock).mockReturnValue({
      choices: [],
      intrusiveThought: null,
      gameState: GameState.PLAYING,
      setGameState: mockSetGameState,
      isGenerating: true,
      setIsGenerating: jest.fn(),
    });
    const { container } = render(<GameScreen />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });
});
