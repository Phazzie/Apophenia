/**
 * CorruptionEffect Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorruptionEffect, useCorruptionEffect } from '../../../../src/ui/effects/CorruptionEffect';

describe('CorruptionEffect', () => {
  it('renders children correctly', () => {
    render(
      <CorruptionEffect level={0}>
        <div>Test Content</div>
      </CorruptionEffect>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies corruption level as data attribute', () => {
    const { container } = render(
      <CorruptionEffect level={50}>
        <div>Test Content</div>
      </CorruptionEffect>
    );

    const element = container.querySelector('.corruption-effect');
    expect(element).toHaveAttribute('data-corruption-level', '50');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CorruptionEffect level={25} className="custom-class">
        <div>Test Content</div>
      </CorruptionEffect>
    );

    const element = container.querySelector('.corruption-effect');
    expect(element).toHaveClass('custom-class');
  });

  it('applies CSS transformations based on corruption level', () => {
    const { container } = render(
      <CorruptionEffect level={100}>
        <div>Test Content</div>
      </CorruptionEffect>
    );

    const element = container.querySelector('.corruption-effect') as HTMLElement;
    expect(element.style.filter).toBeTruthy();
    expect(element.style.transform).toBeTruthy();
  });

  it('applies glitch animation at high corruption', () => {
    const { container } = render(
      <CorruptionEffect level={80}>
        <div>Test Content</div>
      </CorruptionEffect>
    );

    const element = container.querySelector('.corruption-effect') as HTMLElement;
    // Animation should be applied
    expect(element.style.animation).toContain('glitch');
  });
});

describe('useCorruptionEffect', () => {
  it('returns corruption effect functions', () => {
    const TestComponent = () => {
      const { applyTo, remove, level } = useCorruptionEffect(50);
      return (
        <div>
          <span>Level: {level}</span>
          <span>Apply: {typeof applyTo}</span>
          <span>Remove: {typeof remove}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Level: 50')).toBeInTheDocument();
    expect(screen.getByText('Apply: function')).toBeInTheDocument();
    expect(screen.getByText('Remove: function')).toBeInTheDocument();
  });
});
