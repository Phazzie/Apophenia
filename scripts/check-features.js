#!/usr/bin/env node

/**
 * Feature Spec Guard - Prevents Phantom Features
 * 
 * This script validates that claimed features in PRs actually exist in the codebase
 * with corresponding implementation files and tests.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Feature keywords that indicate new functionality
const FEATURE_KEYWORDS = [
  'feature', 'implement', 'add', 'create', 'new', 'build',
  'integrate', 'support', 'enable', 'introduce', 'develop'
];

// File extensions to check for implementation
const IMPL_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const TEST_EXTENSIONS = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

/**
 * Extract potential feature claims from PR title and description
 */
function extractFeatureClaims(text) {
  const claims = [];
  const lines = text.toLowerCase().split('\n');
  
  for (const line of lines) {
    for (const keyword of FEATURE_KEYWORDS) {
      if (line.includes(keyword)) {
        // Extract the feature claim (simplified heuristic)
        const words = line.split(' ');
        const keywordIndex = words.findIndex(word => word.includes(keyword));
        if (keywordIndex >= 0 && keywordIndex < words.length - 2) {
          const claim = words.slice(keywordIndex, keywordIndex + 5).join(' ');
          claims.push(claim.replace(/[^\w\s]/g, '').trim());
        }
      }
    }
  }
  
  return [...new Set(claims)]; // Remove duplicates
}

/**
 * Check if a feature has corresponding implementation files
 */
function findImplementationFiles(featureName) {
  const searchTerms = featureName.split(' ').filter(word => word.length > 2);
  const foundFiles = [];
  
  // Recursively search src directory
  function searchDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          searchDirectory(path.join(dir, entry.name));
        } else if (entry.isFile() && IMPL_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
          const filePath = path.join(dir, entry.name);
          const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
          
          // Check if file contains terms related to the feature
          if (searchTerms.some(term => content.includes(term.toLowerCase()))) {
            foundFiles.push(filePath);
          }
        }
      }
    } catch (err) {
      console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
    }
  }
  
  searchDirectory('./src');
  return foundFiles;
}

/**
 * Check if a feature has corresponding test files
 */
function findTestFiles(featureName) {
  const searchTerms = featureName.split(' ').filter(word => word.length > 2);
  const foundFiles = [];
  
  // Search for test files
  function searchForTests(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          searchForTests(path.join(dir, entry.name));
        } else if (entry.isFile() && TEST_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
          const filePath = path.join(dir, entry.name);
          const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
          
          // Check if test file contains terms related to the feature
          if (searchTerms.some(term => content.includes(term.toLowerCase()))) {
            foundFiles.push(filePath);
          }
        }
      }
    } catch (err) {
      console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
    }
  }
  
  searchForTests('./src');
  return foundFiles;
}

/**
 * Check FEATURES.md for feature registration
 */
function checkFeatureRegistry(featureName) {
  if (!fs.existsSync('./FEATURES.md')) {
    return { registered: false, reason: 'FEATURES.md not found' };
  }
  
  const content = fs.readFileSync('./FEATURES.md', 'utf8').toLowerCase();
  const searchTerms = featureName.split(' ').filter(word => word.length > 2);
  
  const isRegistered = searchTerms.some(term => content.includes(term.toLowerCase()));
  
  return {
    registered: isRegistered,
    reason: isRegistered ? 'Found in FEATURES.md' : 'Not registered in FEATURES.md'
  };
}

/**
 * Validate a single feature claim
 */
function validateFeature(featureName) {
  console.log(`\n🔍 Validating feature: "${featureName}"`);
  
  const implementation = findImplementationFiles(featureName);
  const tests = findTestFiles(featureName);
  const registry = checkFeatureRegistry(featureName);
  
  const validation = {
    feature: featureName,
    hasImplementation: implementation.length > 0,
    hasTests: tests.length > 0,
    isRegistered: registry.registered,
    implementationFiles: implementation,
    testFiles: tests,
    registryStatus: registry.reason
  };
  
  // Determine if feature is valid
  const isValid = validation.hasImplementation && validation.hasTests;
  
  console.log(`   Implementation: ${validation.hasImplementation ? '✅' : '❌'} (${implementation.length} files)`);
  console.log(`   Tests: ${validation.hasTests ? '✅' : '❌'} (${tests.length} files)`);
  console.log(`   Registry: ${validation.isRegistered ? '✅' : '⚠️'} (${registry.reason})`);
  
  return { ...validation, isValid };
}

/**
 * Main validation function
 */
function main() {
  console.log('🛡️  Feature Spec Guard - Phantom Feature Detector\n');
  
  // Get PR title and description from environment or command line
  const prTitle = process.env.PR_TITLE || process.argv[2] || '';
  const prDescription = process.env.PR_DESCRIPTION || process.argv[3] || '';
  
  if (!prTitle && !prDescription) {
    console.log('ℹ️  No PR title or description provided. Skipping feature validation.');
    console.log('   Usage: node scripts/check-features.js "PR Title" "PR Description"');
    console.log('   Or set PR_TITLE and PR_DESCRIPTION environment variables.');
    process.exit(0);
  }
  
  const fullText = `${prTitle}\n${prDescription}`;
  const featureClaims = extractFeatureClaims(fullText);
  
  if (featureClaims.length === 0) {
    console.log('✅ No feature claims detected in PR. Validation passed.');
    process.exit(0);
  }
  
  console.log(`📋 Detected ${featureClaims.length} potential feature claims:`);
  featureClaims.forEach((claim, i) => console.log(`   ${i + 1}. "${claim}"`));
  
  let allValid = true;
  const results = [];
  
  for (const claim of featureClaims) {
    const result = validateFeature(claim);
    results.push(result);
    
    if (!result.isValid) {
      allValid = false;
    }
  }
  
  console.log('\n📊 Feature Validation Summary:');
  console.log('═'.repeat(50));
  
  for (const result of results) {
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`${status}: "${result.feature}"`);
    
    if (!result.isValid) {
      if (!result.hasImplementation) {
        console.log('   ❌ Missing implementation files');
      }
      if (!result.hasTests) {
        console.log('   ❌ Missing test files');
      }
    }
  }
  
  if (allValid) {
    console.log('\n🎉 All feature claims validated successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Feature validation FAILED!');
    console.log('\n🚨 PHANTOM FEATURES DETECTED:');
    console.log('   Some claimed features lack proper implementation or tests.');
    console.log('   Please ensure all new features have:');
    console.log('   1. Implementation files in src/');
    console.log('   2. Test files with adequate coverage');
    console.log('   3. Registration in FEATURES.md (recommended)');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractFeatureClaims, validateFeature, findImplementationFiles, findTestFiles };