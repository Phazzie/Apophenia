/**
 * ThemeProvider Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../../../src/ui/theme/ThemeProvider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset document body styles
    document.body.style.filter = '';
  });

  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('provides theme colors', () => {
    const TestComponent = () => {
      const { colors } = useTheme();
      return <div>{colors.voidDark}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('#0a0e27')).toBeInTheDocument();
  });

  it('initializes with corruption level', () => {
    const TestComponent = () => {
      const { corruptionLevel } = useTheme();
      return <div>{corruptionLevel}</div>;
    };

    render(
      <ThemeProvider initialCorruption={50}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    const TestComponent = () => {
      try {
        useTheme();
        return <div>No error</div>;
      } catch (error) {
        return <div>Error caught</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByText('Error caught')).toBeInTheDocument();
  });

  it('applies corruption effects to document body', () => {
    const TestComponent = () => {
      const { corruptionLevel } = useTheme();
      return <div>Corruption: {corruptionLevel}</div>;
    };

    render(
      <ThemeProvider initialCorruption={75}>
        <TestComponent />
      </ThemeProvider>
    );

    // Check that filter was applied
    expect(document.body.style.filter).toContain('hue-rotate');
  });
});
