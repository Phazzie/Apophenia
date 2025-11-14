/**
 * StartScreen Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../../../../src/ui/screens/StartScreen';
import { GenreConfig, AIProvider } from '../../../../src/core/types/seams';

describe('StartScreen', () => {
  const mockGenres: GenreConfig[] = [
    {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: 'Face the unknowable',
      systemPrompt: 'Test prompt',
      themes: ['cosmic', 'dread', 'insignificance'],
      fearCategories: ['cosmic'],
      visualStyle: {
        primaryColor: '#0a0e27',
        secondaryColor: '#2d1b4e',
        accentColor: '#8b0000',
        fontFamily: 'monospace',
        atmosphere: 'dark'
      }
    },
    {
      id: 'psychological-horror',
      name: 'Psychological Horror',
      description: 'Question your sanity',
      systemPrompt: 'Test prompt',
      themes: ['madness', 'paranoia', 'identity'],
      fearCategories: ['psychological'],
      visualStyle: {
        primaryColor: '#0a0e27',
        secondaryColor: '#2d1b4e',
        accentColor: '#8b0000',
        fontFamily: 'monospace',
        atmosphere: 'fragmented'
      }
    }
  ];

  const mockProviders: AIProvider[] = [
    AIProvider.GROK,
    AIProvider.GEMINI_PRO,
    AIProvider.MOCK
  ];

  it('renders game title', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    expect(screen.getByText('APOPHENIA')).toBeInTheDocument();
  });

  it('renders all available genres', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    expect(screen.getByText('Cosmic Horror')).toBeInTheDocument();
    expect(screen.getByText('Psychological Horror')).toBeInTheDocument();
  });

  it('renders genre descriptions', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    expect(screen.getByText('Face the unknowable')).toBeInTheDocument();
    expect(screen.getByText('Question your sanity')).toBeInTheDocument();
  });

  it('renders all available providers', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    expect(screen.getByText('Grok-4 (X.AI)')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
    expect(screen.getByText('Demo Mode')).toBeInTheDocument();
  });

  it('selects first genre by default', () => {
    const onStartGameMock = vi.fn();
    const { container } = render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    const firstGenreCard = container.querySelector('.genre-card');
    expect(firstGenreCard).toHaveClass('selected');
  });

  it('allows genre selection', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    const psychologicalHorrorCard = screen.getByText('Psychological Horror').closest('button');
    fireEvent.click(psychologicalHorrorCard!);

    expect(psychologicalHorrorCard).toHaveClass('selected');
  });

  it('allows provider selection', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    const geminiProRadio = screen.getByLabelText('Gemini 2.5 Pro');
    fireEvent.click(geminiProRadio);

    expect(geminiProRadio).toBeChecked();
  });

  it('calls onStartGame with selected genre and provider', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    // Select Psychological Horror
    const psychologicalHorrorCard = screen.getByText('Psychological Horror').closest('button');
    fireEvent.click(psychologicalHorrorCard!);

    // Select Gemini Pro
    const geminiProRadio = screen.getByLabelText('Gemini 2.5 Pro');
    fireEvent.click(geminiProRadio);

    // Click Begin Descent
    const startButton = screen.getByText('Begin Descent');
    fireEvent.click(startButton);

    expect(onStartGameMock).toHaveBeenCalledWith(
      mockGenres[1],
      AIProvider.GEMINI_PRO
    );
  });

  it('disables start button when no genre is selected', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={[]}
        availableProviders={mockProviders}
      />
    );

    const startButton = screen.getByText('Begin Descent');
    expect(startButton).toBeDisabled();
  });

  it('renders warning text', () => {
    const onStartGameMock = vi.fn();

    render(
      <StartScreen
        onStartGame={onStartGameMock}
        availableGenres={mockGenres}
        availableProviders={mockProviders}
      />
    );

    expect(screen.getByText(/Warning: This experience may cause psychological discomfort/)).toBeInTheDocument();
  });
});
