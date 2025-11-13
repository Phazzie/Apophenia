/**
 * LocalStorage Key Migration Utility
 *
 * Migrates data from old localStorage keys (cosmic-narrative-*) to new keys (apophenia-*).
 * This ensures users don't lose their game state when upgrading to the new store architecture.
 *
 * Run this ONCE at app initialization before any stores are accessed.
 */

interface MigrationMapping {
  oldKey: string;
  newKey: string;
  transform?: (oldData: any) => any;
}

const MIGRATIONS: MigrationMapping[] = [
  {
    oldKey: 'cosmic-narrative-gamestate',
    newKey: 'apophenia-game-state',
    // Game state migration: no transformation needed
  },
  {
    oldKey: 'cosmic-narrative-worldstate',
    newKey: 'apophenia-world-state',
    // World state migration: no transformation needed
  },
  {
    oldKey: 'cosmic-narrative-storyhistory',
    newKey: 'apophenia-history',
    // History migration: rename 'storyHistory' field to 'segments'
    transform: (oldData: any) => {
      if (oldData && oldData.storyHistory) {
        return {
          segments: oldData.storyHistory,
        };
      }
      return oldData;
    },
  },
  {
    oldKey: 'cosmic-narrative-profile',
    newKey: 'apophenia-player-profile',
    // Profile migration: no transformation needed
  },
  // Note: Image cache already uses correct key (apophenia-image-cache)
  // Note: AI model store already uses correct key (ai-model-store -> apophenia-ai-model)
];

/**
 * Migrate localStorage data from old keys to new keys.
 * Safe to call multiple times - will skip if new key already exists.
 */
export function migrateLocalStorageKeys(): void {
  console.log('🔄 Starting localStorage key migration...');

  let migratedCount = 0;
  let skippedCount = 0;

  for (const migration of MIGRATIONS) {
    try {
      // Check if new key already exists
      const existingData = localStorage.getItem(migration.newKey);
      if (existingData) {
        console.log(`⏭️  Skipping ${migration.oldKey} -> ${migration.newKey} (new key exists)`);
        skippedCount++;
        continue;
      }

      // Check if old key exists
      const oldData = localStorage.getItem(migration.oldKey);
      if (!oldData) {
        console.log(`⏭️  Skipping ${migration.oldKey} -> ${migration.newKey} (no old data)`);
        skippedCount++;
        continue;
      }

      // Parse old data
      let parsedData: any;
      try {
        parsedData = JSON.parse(oldData);
      } catch (parseError) {
        console.error(`❌ Failed to parse ${migration.oldKey}:`, parseError);
        continue;
      }

      // Transform if needed
      const transformedData = migration.transform
        ? migration.transform(parsedData)
        : parsedData;

      // Write to new key
      localStorage.setItem(migration.newKey, JSON.stringify(transformedData));
      console.log(`✅ Migrated ${migration.oldKey} -> ${migration.newKey}`);
      migratedCount++;

      // Optionally remove old key (commented out for safety)
      // localStorage.removeItem(migration.oldKey);
    } catch (error) {
      console.error(`❌ Error migrating ${migration.oldKey}:`, error);
    }
  }

  console.log(
    `✨ Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`
  );
}

/**
 * Clean up old localStorage keys after migration is confirmed successful.
 * Call this manually or after a grace period.
 */
export function cleanupOldStorageKeys(): void {
  console.log('🧹 Cleaning up old localStorage keys...');

  let deletedCount = 0;

  for (const migration of MIGRATIONS) {
    try {
      const oldData = localStorage.getItem(migration.oldKey);
      if (oldData) {
        localStorage.removeItem(migration.oldKey);
        console.log(`🗑️  Removed ${migration.oldKey}`);
        deletedCount++;
      }
    } catch (error) {
      console.error(`❌ Error removing ${migration.oldKey}:`, error);
    }
  }

  console.log(`✨ Cleanup complete: ${deletedCount} old keys removed`);
}
