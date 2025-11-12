
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useGameStateStore } from '../../stores/gameStateStore';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { useWorldStateStore } from '../../stores/worldStateStore';
import { useAIModelStore } from '../../stores/aiModelStore';
import * as gameService from '../../services/gameService';
import StartScreen from '../StartScreen';
import { vi, Mock } from 'vitest';
import { GameState } from '../../types';

// Mock the zustand stores and services
vi.mock('../../stores/gameStateStore');
vi.mock('../../stores/storyHistoryStore');
vi.mock('../../stores/worldStateStore');
vi.mock('../../stores/aiModelStore');
vi.mock('../../services/gameService');
// Create a mock that will be called by resetAllStores
const mockResetAllStores = vi.fn();

vi.mock('../../services/gameStateManager', () => ({
  GameStateManager: {
    resetAllStores: mockResetAllStores
  }
}));

const mockSetGameState = vi.fn();
const mockAddStorySegment = vi.fn();
const mockReplaceStoryHistory = vi.fn();
const mockUpdateWorldState = vi.fn();
const mockSetGenreConfig = vi.fn();
const mockGenerateConcept = vi.spyOn(gameService, 'generateConcept');

describe('StartScreen', () => {
  beforeEach(() => {
    // Mock store hooks
    (useGameStateStore as unknown as Mock).mockReturnValue({
      setGameState: mockSetGameState,
    });
    (useStoryHistoryStore as unknown as Mock).mockReturnValue({
      storyHistory: [],
      replaceStoryHistory: mockReplaceStoryHistory,
      addStorySegment: mockAddStorySegment,
    });
    (useWorldStateStore as unknown as Mock).mockReturnValue({
      worldState: { protagonist: null, setting: '', atmosphere: '', npcs: [], genre: '' },
      setGenreConfig: mockSetGenreConfig,
      updateWorldState: mockUpdateWorldState,
    });
    (useAIModelStore as unknown as Mock).mockReturnValue({
      getSelectedModel: vi.fn().mockReturnValue({ id: 'test-model', name: 'Test Model' }),
    });

    // Mock store getState() calls that are used directly in component
    useStoryHistoryStore.getState = vi.fn().mockReturnValue({
      addStorySegment: mockAddStorySegment,
      replaceStoryHistory: mockReplaceStoryHistory,
    });
    useWorldStateStore.getState = vi.fn().mockReturnValue({
      updateWorldState: mockUpdateWorldState,
      setGenreConfig: mockSetGenreConfig,
    });

    // Mock resetAllStores to call replaceStoryHistory([])
    mockResetAllStores.mockImplementation(() => {
      mockReplaceStoryHistory([]);
    });

    mockGenerateConcept.mockResolvedValue({
        protagonist: 'Guy - A guy with a bland personality',
        setting: 'A new world',
        dilemma: 'What to do next'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the start screen with a new game button', () => {
    const { container } = render(<StartScreen />);
    // GlitchedText splits text into spans, so check the container
    const glitchedTitle = container.querySelector('.glitched-title');
    expect(glitchedTitle).toBeInTheDocument();
    expect(glitchedTitle?.textContent).toBe('Apophenia');
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('does not show the continue button when there is no saved game', () => {
    render(<StartScreen />);
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  it('shows the continue button when there is a saved game', () => {
    // Override the mock for this test (not Once, because component may call multiple times)
    (useStoryHistoryStore as unknown as Mock).mockReturnValue({
      storyHistory: [{ id: '1', text: 'Once upon a time...', images: {}, timestamp: Date.now() }],
      replaceStoryHistory: mockReplaceStoryHistory,
      addStorySegment: mockAddStorySegment,
    });
    (useWorldStateStore as unknown as Mock).mockReturnValue({
      worldState: { protagonist: { name: 'Jane Doe', description: 'A person', personality: 'curious' }, setting: 'A place', atmosphere: 'tense', npcs: [], genre: 'mystery' },
      setGenreConfig: mockSetGenreConfig,
      updateWorldState: mockUpdateWorldState,
    });

    const { container } = render(<StartScreen />);
    // Check for the glitched title
    const glitchedTitle = container.querySelector('.glitched-title');
    expect(glitchedTitle?.textContent).toBe('Apophenia');
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
