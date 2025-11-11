
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import { imageGenerationService } from '../../services/ai/imageGeneration';
import * as unifiedAIService from '../../services/ai/unifiedAIService';
import CompactTestAPI from '../CompactTestAPI';
import { vi } from 'vitest';

// Mock the zustand store and services
vi.mock('../../stores/aiModelStore');
vi.mock('../../services/ai/imageGeneration');
vi.mock('../../services/ai/unifiedAIService');

const mockGetSelectedModel = vi.fn();
const mockGenerateImageVariations = vi.fn();
const mockGenerateText = vi.fn();

describe('CompactTestAPI', () => {
  beforeEach(() => {
    (useAIModelStore as unknown as jest.Mock).mockReturnValue({
      getSelectedModel: mockGetSelectedModel.mockReturnValue({ id: 'grok-1' }),
    });
    (imageGenerationService.generateImageVariations as jest.Mock).mockImplementation(mockGenerateImageVariations);
    // Mock the actual export from unifiedAIService
    vi.spyOn(unifiedAIService, 'generateWithSelectedModel').mockImplementation(mockGenerateText);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the test buttons', () => {
    render(<CompactTestAPI />);
    expect(screen.getByText('Test Image Gen')).toBeInTheDocument();
    expect(screen.getByText('Test Story Gen')).toBeInTheDocument();
  });

  it('calls the image generation service when the button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Test Image Gen'));
    expect(mockGenerateImageVariations).toHaveBeenCalled();
  });

  it('calls the unified AI service when the story button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Test Story Gen'));
    expect(mockGenerateText).toHaveBeenCalled();
  });
});
