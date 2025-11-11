/**
 * DescentScreen Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DescentScreen } from '../../../../src/ui/screens/DescentScreen';
import {
  WorldState,
  StorySegment,
  Choice,
  PsychologicalStatus,
  GenreConfig,
  AIProvider
} from '../../../../src/core/types/seams';

describe('DescentScreen', () => {
  const mockGenreConfig: GenreConfig = {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Test',
    systemPrompt: 'Test',
    themes: ['cosmic'],
    fearCategories: ['cosmic'],
    visualStyle: {
      primaryColor: '#0a0e27',
      secondaryColor: '#2d1b4e',
      accentColor: '#8b0000',
      fontFamily: 'monospace',
      atmosphere: 'dark'
    }
  };

  const mockWorldState: WorldState = {
    protagonist: 'Dr. Elena Voss',
    setting: 'Arctic Research Station',
    dilemma: 'Strange signals from the ice',
    psychologicalStatus: PsychologicalStatus.UNEASY,
    systemHealth: 80,
    horrorIntensity: 5,
    corruptionLevel: 25,
    genreConfig: mockGenreConfig
  };

  const mockSegment: StorySegment = {
    id: 'segment-1',
    text: 'You hear whispers in the walls.',
    timestamp: Date.now()
  };

  const mockChoices: Choice[] = [
    { id: 'choice-1', text: 'Investigate the whispers' },
    { id: 'choice-2', text: 'Ignore them and continue' }
  ];

  it('renders world context', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Dr. Elena Voss - Arctic Research Station/)).toBeInTheDocument();
  });

  it('renders current segment', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('You hear whispers in the walls.')).toBeInTheDocument();
  });

  it('renders choice buttons', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Investigate the whispers')).toBeInTheDocument();
    expect(screen.getByText('Ignore them and continue')).toBeInTheDocument();
  });

  it('renders intrusive thought when provided', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    const intrusiveThought: Choice = {
      id: 'intrusive-1',
      text: 'Destroy the research data',
      isIntrusive: true
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        intrusiveThought={intrusiveThought}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Destroy the research data')).toBeInTheDocument();
  });

  it('shows loading indicator when generating', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={[]}
        isGenerating={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('PROCESSING REALITY')).toBeInTheDocument();
  });

  it('hides choices when generating', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={true}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText('What will you do?')).not.toBeInTheDocument();
  });

  it('calls onChoice when choice is clicked', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    const choiceButton = screen.getByText('Investigate the whispers').closest('button');
    fireEvent.click(choiceButton!);

    expect(mockHandlers.onChoice).toHaveBeenCalledWith(mockChoices[0]);
  });

  it('calls onSave when save button is clicked', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockHandlers.onSave).toHaveBeenCalled();
  });

  it('calls onReset when reset button is clicked', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockHandlers.onReset).toHaveBeenCalled();
  });

  it('displays corruption level', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('displays system health', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('displays horror intensity', () => {
    const mockHandlers = {
      onChoice: vi.fn(),
      onSave: vi.fn(),
      onReset: vi.fn()
    };

    render(
      <DescentScreen
        worldState={mockWorldState}
        currentSegment={mockSegment}
        choices={mockChoices}
        isGenerating={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('5/10')).toBeInTheDocument();
  });
});
