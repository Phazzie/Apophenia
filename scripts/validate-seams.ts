/**
 * SEAM VALIDATOR SCRIPT
 *
 * This script statically checks for architectural violations.
 * It enforces the "seams" between different parts of the application.
 *
 * #TODO TOOLING: Implement this script.
 * Requirements:
 * 1. Scan all files in `src/core`, `src/ui`, `src/services`.
 * 2. Error if any file imports directly from `src/stores` (except `src/core/state/index.ts`).
 * 3. Error if any file imports directly from `src/components` (legacy).
 * 4. Error if `src/types.ts` is imported (deprecated).
 *
 * Usage: npx ts-node scripts/validate-seams.ts
 */

console.log('🚧 Seam Validator not yet implemented. See #TODO.md');
process.exit(0); // Exit success for now to not block build
