/**
 * ChoiceButton Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoiceButton, ChoiceList } from '../../../../src/ui/components/ChoiceButton';
import { Choice } from '../../../../src/core/types/seams';

describe('ChoiceButton', () => {
  const mockChoice: Choice = {
    id: 'choice-1',
    text: 'Test choice text',
    consequence: 'Test consequence'
  };

  it('renders choice text correctly', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} />
    );

    expect(screen.getByText('Test choice text')).toBeInTheDocument();
  });

  it('renders consequence when provided', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} />
    );

    expect(screen.getByText('Test consequence')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} disabled={true} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('applies intrusive styling when intrusive prop is true', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} intrusive={true} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('intrusive');
  });

  it('applies intrusive styling when choice.isIntrusive is true', () => {
    const intrusiveChoice: Choice = {
      ...mockChoice,
      isIntrusive: true
    };
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={intrusiveChoice} onClick={onClickMock} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('intrusive');
  });

  it('applies custom className', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton
        choice={mockChoice}
        onClick={onClickMock}
        className="custom-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has correct data attributes', () => {
    const onClickMock = vi.fn();

    render(
      <ChoiceButton choice={mockChoice} onClick={onClickMock} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-choice-id', 'choice-1');
    // React removes boolean attributes when they're false, so check it's not present
    expect(button).not.toHaveAttribute('data-intrusive');
  });
});

describe('ChoiceList', () => {
  const mockChoices: Choice[] = [
    { id: 'choice-1', text: 'Choice 1' },
    { id: 'choice-2', text: 'Choice 2' },
    { id: 'choice-3', text: 'Choice 3' }
  ];

  const mockIntrusiveThought: Choice = {
    id: 'intrusive-1',
    text: 'Intrusive thought',
    isIntrusive: true
  };

  it('renders all choices', () => {
    const onChoiceMock = vi.fn();

    render(
      <ChoiceList choices={mockChoices} onChoice={onChoiceMock} />
    );

    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
    expect(screen.getByText('Choice 3')).toBeInTheDocument();
  });

  it('renders intrusive thought when provided', () => {
    const onChoiceMock = vi.fn();

    render(
      <ChoiceList
        choices={mockChoices}
        intrusiveThought={mockIntrusiveThought}
        onChoice={onChoiceMock}
      />
    );

    expect(screen.getByText('Intrusive thought')).toBeInTheDocument();
  });

  it('calls onChoice with correct choice when clicked', () => {
    const onChoiceMock = vi.fn();

    render(
      <ChoiceList choices={mockChoices} onChoice={onChoiceMock} />
    );

    const button = screen.getByText('Choice 1').closest('button');
    fireEvent.click(button!);

    expect(onChoiceMock).toHaveBeenCalledWith(mockChoices[0]);
  });

  it('disables all buttons when disabled prop is true', () => {
    const onChoiceMock = vi.fn();

    render(
      <ChoiceList choices={mockChoices} onChoice={onChoiceMock} disabled={true} />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const onChoiceMock = vi.fn();
    const { container } = render(
      <ChoiceList
        choices={mockChoices}
        onChoice={onChoiceMock}
        className="custom-list"
      />
    );

    const list = container.querySelector('.choice-list');
    expect(list).toHaveClass('custom-list');
  });
});
