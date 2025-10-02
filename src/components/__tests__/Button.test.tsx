
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';
import { vi } from 'vitest';

describe('Button', () => {
  it('renders the button with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when the disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies the correct classes for the given variant', () => {
    const { container: containerPrimary } = render(<Button variant="primary">Primary</Button>);
    expect(containerPrimary.firstChild).toHaveClass('btn-primary');

    const { container: containerSecondary } = render(<Button variant="secondary">Secondary</Button>);
    expect(containerSecondary.firstChild).toHaveClass('btn-secondary');
  });

  it('applies any additional classNames', () => {
    const { container } = render(<Button className="extra-class">Custom</Button>);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
