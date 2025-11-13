/**
 * Store Initializers for Testing
 * Utilities to initialize stores with test data
 */

import {
  createMockGameStateStore,
  createMockWorldStateStore,
  createMockHistoryStore,
  createMockPlayerProfileStore,
  mockWorldState,
  mockPlayerProfile,
  mockStorySegment,
} from '../mocks/mockStores';
import { GameState, PsychologicalStatus, StorySegment } from '../../src/core/types/seams';

/**
 * Initialize all stores for testing
 */
export function initializeTestStores() {
  const gameStateStore = createMockGameStateStore();
  const worldStateStore = createMockWorldStateStore();
  const historyStore = createMockHistoryStore();
  const playerProfileStore = createMockPlayerProfileStore();

  return {
    gameStateStore,
    worldStateStore,
    historyStore,
    playerProfileStore,
  };
}

/**
 * Initialize stores with game in progress
 */
export function initializeInProgressStores() {
  const stores = initializeTestStores();

  // Set game to descending state
  stores.gameStateStore.getState().setGameState(GameState.DESCENDING);

  // Add some history
  const segments: StorySegment[] = [
    {
      ...mockStorySegment,
      id: 'segment-1',
      text: 'You enter the abandoned facility.',
    },
    {
      ...mockStorySegment,
      id: 'segment-2',
      text: 'A strange sound echoes through the corridors.',
    },
    {
      ...mockStorySegment,
      id: 'segment-3',
      text: 'You notice the walls are pulsing.',
    },
  ];

  segments.forEach((segment) => {
    stores.historyStore.getState().addSegment(segment);
  });

  // Update world state
  stores.worldStateStore.getState().updateWorld({
    horrorIntensity: 4,
    systemHealth: 75,
    corruptionLevel: 20,
  });

  return stores;
}

/**
 * Initialize stores with high horror state
 */
export function initializeHighHorrorStores() {
  const stores = initializeTestStores();

  stores.gameStateStore.getState().setGameState(GameState.UNRAVELING);

  stores.worldStateStore.getState().updateWorld({
    horrorIntensity: 9,
    systemHealth: 30,
    corruptionLevel: 80,
    psychologicalStatus: PsychologicalStatus.FRAGMENTED,
  });

  // Add extensive history
  const segments = Array.from({ length: 15 }, (_, i) => ({
    ...mockStorySegment,
    id: `segment-${i}`,
    text: `Horror intensifies - segment ${i}`,
    corruptionLevel: Math.min(100, i * 6),
  }));

  segments.forEach((segment) => {
    stores.historyStore.getState().addSegment(segment);
  });

  return stores;
}

/**
 * Initialize stores with corrupted state
 */
export function initializeCorruptedStores() {
  const stores = initializeTestStores();

  stores.gameStateStore.getState().setGameState(GameState.UNRAVELING);

  stores.worldStateStore.getState().updateWorld({
    corruptionLevel: 95,
    systemHealth: 10,
    horrorIntensity: 10,
    psychologicalStatus: PsychologicalStatus.SHATTERED,
  });

  // Add history with revisions
  const segments: StorySegment[] = [
    {
      ...mockStorySegment,
      id: 'segment-1',
      text: 'Reality fractures around you.',
      isRevised: true,
      originalText: 'You enter the room.',
    },
    {
      ...mockStorySegment,
      id: 'segment-2',
      text: 'The walls breathe with malevolent intent.',
      isQuantumShift: true,
    },
    {
      ...mockStorySegment,
      id: 'segment-3',
      text: 'You realize you were never real.',
      isMetaEvent: true,
    },
  ];

  segments.forEach((segment) => {
    stores.historyStore.getState().addSegment(segment);
  });

  return stores;
}

/**
 * Reset all stores to initial state
 */
export function resetAllTestStores(stores: ReturnType<typeof initializeTestStores>): void {
  stores.gameStateStore.getState().reset();
  stores.worldStateStore.getState().reset();
  stores.historyStore.getState().reset();
  stores.playerProfileStore.getState().reset();
}

/**
 * Create a store snapshot for comparison
 */
export function snapshotStores(stores: ReturnType<typeof initializeTestStores>) {
  return {
    gameState: stores.gameStateStore.getState(),
    worldState: stores.worldStateStore.getState().worldState,
    segments: stores.historyStore.getState().segments,
    profile: stores.playerProfileStore.getState().profile,
  };
}
