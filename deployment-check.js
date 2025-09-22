#!/usr/bin/env node

/**
 * Deployment Readiness Check Script
 * Validates that Apophenia is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Apophenia Deployment Readiness Check\n');

const checks = [];

// Check 1: Build artifacts exist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const hasIndex = files.some(f => f.startsWith('index.html'));
  const hasAssets = files.some(f => f.startsWith('assets'));
  
  if (hasIndex && hasAssets) {
    checks.push({ name: 'Build Artifacts', status: '✅', details: 'dist/ folder contains built assets' });
  } else {
    checks.push({ name: 'Build Artifacts', status: '❌', details: 'Missing index.html or assets folder' });
  }
} else {
  checks.push({ name: 'Build Artifacts', status: '❌', details: 'Run "npm run build" first' });
}

// Check 2: Package.json validity
try {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasScripts = pkg.scripts && pkg.scripts.build && pkg.scripts.dev;
  if (hasScripts) {
    checks.push({ name: 'Package Configuration', status: '✅', details: 'package.json has required scripts' });
  } else {
    checks.push({ name: 'Package Configuration', status: '❌', details: 'Missing required scripts in package.json' });
  }
} catch (e) {
  checks.push({ name: 'Package Configuration', status: '❌', details: 'Invalid package.json' });
}

// Check 3: Vercel configuration
try {
  const vercel = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  if (vercel.framework === 'vite' && vercel.outputDirectory === 'dist') {
    checks.push({ name: 'Vercel Configuration', status: '✅', details: 'vercel.json properly configured' });
  } else {
    checks.push({ name: 'Vercel Configuration', status: '⚠️', details: 'Vercel config may need adjustment' });
  }
} catch (e) {
  checks.push({ name: 'Vercel Configuration', status: '❌', details: 'Missing or invalid vercel.json' });
}

// Check 4: Environment example files
const envExample = fs.existsSync('./.env.example');
const envProdExample = fs.existsSync('./.env.production.example');

if (envExample && envProdExample) {
  checks.push({ name: 'Environment Templates', status: '✅', details: 'Environment example files present' });
} else {
  checks.push({ name: 'Environment Templates', status: '⚠️', details: 'Some environment example files missing' });
}

// Check 5: TypeScript compilation
try {
  const tsconfigContent = fs.readFileSync('./tsconfig.json', 'utf8');
  // Remove comments from JSON (TypeScript config allows comments)
  const cleanedContent = tsconfigContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const tsconfig = JSON.parse(cleanedContent);
  
  if (tsconfig.compilerOptions && tsconfig.include) {
    checks.push({ name: 'TypeScript Configuration', status: '✅', details: 'tsconfig.json valid and complete' });
  } else {
    checks.push({ name: 'TypeScript Configuration', status: '⚠️', details: 'tsconfig.json missing some fields' });
  }
} catch (e) {
  checks.push({ name: 'TypeScript Configuration', status: '❌', details: `Invalid tsconfig.json: ${e.message}` });
}

// Display results
console.log('📋 Deployment Checks:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.details}`);
});

const allPassed = checks.every(check => check.status === '✅');
const hasWarnings = checks.some(check => check.status === '⚠️');

console.log('\n📊 Summary:');
if (allPassed) {
  console.log('🎉 All checks passed! Ready for production deployment.');
} else if (hasWarnings && !checks.some(check => check.status === '❌')) {
  console.log('⚠️  Ready for deployment with minor warnings.');
} else {
  console.log('❌ Some critical issues need to be resolved before deployment.');
}

console.log('\n🔗 Next Steps:');
console.log('1. Set up environment variables in your deployment platform');
console.log('2. Deploy to Vercel, Netlify, or your preferred hosting platform');
console.log('3. Test the deployed application with real API keys');
console.log('4. Monitor performance and error rates');

process.exit(allPassed ? 0 : 1);