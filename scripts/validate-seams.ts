
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORBIDDEN_PATHS = [
  'src/components',
  'src/stores'
];

const SCAN_DIRS = [
  'src/core',
  'src/ui',
  'src/services',
  'src/flows'
];

let violations = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for imports
    if (line.match(/^import.*from/)) {
      FORBIDDEN_PATHS.forEach(forbidden => {
        const folderName = path.basename(forbidden); // e.g., "components"

        // Regex to match imports of the forbidden folder
        // Matches: import ... from '.../components...' or '.../stores...'
        const regex = new RegExp(`['"]([\\.\\/]*)\/${folderName}(['"\\/])`);

        if (regex.test(line)) {
          console.error(`VIOLATION in ${filePath}:${index + 1}`);
          console.error(`  Line: ${line.trim()}`);
          console.error(`  Reason: Import from legacy directory '${folderName}' is forbidden.`);
          violations++;
        }
      });
    }
  });
}

function scanDirectory(dir) {
  // Resolve path relative to project root (parent of scripts/)
  const rootDir = path.resolve(__dirname, '..');
  const fullDirPath = path.resolve(rootDir, dir);

  if (!fs.existsSync(fullDirPath)) return;

  const entries = fs.readdirSync(fullDirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(fullDirPath, entry.name);

    if (entry.isDirectory()) {
      // Pass the relative path from root to keep recursion simple if needed
      // But here we construct full path so we can just recurse with relative path logic if we passed relative paths
      // Actually, let's just use the full path for scanning
      const relativePath = path.relative(rootDir, fullPath);
      scanDirectory(relativePath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Starting Seam Validation...');
console.log('Checking for legacy imports in new architecture...');

SCAN_DIRS.forEach(dir => {
  scanDirectory(dir);
});

if (violations > 0) {
  console.error(`\n❌ Validation FAILED: ${violations} seam violations found.`);
  process.exit(1);
} else {
  console.log('\n✅ Validation PASSED: No seam violations found.');
  process.exit(0);
}
