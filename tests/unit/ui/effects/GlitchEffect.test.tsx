/**
 * GlitchEffect Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlitchEffect, GlitchText } from '../../../../src/ui/effects/GlitchEffect';

describe('GlitchEffect', () => {
  it('renders children correctly', () => {
    render(
      <GlitchEffect intensity={5}>
        <div>Test Content</div>
      </GlitchEffect>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies intensity as data attribute', () => {
    const { container } = render(
      <GlitchEffect intensity={7}>
        <div>Test Content</div>
      </GlitchEffect>
    );

    const element = container.querySelector('.glitch-effect');
    expect(element).toHaveAttribute('data-intensity', '7');
  });

  it('applies custom className', () => {
    const { container } = render(
      <GlitchEffect intensity={5} className="custom-glitch">
        <div>Test Content</div>
      </GlitchEffect>
    );

    const element = container.querySelector('.glitch-effect');
    expect(element).toHaveClass('custom-glitch');
  });

  it('triggers glitch effect when trigger prop is true', () => {
    const { container } = render(
      <GlitchEffect intensity={5} trigger={true}>
        <div>Test Content</div>
      </GlitchEffect>
    );

    const element = container.querySelector('.glitch-effect');
    expect(element).toHaveClass('active');
  });

  it('auto-triggers at high intensity', () => {
    const { container } = render(
      <GlitchEffect intensity={9}>
        <div>Test Content</div>
      </GlitchEffect>
    );

    const element = container.querySelector('.glitch-effect');
    expect(element).toHaveClass('active');
  });
});

describe('GlitchText', () => {
  it('renders text correctly', () => {
    render(<GlitchText text="Test Text" intensity={1} />);

    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('applies glitch effect wrapper', () => {
    const { container } = render(<GlitchText text="Test" intensity={5} />);

    const glitchElement = container.querySelector('.glitch-effect');
    expect(glitchElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GlitchText text="Test" intensity={5} className="custom-text" />
    );

    const element = container.querySelector('.custom-text');
    expect(element).toBeInTheDocument();
  });
});
