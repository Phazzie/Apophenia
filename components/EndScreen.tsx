'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { GameStateManager } from '@/src/services/gameStateManager';
import { useI18n } from '@/lib/i18n/useI18n';

const EndScreen: React.FC = () => {
  const router = useRouter();
  const t = useI18n();

  const handleRestart = () => {
    GameStateManager.resetAllStores();
    router.push('/');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center p-8">
      <h1 className="font-creepster text-5xl text-red-500 mb-4" style={{ textShadow: 'var(--glow-red)' }}>
        {t.endScreen.title}
      </h1>
      <p className="text-lg text-gray-300 mb-8">{t.endScreen.subtitle}</p>
      <button
        onClick={handleRestart}
        aria-label={t.endScreen.playAgain}
        className="bg-gray-800 border border-gray-600 text-white py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out hover:bg-gray-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30"
      >
        {t.endScreen.playAgain}
      </button>
    </div>
  );
};

export default EndScreen;
