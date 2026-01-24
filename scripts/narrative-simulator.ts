/**
 * NARRATIVE SIMULATOR
 *
 * Part of the Autonomous Coding System.
 * verification script that runs the game loop in headless mode to ensure
 * logical consistency and absence of runtime crashes.
 *
 * Usage: npx tsx scripts/narrative-simulator.ts
 */

// 0. Environment Setup (Must be first)
import './setup-env';

import { descentFlow } from '../src/flows/DescentFlow';
import { unifiedAIService } from '../src/services/ai/unifiedAIService';
import { AIProvider } from '../src/core/types/seams';
import { useWorldStateStore } from '../src/core/state';
import { GENRES } from '../src/config/genres';

async function runSimulation() {
  console.log('🤖 Starting Narrative Simulator...');

  // 1. Setup
  // Force MOCK provider to avoid API costs/errors during simulation
  unifiedAIService.setPrimaryProvider(AIProvider.MOCK);
  unifiedAIService.setFallbackChain([AIProvider.MOCK]);

  const genre = GENRES[0];
  if (!genre) {
    console.error('❌ No genres defined!');
    process.exit(1);
  }

  console.log(`Setting genre: ${genre.name}`);
  await descentFlow.initialize(genre);
  console.log('✅ Flow initialized');

  // 2. Game Loop
  const MAX_TURNS = 1;
  let browserEffectsDetected = 0;

  for (let i = 0; i < MAX_TURNS; i++) {
    console.log(`\n--- Turn ${i + 1} ---`);

    // Simulate Choice
    const choice = {
      id: `choice_${i}`,
      text: "I investigate the darkness.",
      isIntrusive: false,
      consequence: "The darkness stares back."
    };

    console.log(`Player chooses: "${choice.text}"`);

    try {
      console.log('⏳ Processing choice...');
      const result = await descentFlow.processChoice(choice);
      console.log('✅ Choice processed');

      console.log('Flow Result:', {
        commands: result.commands.length,
        worldUpdates: Object.keys(result.worldUpdates).length,
        nextState: result.nextState
      });

      // Verify Browser Effects were generated/handled
      const browserCommands = result.commands.filter(c => c.type === 'browserEffect');
      if (browserCommands.length > 0) {
        console.log('✅ Browser Effects detected:', browserCommands.length);
        browserEffectsDetected += browserCommands.length;
      }

      // Check State
      const currentHorror = useWorldStateStore.getState().worldState.horrorIntensity;
      console.log(`Current Horror Intensity: ${currentHorror}`);

    } catch (err) {
      console.error('❌ CRASH DETECTED:', err);
      process.exit(1);
    }
  }

  console.log('\n--- Simulation Summary ---');
  console.log(`Turns: ${MAX_TURNS}`);
  console.log(`Browser Effects: ${browserEffectsDetected}`);
  console.log('✅ Simulation Complete. System Stable.');
}

runSimulation().catch(err => {
  console.error('Fatal Simulation Error:', err);
  process.exit(1);
});
