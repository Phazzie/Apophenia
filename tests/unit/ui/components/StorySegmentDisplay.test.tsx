/**
 * StorySegmentDisplay Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorySegmentDisplay, StoryHistoryDisplay } from '../../../../src/ui/components/StorySegmentDisplay';
import { StorySegment } from '../../../../src/core/types/seams';

describe('StorySegmentDisplay', () => {
  const mockSegment: StorySegment = {
    id: 'segment-1',
    text: 'This is a test story segment.',
    timestamp: Date.now()
  };

  it('renders segment text correctly', () => {
    render(<StorySegmentDisplay segment={mockSegment} />);

    expect(screen.getByText('This is a test story segment.')).toBeInTheDocument();
  });

  it('renders image when provided and loaded', () => {
    const segmentWithImage: StorySegment = {
      ...mockSegment,
      images: {
        main: 'https://example.com/image.jpg',
        mainStatus: 'loaded'
      }
    };

    render(<StorySegmentDisplay segment={segmentWithImage} />);

    const image = screen.getByAltText('Story illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows loading placeholder when image is loading', () => {
    const segmentWithLoadingImage: StorySegment = {
      ...mockSegment,
      images: {
        mainStatus: 'loading'
      }
    };

    render(<StorySegmentDisplay segment={segmentWithLoadingImage} />);

    expect(screen.getByText('Manifesting reality')).toBeInTheDocument();
  });

  it('does not show image when showImage is false', () => {
    const segmentWithImage: StorySegment = {
      ...mockSegment,
      images: {
        main: 'https://example.com/image.jpg',
        mainStatus: 'loaded'
      }
    };

    render(<StorySegmentDisplay segment={segmentWithImage} showImage={false} />);

    expect(screen.queryByAltText('Story illustration')).not.toBeInTheDocument();
  });

  it('renders revised badge when segment is revised', () => {
    const revisedSegment: StorySegment = {
      ...mockSegment,
      isRevised: true,
      originalText: 'Original text before revision'
    };

    render(<StorySegmentDisplay segment={revisedSegment} />);

    expect(screen.getByText('[MEMORY REVISED]')).toBeInTheDocument();
  });

  it('renders quantum shift badge when segment is quantum shift', () => {
    const quantumSegment: StorySegment = {
      ...mockSegment,
      isQuantumShift: true
    };

    render(<StorySegmentDisplay segment={quantumSegment} />);

    expect(screen.getByText('[TIMELINE SHIFT]')).toBeInTheDocument();
  });

  it('renders meta event badge when segment is meta event', () => {
    const metaSegment: StorySegment = {
      ...mockSegment,
      isMetaEvent: true
    };

    render(<StorySegmentDisplay segment={metaSegment} />);

    expect(screen.getByText('[FOURTH WALL BREACH]')).toBeInTheDocument();
  });

  it('renders corruption badge when corruption is high', () => {
    const corruptedSegment: StorySegment = {
      ...mockSegment,
      corruptionLevel: 75
    };

    render(<StorySegmentDisplay segment={corruptedSegment} />);

    expect(screen.getByText('[REALITY CORRUPTED: 75%]')).toBeInTheDocument();
  });

  it('does not show metadata when showMetadata is false', () => {
    const revisedSegment: StorySegment = {
      ...mockSegment,
      isRevised: true
    };

    render(<StorySegmentDisplay segment={revisedSegment} showMetadata={false} />);

    expect(screen.queryByText('[MEMORY REVISED]')).not.toBeInTheDocument();
  });

  it('shows original text when segment is revised', () => {
    const revisedSegment: StorySegment = {
      ...mockSegment,
      isRevised: true,
      originalText: 'Original text before revision'
    };

    render(<StorySegmentDisplay segment={revisedSegment} />);

    expect(screen.getByText('[View Original Memory]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StorySegmentDisplay segment={mockSegment} className="custom-segment" />
    );

    const article = container.querySelector('.story-segment');
    expect(article).toHaveClass('custom-segment');
  });

  it('has correct data attributes', () => {
    const { container } = render(<StorySegmentDisplay segment={mockSegment} />);

    const article = container.querySelector('.story-segment');
    expect(article).toHaveAttribute('data-segment-id', 'segment-1');
    expect(article).toHaveAttribute('data-corruption', '0');
  });
});

describe('StoryHistoryDisplay', () => {
  const mockSegments: StorySegment[] = [
    { id: 'segment-1', text: 'Segment 1', timestamp: Date.now() },
    { id: 'segment-2', text: 'Segment 2', timestamp: Date.now() },
    { id: 'segment-3', text: 'Segment 3', timestamp: Date.now() }
  ];

  it('renders all segments', () => {
    render(<StoryHistoryDisplay segments={mockSegments} />);

    expect(screen.getByText('Segment 1')).toBeInTheDocument();
    expect(screen.getByText('Segment 2')).toBeInTheDocument();
    expect(screen.getByText('Segment 3')).toBeInTheDocument();
  });

  it('limits segments when maxSegments is set', () => {
    render(<StoryHistoryDisplay segments={mockSegments} maxSegments={2} />);

    expect(screen.queryByText('Segment 1')).not.toBeInTheDocument();
    expect(screen.getByText('Segment 2')).toBeInTheDocument();
    expect(screen.getByText('Segment 3')).toBeInTheDocument();
  });

  it('passes showImages prop to segments', () => {
    const segmentsWithImages: StorySegment[] = [
      {
        id: 'segment-1',
        text: 'Segment with image',
        timestamp: Date.now(),
        images: {
          main: 'https://example.com/image.jpg',
          mainStatus: 'loaded'
        }
      }
    ];

    render(<StoryHistoryDisplay segments={segmentsWithImages} showImages={true} />);

    expect(screen.getByAltText('Story illustration')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StoryHistoryDisplay segments={mockSegments} className="custom-history" />
    );

    const history = container.querySelector('.story-history');
    expect(history).toHaveClass('custom-history');
  });
});
