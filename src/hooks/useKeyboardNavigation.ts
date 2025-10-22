/**
 * Keyboard Navigation Hook
 * 
 * Provides comprehensive keyboard navigation support
 */

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  disabled?: boolean;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    disabled = false,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault();
            onArrowRight();
          }
          break;
        case 'Tab':
          if (onTab) {
            onTab();
          }
          break;
      }
    },
    [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, disabled]
  );

  useEffect(() => {
    if (!disabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, disabled]);
}

/**
 * Hook for choice navigation with keyboard
 */
export function useChoiceNavigation<T>(
  choices: T[],
  onSelect: (choice: T) => void,
  disabled: boolean = false
) {
  const selectedIndex = useRef(0);

  const selectNext = useCallback(() => {
    if (choices.length === 0) return;
    selectedIndex.current = (selectedIndex.current + 1) % choices.length;
    
    // Highlight the selected choice
    const choiceElements = document.querySelectorAll('.choice-button');
    choiceElements.forEach((el, idx) => {
      if (idx === selectedIndex.current) {
        (el as HTMLElement).focus();
      }
    });
  }, [choices]);

  const selectPrevious = useCallback(() => {
    if (choices.length === 0) return;
    selectedIndex.current = selectedIndex.current - 1;
    if (selectedIndex.current < 0) {
      selectedIndex.current = choices.length - 1;
    }
    
    // Highlight the selected choice
    const choiceElements = document.querySelectorAll('.choice-button');
    choiceElements.forEach((el, idx) => {
      if (idx === selectedIndex.current) {
        (el as HTMLElement).focus();
      }
    });
  }, [choices]);

  const confirmSelection = useCallback(() => {
    if (choices.length === 0) return;
    const selected = choices[selectedIndex.current];
    if (selected) {
      onSelect(selected);
    }
  }, [choices, onSelect]);

  useKeyboardNavigation({
    onArrowDown: selectNext,
    onArrowUp: selectPrevious,
    onEnter: confirmSelection,
    disabled,
  });

  return {
    selectedIndex: selectedIndex.current,
    selectNext,
    selectPrevious,
    confirmSelection,
  };
}

/**
 * Detect if user is navigating with keyboard
 */
export function useKeyboardDetection() {
  useEffect(() => {
    let isUsingKeyboard = false;

    const handleMouseDown = () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-nav-active');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-nav-active');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
