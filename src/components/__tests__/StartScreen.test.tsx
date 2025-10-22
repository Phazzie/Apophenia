
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { useWorldStateStore } from '../../stores/worldStateStore';
import { useAIModelStore } from '../../stores/aiModelStore';
import * as gameService from '../../services/gameService';
import StartScreen from '../StartScreen';
import { vi } from 'vitest';
import { GameState } from '../../types';

// Mock the zustand stores and services
vi.mock('../../stores/gameStateStore');
vi.mock('../../stores/storyHistoryStore');
vi.mock('../../stores/worldStateStore');
vi.mock('../../stores/aiModelStore');
vi.mock('../../services/gameService');

const mockSetGameState = vi.fn();
const mockReplaceStoryHistory = vi.fn();
const mockUpdateWorldState = vi.fn();
const mockSetGenreConfig = vi.fn();
const mockGenerateConcept = vi.spyOn(gameService, 'generateConcept');

describe('StartScreen', () => {
  beforeEach(() => {
    (useGameStateStore as unknown as jest.Mock).mockReturnValue({
      setGameState: mockSetGameState,
    });
    (useStoryHistoryStore as unknown as jest.Mock).mockReturnValue({
      storyHistory: [],
      replaceStoryHistory: mockReplaceStoryHistory,
    });
    (useWorldStateStore as unknown as jest.Mock).mockReturnValue({
      worldState: { protagonist: null, setting: '', atmosphere: '', npcs: [], genre: '' },
      setGenreConfig: mockSetGenreConfig,
      updateWorldState: mockUpdateWorldState,
    });
    (useAIModelStore as unknown as jest.Mock).mockReturnValue({
      getSelectedModel: vi.fn().mockReturnValue({ id: 'test-model', name: 'Test Model' }),
    });
    mockGenerateConcept.mockResolvedValue({ 
        protagonist: 'Guy the bland',
        setting: 'A new world',
        dilemma: 'An exciting dilemma'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the start screen with a new game button', () => {
    render(<StartScreen />);
    expect(screen.getByText('Apophenia')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('does not show the continue button when there is no saved game', () => {
    render(<StartScreen />);
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  it('shows the continue button when there is a saved game', () => {
    (useStoryHistoryStore as unknown as jest.Mock).mockReturnValueOnce({
      storyHistory: [{ id: '1', text: 'Once upon a time...', images: {} }],
      replaceStoryHistory: mockReplaceStoryHistory,
    });
    (useWorldStateStore as unknown as jest.Mock).mockReturnValueOnce({
      worldState: { protagonist: { name: 'Jane Doe', description: 'A person', personality: 'curious' }, setting: 'A place', atmosphere: 'tense', npcs: [], genre: 'mystery' },
      setGenreConfig: mockSetGenreConfig,
      updateWorldState: mockUpdateWorldState,
    });
    render(<StartScreen />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('calls generateConcept and sets the game state to PLAYING on new game', async () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByText('New Game'));
    await waitFor(() => expect(mockGenerateConcept).toHaveBeenCalled());
    expect(mockUpdateWorldState).toHaveBeenCalledWith(expect.any(Object));
    expect(mockReplaceStoryHistory).toHaveBeenCalledWith([]);
    expect(mockSetGameState).toHaveBeenCalledWith(GameState.PLAYING);
  });
});
