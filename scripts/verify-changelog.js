#!/usr/bin/env node

/**
 * Changelog Verification Script
 * 
 * Ensures that PR changes are properly documented in CHANGELOG.md
 * and that changelog entries correspond to actual code changes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get the list of changed files in the current PR/branch
 */
function getChangedFiles() {
  try {
    // Try to get changed files from git diff
    let gitCommand;
    
    // Check if we're in a CI environment with a PR
    if (process.env.GITHUB_BASE_REF) {
      // GitHub Actions PR environment
      gitCommand = `git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`;
    } else if (process.env.CI) {
      // Generic CI environment
      gitCommand = 'git diff --name-only HEAD~1';
    } else {
      // Local development
      gitCommand = 'git diff --name-only HEAD~1';
    }
    
    const output = execSync(gitCommand, { encoding: 'utf8' }).trim();
    return output ? output.split('\n').filter(file => file.trim()) : [];
  } catch (error) {
    console.warn('Warning: Could not get changed files from git:', error.message);
    return [];
  }
}

/**
 * Parse CHANGELOG.md to extract recent entries
 */
function parseChangelog() {
  if (!fs.existsSync('./CHANGELOG.md')) {
    return { entries: [], hasUnreleased: false, lastUpdate: null };
  }
  
  const content = fs.readFileSync('./CHANGELOG.md', 'utf8');
  const lines = content.split('\n');
  
  let entries = [];
  let currentSection = null;
  let currentVersion = null;
  let hasUnreleased = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match version headers like ## [0.4.0] or ## [Unreleased]
    const versionMatch = line.match(/^##\s*\[([^\]]+)\]/);
    if (versionMatch) {
      currentVersion = versionMatch[1];
      if (currentVersion.toLowerCase().includes('unreleased') || 
          currentVersion.includes('XX') || 
          currentVersion.includes('TBD')) {
        hasUnreleased = true;
      }
      continue;
    }
    
    // Match section headers like ### Added
    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    
    // Match changelog entries (lines starting with -)
    if (line.startsWith('-') && currentSection && currentVersion) {
      entries.push({
        version: currentVersion,
        section: currentSection,
        entry: line.substring(1).trim(),
        line: i + 1
      });
    }
  }
  
  // Find the most recent date in changelog
  const dateMatch = content.match(/\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
  const lastUpdate = dateMatch ? new Date(dateMatch[2]) : null;
  
  return { entries, hasUnreleased, lastUpdate };
}

/**
 * Extract meaningful keywords from file paths and changelog entries
 */
function extractKeywords(text) {
  // Remove common prefixes/suffixes and extract meaningful parts
  return text
    .toLowerCase()
    .replace(/\.(ts|tsx|js|jsx|json|md)$/, '')
    .replace(/^(src\/|scripts\/|e2e\/)/, '')
    .replace(/(__tests__|\.test|\.spec)/, '')
    .split(/[\/\-_\s]+/)
    .filter(word => word.length > 2)
    .filter(word => !['component', 'service', 'store', 'util', 'helper'].includes(word));
}

/**
 * Check if changelog entries match the changed files
 */
function validateChangelogEntries(changedFiles, changelogEntries) {
  if (changedFiles.length === 0) {
    return { valid: true, reason: 'No files changed' };
  }
  
  // Skip validation for certain file types that don't require changelog entries
  const skipFiles = changedFiles.filter(file => 
    file.match(/\.(md|txt|yml|yaml|json)$/) && 
    !file.includes('package.json') &&
    !file.includes('CHANGELOG.md')
  );
  
  const significantFiles = changedFiles.filter(file => !skipFiles.includes(file));
  
  if (significantFiles.length === 0) {
    return { valid: true, reason: 'Only documentation/config files changed' };
  }
  
  // Get recent changelog entries (within last 2 versions)
  const recentEntries = changelogEntries.slice(0, 20); // Last 20 entries
  
  if (recentEntries.length === 0) {
    return { 
      valid: false, 
      reason: 'No recent changelog entries found, but significant files were changed',
      details: { changedFiles: significantFiles, entries: [] }
    };
  }
  
  // Extract keywords from changed files
  const fileKeywords = new Set();
  significantFiles.forEach(file => {
    extractKeywords(file).forEach(keyword => fileKeywords.add(keyword));
  });
  
  // Extract keywords from changelog entries
  const entryKeywords = new Set();
  recentEntries.forEach(entry => {
    extractKeywords(entry.entry).forEach(keyword => entryKeywords.add(keyword));
  });
  
  // Check for overlap between file changes and changelog entries
  const overlap = [...fileKeywords].filter(keyword => entryKeywords.has(keyword));
  const hasSignificantOverlap = overlap.length > 0 || fileKeywords.size <= 2;
  
  return {
    valid: hasSignificantOverlap,
    reason: hasSignificantOverlap 
      ? 'Changelog entries appear to match changed files'
      : 'Changelog entries may not cover all changed files',
    details: {
      changedFiles: significantFiles,
      fileKeywords: [...fileKeywords],
      entryKeywords: [...entryKeywords],
      overlap,
      recentEntries: recentEntries.slice(0, 5) // Show first 5 entries
    }
  };
}

/**
 * Check if CHANGELOG.md itself was updated in this PR
 */
function wasChangelogUpdated(changedFiles) {
  return changedFiles.some(file => 
    file.toLowerCase().includes('changelog') && 
    file.endsWith('.md')
  );
}

/**
 * Main validation function
 */
function main() {
  console.log('📝 Changelog Verification - Ensuring Changes are Documented\n');
  
  const changedFiles = getChangedFiles();
  const changelog = parseChangelog();
  const changelogUpdated = wasChangelogUpdated(changedFiles);
  
  console.log(`📁 Found ${changedFiles.length} changed files:`);
  changedFiles.slice(0, 10).forEach(file => console.log(`   ${file}`));
  if (changedFiles.length > 10) {
    console.log(`   ... and ${changedFiles.length - 10} more`);
  }
  
  console.log(`\n📋 Found ${changelog.entries.length} changelog entries`);
  console.log(`📅 Has unreleased section: ${changelog.hasUnreleased ? '✅' : '❌'}`);
  console.log(`🔄 Changelog updated in PR: ${changelogUpdated ? '✅' : '❌'}`);
  
  // Validate changelog entries against changed files
  const validation = validateChangelogEntries(changedFiles, changelog.entries);
  
  console.log('\n📊 Changelog Validation Results:');
  console.log('═'.repeat(50));
  
  let exitCode = 0;
  
  // Check 1: Significant changes should have changelog updates
  const hasSignificantChanges = changedFiles.some(file => 
    file.startsWith('src/') && 
    (file.endsWith('.ts') || file.endsWith('.tsx')) &&
    !file.includes('.test.') &&
    !file.includes('.spec.')
  );
  
  if (hasSignificantChanges && !changelogUpdated) {
    console.log('❌ FAIL: Significant code changes detected but CHANGELOG.md not updated');
    console.log('   Please update CHANGELOG.md with a description of your changes');
    exitCode = 1;
  } else if (hasSignificantChanges && changelogUpdated) {
    console.log('✅ PASS: CHANGELOG.md updated for significant changes');
  } else {
    console.log('✅ PASS: No significant changes requiring changelog update');
  }
  
  // Check 2: Changelog entries should match changed files
  if (validation.valid) {
    console.log(`✅ PASS: ${validation.reason}`);
  } else {
    console.log(`⚠️  WARNING: ${validation.reason}`);
    console.log('   This might indicate missing or mismatched changelog entries');
    
    if (validation.details) {
      console.log('\n🔍 Details:');
      if (validation.details.changedFiles?.length > 0) {
        console.log(`   Changed files: ${validation.details.changedFiles.join(', ')}`);
      }
      if (validation.details.fileKeywords?.length > 0) {
        console.log(`   File keywords: ${validation.details.fileKeywords.join(', ')}`);
      }
      if (validation.details.overlap?.length > 0) {
        console.log(`   Matching keywords: ${validation.details.overlap.join(', ')}`);
      }
    }
  }
  
  // Check 3: Unreleased section exists for active development
  if (!changelog.hasUnreleased && hasSignificantChanges) {
    console.log('⚠️  WARNING: No [Unreleased] section found in CHANGELOG.md');
    console.log('   Consider adding an [Unreleased] section for ongoing development');
  }
  
  if (exitCode === 0) {
    console.log('\n🎉 Changelog validation passed!');
  } else {
    console.log('\n💥 Changelog validation failed!');
    console.log('\n📝 Please ensure:');
    console.log('   1. CHANGELOG.md is updated when making significant changes');
    console.log('   2. Changelog entries accurately describe the changes made');
    console.log('   3. Follow the Keep a Changelog format');
  }
  
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { 
  parseChangelog, 
  validateChangelogEntries, 
  getChangedFiles, 
  extractKeywords 
};