import { useState, useEffect, useRef, useCallback } from 'react';
import { useWorldStateStore } from '../core/state/worldStateStore';
import { GameStepResult } from '../types';
import { devMode } from '../utils/devMode';

export const useGameEffects = () => {
  const { worldState, updateWorld } = useWorldStateStore();
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [corruptionEffects, setCorruptionEffects] = useState<React.CSSProperties>({});
  const [quantumShiftNotification, setQuantumShiftNotification] = useState(false);

  // Track active timeouts to prevent memory leaks
  const quantumTimeoutRef = useRef<number | null>(null);
  const metaTimeoutRef = useRef<number | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (quantumTimeoutRef.current) {
        window.clearTimeout(quantumTimeoutRef.current);
      }
      if (metaTimeoutRef.current) {
        window.clearTimeout(metaTimeoutRef.current);
      }
    };
  }, []);

  const handleGameEffects = useCallback((result: Partial<GameStepResult>) => {
    // Handle quantum narrative shifts
    if (result.quantumShift) {
      setQuantumShiftNotification(true);

      // Clear existing timeout if any
      if (quantumTimeoutRef.current) {
        window.clearTimeout(quantumTimeoutRef.current);
      }

      quantumTimeoutRef.current = window.setTimeout(() => {
        setQuantumShiftNotification(false);
        quantumTimeoutRef.current = null;
      }, 4000);

      devMode.log('GameEffects', '🌌 QUANTUM SHIFT: Reality has branched into an alternate timeline');
    }

    // Handle meta-consciousness events
    if (result.metaMessage) {
      setMetaMessage(result.metaMessage);

      // Clear existing timeout if any
      if (metaTimeoutRef.current) {
        window.clearTimeout(metaTimeoutRef.current);
      }

      metaTimeoutRef.current = window.setTimeout(() => {
        setMetaMessage(null);
        metaTimeoutRef.current = null;
      }, 8000);

      devMode.log('GameEffects', '🤖 META EVENT: AI consciousness activated');
    }

    // Handle reality corruption
    if (result.corruptionEffect) {
      setCorruptionEffects(result.corruptionEffect.visualEffect);
      // #TODO: API Consistency - Ensure 'updateWorld' is the correct method name.
      // Reference: #TODO.md - Task 2
      updateWorld({
        systemHealth: Math.max(
          0,
          worldState.systemHealth - result.corruptionEffect.level * 10,
        ),
      });
      devMode.log('GameEffects', '⚡ REALITY CORRUPTION: Interface integrity compromised');
    }
  }, [worldState.systemHealth, updateWorld]);

  return {
    metaMessage,
    corruptionEffects,
    quantumShiftNotification,
    handleGameEffects,
  };
};