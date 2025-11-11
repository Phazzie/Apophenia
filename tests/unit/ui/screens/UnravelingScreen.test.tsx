/**
 * UnravelingScreen Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnravelingScreen } from '../../../../src/ui/screens/UnravelingScreen';
import {
  WorldState,
  StorySegment,
  PsychologicalStatus,
  GenreConfig
} from '../../../../src/core/types/seams';

describe('UnravelingScreen', () => {
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
    dilemma: 'Reality has collapsed',
    psychologicalStatus: PsychologicalStatus.SHATTERED,
    systemHealth: 0,
    horrorIntensity: 10,
    corruptionLevel: 100,
    genreConfig: mockGenreConfig
  };

  const mockFinalSegment: StorySegment = {
    id: 'final-segment',
    text: 'The walls dissolve into static. Everything you knew was a lie.',
    timestamp: Date.now(),
    corruptionLevel: 100
  };

  it('renders unraveling title', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('REALITY UNRAVELING')).toBeInTheDocument();
  });

  it('displays corruption level', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders final segment text', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText(/The walls dissolve into static/)).toBeInTheDocument();
  });

  it('displays protagonist name', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('Dr. Elena Voss')).toBeInTheDocument();
  });

  it('displays setting', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('Arctic Research Station')).toBeInTheDocument();
  });

  it('displays psychological status', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('SHATTERED')).toBeInTheDocument();
  });

  it('displays system health', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays horror intensity', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('10/10')).toBeInTheDocument();
  });

  it('renders restart button', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('BEGIN AGAIN')).toBeInTheDocument();
  });

  it('calls onRestart when restart button is clicked', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    const restartButton = screen.getByText('BEGIN AGAIN').closest('button');
    fireEvent.click(restartButton!);

    expect(onRestartMock).toHaveBeenCalled();
  });

  it('shows initial collapse message', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('Reality is fragmenting...')).toBeInTheDocument();
  });

  it('renders footer message', () => {
    const onRestartMock = vi.fn();

    render(
      <UnravelingScreen
        worldState={mockWorldState}
        finalSegment={mockFinalSegment}
        onRestart={onRestartMock}
      />
    );

    expect(screen.getByText('The cycle continues. It always does.')).toBeInTheDocument();
  });
});
