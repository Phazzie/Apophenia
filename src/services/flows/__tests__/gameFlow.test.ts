import { triggerSummary } from '../gameFlow';
import { summarizeHistory } from '../../gameService';
import { useWorldStateStore } from '../../../stores/worldStateStore';
import { StorySegment, WorldState } from '../../../types';

// Mock dependencies
jest.mock('../../gameService', () => ({
  summarizeHistory: jest.fn(),
}));

jest.mock('../../../stores/worldStateStore', () => ({
  useWorldStateStore: {
    getState: jest.fn(),
  },
}));

// Mock the genkit flows as well, since they are exported from gameFlow.ts
jest.mock('../../ai/genkit', () => ({
  generateConceptFlow: jest.fn(),
  generateImageFlow: jest.fn(),
  nextStepFlow: jest.fn(),
}));

const mockSummarizeHistory = summarizeHistory as jest.Mock;
const mockUseWorldStateStore = useWorldStateStore as jest.Mock;

describe('gameFlow', () => {
  let mockUpdateWorldState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateWorldState = jest.fn();
    // @ts-ignore
    mockUseWorldStateStore.getState = jest.fn().mockReturnValue({
      updateWorldState: mockUpdateWorldState,
    });
  });

  describe('triggerSummary', () => {
    it('should not do anything if history is empty', async () => {
      const worldState: Partial<WorldState> = {};
      const history: StorySegment[] = [];

      await triggerSummary(worldState as WorldState, history);

      expect(mockSummarizeHistory).not.toHaveBeenCalled();
    });

    it('should call summarizeHistory and update world state on success', async () => {
      const worldState: Partial<WorldState> = { setting: 'A dark and stormy night' };
      const history: StorySegment[] = [{ id: '1', text: 'It was a dark and stormy night.', isPlayer: false }];
      const summary = 'A summary of the night.';
      mockSummarizeHistory.mockResolvedValue(summary);

      await triggerSummary(worldState as WorldState, history);

      expect(mockSummarizeHistory).toHaveBeenCalledWith(worldState, history[0]);
      expect(mockUpdateWorldState).toHaveBeenCalledWith({ summary });
    });

    it('should not update world state if summary is empty', async () => {
        const worldState: Partial<WorldState> = { setting: 'A dark and stormy night' };
        const history: StorySegment[] = [{ id: '1', text: 'It was a dark and stormy night.', isPlayer: false }];
        mockSummarizeHistory.mockResolvedValue(null);

        await triggerSummary(worldState as WorldState, history);

        expect(mockSummarizeHistory).toHaveBeenCalledWith(worldState, history[0]);
        expect(mockUpdateWorldState).not.toHaveBeenCalled();
      });
  });
});