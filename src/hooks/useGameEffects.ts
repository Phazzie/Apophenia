import { useState } from 'react';
import { useWorldStateStore } from '../stores/worldStateStore';
import { GameStepResult } from '../types';

export const useGameEffects = () => {
  const { worldState, updateWorldState } = useWorldStateStore();
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [corruptionEffects, setCorruptionEffects] = useState<React.CSSProperties>({});
  const [quantumShiftNotification, setQuantumShiftNotification] = useState(false);

  const handleGameEffects = (result: Partial<GameStepResult>) => {
    // Handle quantum narrative shifts
    if (result.quantumShift) {
      setQuantumShiftNotification(true);
      setTimeout(() => setQuantumShiftNotification(false), 4000);
      console.log('🌌 QUANTUM SHIFT: Reality has branched into an alternate timeline');
    }

    // Handle meta-consciousness events
    if (result.metaMessage) {
      setMetaMessage(result.metaMessage);
      setTimeout(() => setMetaMessage(null), 8000);
      console.log('🤖 META EVENT: AI consciousness activated');
    }

    // Handle reality corruption
    if (result.corruptionEffect) {
      setCorruptionEffects(result.corruptionEffect.visualEffect);
      updateWorldState({
        systemHealth: Math.max(
          0,
          worldState.systemHealth - result.corruptionEffect.level * 10,
        ),
      });
      console.log('⚡ REALITY CORRUPTION: Interface integrity compromised');
    }
  };

  return {
    metaMessage,
    corruptionEffects,
    quantumShiftNotification,
    handleGameEffects,
  };
};