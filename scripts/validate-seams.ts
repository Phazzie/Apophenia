/**
 * #TODO: SEAM SENTINEL - Architectural Validator
 *
 * This script is responsible for enforcing the "Seams" architecture statically.
 * It should be run as part of the CI/CD pipeline and pre-commit hooks.
 *
 * IMPLEMENTATION PLAN:
 * 1. Use `ts-morph` or `typescript` compiler API to parse the AST.
 * 2. Load `src/core/types/seams.ts` to understand the contracts.
 * 3. Scan `src/core/engines/` to ensure:
 *    - All classes implement `Engine` interface.
 *    - No direct imports of Stores (must use `context`).
 *    - No direct mutations of global state.
 * 4. Scan `src/flows/` to ensure:
 *    - Flow classes implement `GameFlow` interface.
 * 5. Report any violations as non-zero exit code.
 *
 * Reference: #TODO.md Section 2 - Component A
 */

console.log("Seam Sentinel is not yet implemented. See #TODO.md.");
process.exit(0); // Temporary pass until implemented
