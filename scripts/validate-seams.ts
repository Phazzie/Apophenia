import fs from 'fs';
import path from 'path';

// #TODO: Implement full AST-based validation.
// Currently this is a stub/prototype to demonstrate the AADS Seam Validator.

const SEAMS = {
  UI: 'src/ui',
  CORE: 'src/core',
  LEGACY_STORES: 'src/stores',
  LEGACY_COMPONENTS: 'src/components',
};

const VIOLATIONS: string[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Rule 1: UI/Components should not use Legacy Stores (eventually)
  if (filePath.includes(SEAMS.LEGACY_COMPONENTS) || filePath.includes(SEAMS.UI)) {
    if (content.includes("from '../stores/") || content.includes('from "../stores/')) {
       // Warn for now, error later
       // console.warn(`[WARN] Legacy Store Import in: ${filePath}`);
    }
  }

  // Rule 2: Core should not import UI
  if (filePath.includes(SEAMS.CORE)) {
    if (content.includes("from '../ui/") || content.includes('from "../ui/')) {
      VIOLATIONS.push(`[CRITICAL] Core importing UI in: ${filePath}`);
    }
  }
}

function walkDir(dir: string, callback: (file: string) => void) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

console.log('🔍 Starting Seam Validation...');

// Walk source
walkDir('src', scanFile);

if (VIOLATIONS.length > 0) {
  console.error('❌ Seam Validation FAILED:');
  VIOLATIONS.forEach(v => console.error(v));
  process.exit(1);
} else {
  console.log('✅ Seam Validation PASSED (Preliminary)');
}
