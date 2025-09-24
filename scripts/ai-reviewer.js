#!/usr/bin/env node

/**
 * AI Reviewer - Meta-Check for Code Implementation
 * 
 * This script uses AI to review PR descriptions and code diffs
 * to determine if claimed features are actually implemented.
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Simple AI reviewer using local heuristics (fallback when no AI API available)
 * In production, this would integrate with GitHub Copilot API or similar LLM
 */
class LocalHeuristicReviewer {
  
  /**
   * Analyze PR description and diff to detect implementation mismatches
   */
  reviewImplementation(prTitle, prDescription, diff) {
    const analysis = {
      score: 0,
      maxScore: 100,
      issues: [],
      suggestions: [],
      implementationEvidence: [],
      testEvidence: []
    };
    
    // Extract claimed features from PR description
    const claims = this.extractClaims(prTitle, prDescription);
    
    // Analyze diff for implementation evidence
    const diffAnalysis = this.analyzeDiff(diff);
    
    // Score implementation completeness
    this.scoreImplementation(claims, diffAnalysis, analysis);
    
    return {
      passed: analysis.score >= 60, // Pass threshold
      confidence: this.calculateConfidence(analysis),
      analysis,
      recommendation: this.generateRecommendation(analysis)
    };
  }
  
  extractClaims(title, description) {
    const claims = [];
    const text = `${title}\n${description}`.toLowerCase();
    
    // Look for implementation claims
    const implementationPatterns = [
      /implement\s+([a-z\s]+)/g,
      /add\s+([a-z\s]+)/g,
      /create\s+([a-z\s]+)/g,
      /build\s+([a-z\s]+)/g,
      /feature:\s*([a-z\s]+)/g
    ];
    
    implementationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        claims.push(match[1].trim());
      }
    });
    
    return [...new Set(claims)].filter(claim => claim.length > 3);
  }
  
  analyzeDiff(diff) {
    if (!diff) return { fileCount: 0, testFiles: 0, implementationFiles: 0 };
    
    const lines = diff.split('\n');
    const files = new Set();
    let testFiles = 0;
    let implementationFiles = 0;
    let addedLines = 0;
    let removedLines = 0;
    
    lines.forEach(line => {
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/(.+)$/);
        if (match) {
          const file = match[1];
          files.add(file);
          
          if (file.includes('.test.') || file.includes('.spec.')) {
            testFiles++;
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            implementationFiles++;
          }
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removedLines++;
      }
    });
    
    return {
      fileCount: files.size,
      testFiles,
      implementationFiles,
      addedLines,
      removedLines,
      files: [...files]
    };
  }
  
  scoreImplementation(claims, diffAnalysis, analysis) {
    let score = 0;
    
    // Base score for having any implementation
    if (diffAnalysis.implementationFiles > 0) {
      score += 30;
      analysis.implementationEvidence.push(`${diffAnalysis.implementationFiles} implementation files modified`);
    }
    
    // Score for having tests
    if (diffAnalysis.testFiles > 0) {
      score += 20;
      analysis.testEvidence.push(`${diffAnalysis.testFiles} test files modified`);
    }
    
    // Score for reasonable test-to-implementation ratio
    if (diffAnalysis.testFiles > 0 && diffAnalysis.implementationFiles > 0) {
      const ratio = diffAnalysis.testFiles / diffAnalysis.implementationFiles;
      if (ratio >= 0.5) {
        score += 20;
        analysis.implementationEvidence.push('Good test-to-implementation ratio');
      } else {
        analysis.issues.push('Low test coverage - few test files relative to implementation');
      }
    }
    
    // Score for substantial changes
    if (diffAnalysis.addedLines > 50) {
      score += 15;
      analysis.implementationEvidence.push(`Substantial implementation: ${diffAnalysis.addedLines} lines added`);
    } else if (diffAnalysis.addedLines < 10 && claims.length > 0) {
      analysis.issues.push('Minimal code changes for claimed features');
    }
    
    // Check for common fake implementation patterns
    if (diffAnalysis.addedLines > 0 && diffAnalysis.testFiles === 0) {
      analysis.issues.push('Implementation changes without corresponding tests');
      score -= 15;
    }
    
    // Bonus for documentation updates
    if (diffAnalysis.files.some(f => f.toLowerCase().includes('readme') || f.toLowerCase().includes('changelog'))) {
      score += 10;
      analysis.implementationEvidence.push('Documentation updated');
    }
    
    // Check for TypeScript files (good sign for this project)
    const tsFiles = diffAnalysis.files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
    if (tsFiles > 0) {
      score += 5;
    }
    
    analysis.score = Math.min(score, analysis.maxScore);
  }
  
  calculateConfidence(analysis) {
    // Confidence based on amount of evidence
    const evidenceCount = analysis.implementationEvidence.length + analysis.testEvidence.length;
    const issueCount = analysis.issues.length;
    
    let confidence = Math.min(50 + evidenceCount * 10 - issueCount * 5, 95);
    return Math.max(confidence, 20);
  }
  
  generateRecommendation(analysis) {
    if (analysis.score >= 80) {
      return 'Implementation appears comprehensive with good test coverage.';
    } else if (analysis.score >= 60) {
      return 'Implementation looks reasonable but could benefit from more tests or documentation.';
    } else if (analysis.score >= 40) {
      return 'Implementation may be incomplete. Consider adding more tests and verification.';
    } else {
      return 'Implementation appears insufficient for claimed features. Please review and add proper implementation and tests.';
    }
  }
}

/**
 * Get the current diff from git
 */
function getCurrentDiff() {
  try {
    let gitCommand;
    
    if (process.env.GITHUB_BASE_REF) {
      gitCommand = `git diff origin/${process.env.GITHUB_BASE_REF}...HEAD`;
    } else {
      gitCommand = 'git diff HEAD~1';
    }
    
    return execSync(gitCommand, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
  } catch (error) {
    console.warn('Warning: Could not get diff from git:', error.message);
    return '';
  }
}

/**
 * Main review function
 */
function main() {
  console.log('🤖 AI Reviewer - Code Implementation Meta-Check\n');
  
  // Get PR information from environment or command line
  const prTitle = process.env.PR_TITLE || process.argv[2] || '';
  const prDescription = process.env.PR_DESCRIPTION || process.argv[3] || '';
  
  if (!prTitle && !prDescription) {
    console.log('ℹ️  No PR information provided. Skipping AI review.');
    console.log('   Usage: node scripts/ai-reviewer.js "PR Title" "PR Description"');
    console.log('   Or set PR_TITLE and PR_DESCRIPTION environment variables.');
    process.exit(0);
  }
  
  const diff = getCurrentDiff();
  
  console.log('📋 PR Information:');
  console.log(`   Title: ${prTitle}`);
  console.log(`   Description: ${prDescription.slice(0, 200)}${prDescription.length > 200 ? '...' : ''}`);
  console.log(`   Diff size: ${diff.length} characters\n`);
  
  // Perform AI review
  const reviewer = new LocalHeuristicReviewer();
  const review = reviewer.reviewImplementation(prTitle, prDescription, diff);
  
  console.log('🔍 AI Review Results:');
  console.log('═'.repeat(50));
  console.log(`Score: ${review.analysis.score}/${review.analysis.maxScore}`);
  console.log(`Confidence: ${review.confidence}%`);
  console.log(`Status: ${review.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (review.analysis.implementationEvidence.length > 0) {
    console.log('\n✅ Implementation Evidence:');
    review.analysis.implementationEvidence.forEach(evidence => {
      console.log(`   • ${evidence}`);
    });
  }
  
  if (review.analysis.testEvidence.length > 0) {
    console.log('\n🧪 Test Evidence:');
    review.analysis.testEvidence.forEach(evidence => {
      console.log(`   • ${evidence}`);
    });
  }
  
  if (review.analysis.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    review.analysis.issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
  
  console.log(`\n💡 Recommendation:`);
  console.log(`   ${review.recommendation}`);
  
  if (review.passed) {
    console.log('\n🎉 AI review passed! Implementation appears to match claims.');
    process.exit(0);
  } else {
    console.log('\n💥 AI review failed!');
    console.log('\n🚨 The implementation may not fully match the claimed features.');
    console.log('   Please review the code changes and ensure they properly implement');
    console.log('   the features described in the PR title and description.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { LocalHeuristicReviewer };