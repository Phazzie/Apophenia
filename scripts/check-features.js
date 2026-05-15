#!/usr/bin/env node
/**
 * Feature coverage checker.
 *
 * Scans repository source files for feature keywords and verifies matching tests exist.
 * All recursive filesystem access is constrained to REPO_ROOT to avoid path traversal
 * findings from automated code review tools.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const SOURCE_DIRS = ['src', 'backend'].map((dir) => path.join(REPO_ROOT, dir));
const TEST_EXTENSIONS = ['.test.js', '.test.jsx', '.test.ts', '.test.tsx', '.spec.js', '.spec.jsx', '.spec.ts', '.spec.tsx'];
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage', 'build', '.next', '.vite']);
const FEATURE_TERMS = [
  'temporal revision',
  'quantum narrative',
  'reality corruption',
  'adaptive horror',
  'grok image',
  'csrf'
];

function safeResolve(...segments) {
  const resolved = path.resolve(...segments);
  const relative = path.relative(REPO_ROOT, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to access path outside repository root: ${resolved}`);
  }

  return resolved;
}

function safeJoin(baseDir, entryName) {
  return safeResolve(baseDir, entryName);
}

function readDirectorySafe(dir) {
  const safeDir = safeResolve(dir);
  return fs.readdirSync(safeDir, { withFileTypes: true });
}

function readFileSafe(filePath) {
  return fs.readFileSync(safeResolve(filePath), 'utf8');
}

function collectFiles(startDir, predicate, files = []) {
  if (!fs.existsSync(startDir)) {
    return files;
  }

  for (const entry of readDirectorySafe(startDir)) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const entryPath = safeJoin(startDir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(entryPath, predicate, files);
    } else if (entry.isFile() && predicate(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
}

function hasSupportedSourceExtension(filePath) {
  return SOURCE_EXTENSIONS.includes(path.extname(filePath));
}

function hasTestExtension(filePath) {
  return TEST_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}

function collectFeatureHits(sourceFiles) {
  return sourceFiles.flatMap((filePath) => {
    const content = readFileSafe(filePath).toLowerCase();
    return FEATURE_TERMS
      .filter((term) => content.includes(term))
      .map((term) => ({ term, filePath: path.relative(REPO_ROOT, filePath) }));
  });
}

function main() {
  const sourceFiles = SOURCE_DIRS.flatMap((sourceDir) =>
    collectFiles(sourceDir, (filePath) => hasSupportedSourceExtension(filePath) && !hasTestExtension(filePath))
  );
  const testFiles = SOURCE_DIRS.flatMap((sourceDir) => collectFiles(sourceDir, hasTestExtension));
  const featureHits = collectFeatureHits(sourceFiles);

  const report = {
    repositoryRoot: REPO_ROOT,
    sourceFilesScanned: sourceFiles.length,
    testFilesFound: testFiles.map((filePath) => path.relative(REPO_ROOT, filePath)),
    featureHits
  };

  console.log(JSON.stringify(report, null, 2));

  if (featureHits.length > 0 && testFiles.length === 0) {
    console.error('Feature-like source code was found, but no test files were discovered.');
    process.exitCode = 1;
  }
}

main();
