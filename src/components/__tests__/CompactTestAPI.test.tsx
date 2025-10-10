
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import { imageGenerationService } from '../../services/ai/imageGeneration';
import { unifiedAIService } from '../../services/ai/unifiedAIService';
import CompactTestAPI from '../CompactTestAPI';

// Mock the zustand store and services
jest.mock('../../stores/aiModelStore');
jest.mock('../../services/ai/imageGeneration');
jest.mock('../../services/ai/unifiedAIService');

const mockGetSelectedModel = jest.fn();
const mockGenerateImageVariations = jest.fn();
const mockGenerateText = jest.fn();

describe('CompactTestAPI', () => {
  beforeEach(() => {
    (useAIModelStore as unknown as jest.Mock).mockReturnValue({
      getSelectedModel: mockGetSelectedModel.mockReturnValue({ id: 'grok-1' }),
    });
    (imageGenerationService.generateImageVariations as jest.Mock).mockImplementation(mockGenerateImageVariations);
    (unifiedAIService.generateText as jest.Mock).mockImplementation(mockGenerateText);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the test buttons', () => {
    render(<CompactTestAPI />);
    expect(screen.getByText('Test Image Gen')).toBeInTheDocument();
    expect(screen.getByText('Story (Groq)')).toBeInTheDocument();
    expect(screen.getByText('Story (Gemini)')).toBeInTheDocument();
  });

  it('calls the image generation service when the button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Test Image Gen'));
    expect(mockGenerateImageVariations).toHaveBeenCalled();
  });

  it('calls the unified AI service for Groq when the button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Story (Groq)'));
    expect(mockGenerateText).toHaveBeenCalled();
  });

  it('calls the unified AI service for Gemini when the button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Story (Gemini)'));
    expect(mockGenerateText).toHaveBeenCalled();
  });
});
