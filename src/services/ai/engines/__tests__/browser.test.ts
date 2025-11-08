import { vi, Mock } from 'vitest';
import { NeuralEchoChambers } from '../NeuralEchoChambers';
import { BreakingFifthWall } from '../BreakingFifthWall';
import { WorldState } from '../../../../types';

type StorageMock = ReturnType<typeof createStorageMock>;

const createWorldState = (overrides: Partial<WorldState> = {}): WorldState => ({
  protagonist: 'Test Protagonist',
  setting: 'Test Setting',
  dilemma: 'Test Dilemma',
  summary: 'Test summary',
  psychologicalStatus: 'Stable',
  systemHealth: 100,
  horrorIntensity: 0,
  uiDistortion: {
    transform: 'none',
    filter: 'none',
    transition: 'none',
  },
  genreConfig: {
    id: 'test-genre',
    name: 'Test Genre',
    description: 'A test genre for browser engine specs.',
    style: 'psych-horror',
    theme: {
      '--background-color': '#000000',
      '--text-color': '#ffffff',
      '--accent-color': '#ff00ff',
      '--font-family': 'Inter, sans-serif',
    },
    startScreenImagePrompt: 'test start prompt',
    conceptPrompt: 'test concept prompt',
    aiSystemInstruction: 'test ai system instruction',
  },
  ...overrides,
});

/**
 * Mock for browser storage APIs (localStorage and sessionStorage).
 * This allows testing of persistence features in a Node.js environment.
 */
const createStorageMock = () => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });

/**
 * Test suite for NeuralEchoChambers.
 * This engine relies on browser storage, which is mocked for these tests.
 */
describe('NeuralEchoChambers', () => {
  let engine: NeuralEchoChambers;
  let mockWorldState: WorldState;

  beforeEach(() => {
    // Clear mocks before each test to ensure isolation.
    (window.localStorage as StorageMock).clear();
    (window.sessionStorage as StorageMock).clear();
    engine = new NeuralEchoChambers();
    mockWorldState = createWorldState({
      protagonist: 'The Echo',
      setting: 'A recurring dream',
      summary: 'You have been here before.',
      psychologicalStatus: 'Uneasy',
      systemHealth: 80,
    });
  });

  it('should initialize with an empty state if no persisted data exists', () => {
    engine.initializeFromPersistence();
    expect(engine['crossSessionPatterns']).toEqual([]);
  });

  it('should load patterns from localStorage on initialization', () => {
    const persistedData = { patterns: ['trust-seeker'], triggers: [] };
    localStorage.setItem('apophenia-neural-echoes', JSON.stringify(persistedData));

    engine.initializeFromPersistence();
    expect(engine['crossSessionPatterns']).toEqual(['trust-seeker']);
  });

  it('should record a choice and persist it to localStorage', () => {
    engine.recordChoice('I choose to trust the shadow', 'A flickering hallway', mockWorldState);

    const persistedData = JSON.parse(localStorage.getItem('apophenia-neural-echoes') || '{}');
    expect(persistedData.patterns).toContain('trust-seeker');
  });

  it('should generate an echo prompt if a choice resonates with past patterns', () => {
    engine['crossSessionPatterns'] = ['isolation-tendency'];
    const prompt = engine.generateEchoPrompt('I feel so alone');
    // The prompt is randomly selected, so we just check that it's not null.
    expect(prompt).not.toBeNull();
    expect(typeof prompt).toBe('string');
  });
});

/**
 * Test suite for BreakingFifthWall.
 * This engine manipulates the browser environment, which is mocked here.
 */
describe('BreakingFifthWall', () => {
  let engine: BreakingFifthWall;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new BreakingFifthWall();
    mockWorldState = createWorldState({
      protagonist: 'The User',
      setting: 'The Browser',
      summary: 'The game is watching you.',
      psychologicalStatus: 'Paranoid',
      systemHealth: 40,
    });
    // Mock document properties and methods.
    document.title = 'Apophenia';
    const favicon = { href: '' };
    vi.spyOn(document, 'querySelector').mockReturnValue(favicon as unknown as Element);
    vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine.deactivateBreakage();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should not activate if intensity is too low', () => {
    engine.activateBreakage(0.2, mockWorldState);
    expect(document.title).toBe('Apophenia'); // Title should not change.
  });

  it('should manipulate the document title when intensity is high enough', () => {
    // Force the random check to pass for deterministic testing.
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    engine.activateBreakage(0.4, mockWorldState);

    // Fast-forward time to trigger the title change interval.
    vi.advanceTimersByTime(5000);

    // Title should have been changed to one of the corrupted titles.
    expect(document.title).not.toBe('Apophenia');
  });

  it('should manipulate the favicon when intensity is high enough', () => {
    const favicon = { href: 'original.ico' };
    (document.querySelector as vi.Mock).mockReturnValue(favicon);

    // Force the random check to pass for deterministic testing.
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    engine.activateBreakage(0.6, mockWorldState);

    vi.advanceTimersByTime(10000);

    expect(favicon.href).not.toBe('original.ico');
  });

  it('should manipulate the window scroll when intensity is high enough', () => {
    const scrollSpy = vi.spyOn(window, 'scrollBy');
    engine.activateBreakage(0.8, mockWorldState);

    vi.advanceTimersByTime(15000);

    expect(scrollSpy).toHaveBeenCalled();
  });

  it('should deactivate all effects and restore the original state', () => {
    // Force the title to corrupt for a deterministic test.
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    engine.activateBreakage(0.8, mockWorldState);
    vi.advanceTimersByTime(5000);
    const corruptedTitle = document.title;

    // Verify that the title was indeed corrupted.
    expect(corruptedTitle).not.toBe('Apophenia');

    engine.deactivateBreakage();

    expect(document.title).toBe('Apophenia');
  });
});