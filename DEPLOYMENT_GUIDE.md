# Deployment Guide - Apophenia

## Quick Deploy Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_GEMINI_API_KEY=your-gemini-key
```

### 2. Netlify
```bash
# Build locally
npm run build

# Deploy dist/ folder to Netlify
# Set environment variables in site settings:
# VITE_GEMINI_API_KEY=your-gemini-key
```

### 3. GitHub Pages
```bash
# Deploy script included
npm run deploy:gh-pages
```

## Environment Variables

Create `.env.local` file:
```
VITE_GEMINI_API_KEY=your-google-gemini-key
```

**Note**: App works without API keys using fallback content.

## Build Verification

```bash
npm install
npm run build
npm test
```

Should output:
- Build: ~275KB bundle (83KB gzipped)
- Tests: All passing
- No TypeScript errors

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Start screen displays correctly
- [ ] New Game functionality works
- [ ] Story generation works (with fallbacks if no API keys)
- [ ] Image generation works (with fallbacks)
- [ ] Mobile responsive design functional
- [ ] Save/load game functionality working

## Troubleshooting

**Build fails**: Run `npm install` to restore dependencies
**Image generation errors**: Check API keys and fallback logic
**Mobile issues**: Verify responsive CSS and touch targets
**Performance**: Bundle should be under 300KB for good loading times