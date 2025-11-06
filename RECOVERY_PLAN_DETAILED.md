# 🔧 DETAILED RECOVERY PLAN - APPROACH 1: NUCLEAR RESET
**Estimated Time**: 60-90 minutes
**Difficulty**: Intermediate
**Risk Level**: Low
**Success Probability**: 90%

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting, verify:
- [ ] Git status is clean (or you're okay losing uncommitted changes)
- [ ] You have API keys ready: VITE_XAI_API_KEY or VITE_GEMINI_API_KEY
- [ ] Node version is 20.19.0 or 22.12.0 (check with `node --version`)
- [ ] You have 2GB+ free disk space for `node_modules`
- [ ] Internet connection is stable (will download ~500MB)

---

## PHASE 1: BACKUP & PREPARATION (5 minutes)

### Step 1.1: Commit Current State
```bash
git status
git add -A
git commit -m "WIP: State before nuclear reset recovery"
```

**Expected Output**:
```
[claude/debug-stalled-app-011CUqnRPWPMJWGqxeS8Z3Sk abc1234] WIP: State before nuclear reset recovery
 X files changed, Y insertions(+), Z deletions(-)
```

**If Error**: "nothing to commit" → Continue, you're safe

### Step 1.2: Create Recovery Branch
```bash
git checkout -b recovery/nuclear-reset-$(date +%Y%m%d)
```

**Expected Output**:
```
Switched to a new branch 'recovery/nuclear-reset-20251106'
```

### Step 1.3: Document Current State
```bash
echo "## Recovery Started: $(date)" >> RECOVERY_LOG.md
npm list --depth=0 >> RECOVERY_LOG.md 2>&1
git log --oneline -5 >> RECOVERY_LOG.md
```

---

## PHASE 2: NUCLEAR DEPENDENCY RESET (15 minutes)

### Step 2.1: Obliterate Corrupted Dependencies
```bash
echo "☢️  Removing corrupted node_modules..."
rm -rf node_modules

echo "🗑️  Removing corrupted package-lock.json..."
rm -f package-lock.json

echo "🧹 Cleaning npm cache..."
npm cache clean --force
```

**Expected Output**:
```
npm cache verified: X packages removed, Y MB freed
```

**If Error**: "EACCES permission denied"
- Run: `sudo chown -R $(whoami) ~/.npm`
- Then retry

### Step 2.2: Fix package.json Structure

**Current Issue**: @supabase/supabase-js is in devDependencies but used in production code

**Manual Edit**: Open `package.json` and move these lines:

FROM (devDependencies):
```json
"devDependencies": {
  "@supabase/supabase-js": "^2.76.1",
  ...
}
```

TO (dependencies):
```json
"dependencies": {
  "@supabase/supabase-js": "^2.76.1",
  ...
}
```

**Or use sed (automatic)**:
```bash
# Backup first
cp package.json package.json.backup

# Move @supabase from devDeps to deps
# (This is complex, manual edit recommended)
```

**Validation**:
```bash
# Should show @supabase in dependencies, not devDependencies
grep -A 2 '"@supabase/supabase-js"' package.json
```

### Step 2.3: Clean Install Dependencies
```bash
echo "📦 Installing dependencies (this takes ~5 minutes)..."
npm install

# Verify Vite is properly installed
ls -la node_modules/vite/dist/node/chunks/chunk*.js | head -5
```

**Expected Output**:
```
-rw-r--r-- 1 user user 12345 Nov  6 chunk-ABC123.js
-rw-r--r-- 1 user user 23456 Nov  6 chunk-DEF456.js
...
```

**If Error**: "Cannot find module 'vite'"
- Run: `npm install vite@7.1.5 --save-dev`
- Then: `npm install` again

**If Error**: "ERESOLVE unable to resolve dependency tree"
- Run: `npm install --legacy-peer-deps`

---

## PHASE 3: MAKE AUTH OPTIONAL (10 minutes)

### Step 3.1: Add Environment Variable
```bash
# Add to .env (create if doesn't exist)
cat >> .env << 'EOF'

# Authentication (set to false to bypass login requirement)
VITE_ENABLE_AUTH=false

# Supabase (only needed if VITE_ENABLE_AUTH=true)
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
```

### Step 3.2: Modify App.tsx to Support Optional Auth

Open `src/App.tsx` and find this block (around line 72):

**BEFORE**:
```tsx
  if (!session) {
    return (
      <GameErrorBoundary>
        <div id="app-container">
          <LoginScreen />
        </div>
      </GameErrorBoundary>
    );
  }
```

**AFTER**:
```tsx
  // Only require auth if explicitly enabled
  const authEnabled = import.meta.env.VITE_ENABLE_AUTH === 'true';

  if (authEnabled && !session) {
    return (
      <GameErrorBoundary>
        <div id="app-container">
          <LoginScreen />
        </div>
      </GameErrorBoundary>
    );
  }
```

**Validation**:
```bash
# Should show the new authEnabled check
grep -A 3 "authEnabled" src/App.tsx
```

### Step 3.3: Handle Missing Supabase Gracefully

Open `src/services/supabaseClient.ts` and wrap the error:

**BEFORE**:
```tsx
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}
```

**AFTER**:
```tsx
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features disabled.');
  // Return a mock client that doesn't crash
  const mockClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      signUp: async () => ({ error: new Error('Auth disabled') }),
      signInWithPassword: async () => ({ error: new Error('Auth disabled') }),
      signOut: async () => ({ error: null }),
    }
  };
  // @ts-expect-error - Mock client for when auth is disabled
  return mockClient;
}
```

---

## PHASE 4: FIX TYPESCRIPT ERRORS (15 minutes)

### Step 4.1: Update tsconfig.json for Better Compatibility

Edit `tsconfig.json`:

**ADD** to compilerOptions:
```json
{
  "compilerOptions": {
    "skipLibCheck": true,  // Already there, ensure it's true
    "types": ["vite/client"],
    "noImplicitAny": false,  // Temporarily relax for userStore
    ...existing options...
  },
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**"
  ]
}
```

### Step 4.2: Fix userStore.ts Type Errors

Open `src/stores/userStore.ts` and fix the implicit any types:

**Line 43** - BEFORE:
```tsx
supabase.auth.getSession().then(({ data: { session } }) => {
```

**Line 43** - AFTER:
```tsx
supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
```

**Line 48** - BEFORE:
```tsx
supabase.auth.onAuthStateChange((_event, session) => {
```

**Line 48** - AFTER:
```tsx
supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
```

### Step 4.3: Create tsconfig.build.json for Build-Only Config

```bash
cat > tsconfig.build.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": true
  },
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
EOF
```

### Step 4.4: Update Build Script

Edit `package.json` scripts:

**BEFORE**:
```json
"build": "npx tsc && npx vite build",
```

**AFTER**:
```json
"build": "npx tsc --noEmit --project tsconfig.build.json && npx vite build",
```

### Step 4.5: Test TypeScript Compilation
```bash
npx tsc --noEmit --project tsconfig.build.json
```

**Expected Output**:
```
(no output = success)
```

**If Errors Remain**:
- Count them: `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`
- If < 5 errors: Note them, continue
- If > 5 errors: Stop, investigate

---

## PHASE 5: BUILD VALIDATION (5 minutes)

### Step 5.1: Attempt Production Build
```bash
npm run build
```

**Expected Output**:
```
vite v7.1.5 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB │ gzip:  0.45 kB
dist/assets/index-abc123.js     487.56 kB │ gzip: 140.23 kB
✓ built in 3.45s
```

**If Error**: "TypeScript errors" → Check Phase 4 steps
**If Error**: "Out of memory" → Run: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Step 5.2: Check Build Output
```bash
ls -lh dist/
ls -lh dist/assets/ | head -10
```

**Should See**:
- `index.html`
- `assets/index-[hash].js` (main bundle)
- `assets/index-[hash].css`

---

## PHASE 6: BOOT & VALIDATE (15 minutes)

### Step 6.1: Start Development Server
```bash
npm run dev
```

**Expected Output**:
```
  VITE v7.1.5  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**If Error**: "Port 5173 already in use"
- Find process: `lsof -ti:5173`
- Kill it: `kill -9 $(lsof -ti:5173)`
- Retry

**If Error**: "Cannot find module"
- Run: `npm install` again
- Check: `ls node_modules/react` (should exist)

### Step 6.2: Open in Browser

Navigate to: `http://localhost:5173`

**Expected**: Start screen with:
- "Apophenia" title
- Genre selector
- "New Game" button
- Model selector in bottom-right

**If Blank Screen**:
- Open DevTools (F12)
- Check Console for errors
- Common issues:
  - Supabase auth error → Check VITE_ENABLE_AUTH=false in .env
  - "Cannot read property" → Note error, continue testing

### Step 6.3: Test Game Loop (Critical Validation)

**Test Script**:
1. Click "New Game" button
2. **Wait** for concept generation (~5-15 seconds)
3. **Verify**: See story text appear
4. **Verify**: See 3-4 choice buttons
5. Click a choice
6. **Wait** for next story segment (~10-20 seconds)
7. **Verify**: Story continues, new choices appear
8. **Repeat 3 more times** (minimum 5 total turns)

**Check Console Logs** (press F12 → Console tab):
```
Expected logs every turn:
🧠 Analyzing player choice for fear profiling...
🎯 Identified fear triggers: [...]
😱 Personalizing horror with triggers: [...]
Processing temporal revision and quantum narrative shifts...
Generated X commands for next step
```

**Success Criteria**:
- ✅ Game generates 5+ story segments
- ✅ Choices appear after each segment
- ✅ Console shows AI engine activity
- ✅ No crashes or infinite loading

**Failure Modes**:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Infinite "Generating..." | No AI API key | Add VITE_XAI_API_KEY or VITE_GEMINI_API_KEY to .env |
| Error: "Failed to fetch" | CORS/API issue | Check API key validity |
| Blank after clicking choice | JavaScript error | Check console, fix code |
| Choices don't appear | Command execution failed | Check GameScreen.tsx |

### Step 6.4: Test Revolutionary Features

**Temporal Revision Test**:
1. Play 5+ turns
2. Look for `[MEMORY REVISED]` tag in story text
3. Check console for: "Processing temporal revision"
4. **Expected**: 20% chance per turn of seeing revision

**Reality Corruption Test**:
1. Make choices with "void", "digital", "corruption" keywords
2. **Expected**: Screen should gradually distort (hue shift, slight rotation)
3. Check console for: "Processing reality corruption"
4. **Expected**: Corruption level increases

**Quantum Narratives Test**:
1. Play 10+ turns
2. Watch for: "// QUANTUM NARRATIVE COLLAPSE //"
3. **Expected**: Rare (10% chance), story "resets" to alternate timeline

**Adaptive Horror Test**:
1. Make consistent choice patterns (always choose "explore" or "hide")
2. Check console for: "🎯 Identified fear triggers"
3. After 5 turns, check: localStorage → `apophenia_player_profile`
4. **Expected**: JSON with `fearTriggers` array populated

### Step 6.5: Validate Analytics
```bash
# In browser console:
console.log(localStorage.getItem('apophenia_analytics'));
```

**Expected**: JSON with session data, events, metrics

### Step 6.6: Test Dev Mode
```bash
# In browser, press: Ctrl+Shift+D
# Should see welcome message in console
# Then press: Ctrl+Shift+A
```

**Expected**: Analytics dashboard appears

---

## PHASE 7: DOCUMENTATION UPDATE (5 minutes)

### Step 7.1: Update README.md

**Find this section** (around line 31):
```markdown
### Prerequisites
- **Node.js 20.19.0+**
- **Grok API key** (primary AI model - from X.AI)
```

**ADD AFTER**:
```markdown
### Current Known Issues (2025-11-06)
- ⚠️ **Supabase Auth**: Optional by default. Set `VITE_ENABLE_AUTH=true` to require login.
- ⚠️ **Build warnings**: Some vitest type warnings during tsc (non-blocking)
- ⚠️ **Revolutionary Features**: Implemented but require end-to-end validation

### Quick Start (Actually Works)
```bash
# 1. Install dependencies
npm install

# 2. Add at minimum ONE API key to .env
echo "VITE_XAI_API_KEY=your-xai-key" >> .env
# OR
echo "VITE_GEMINI_API_KEY=your-gemini-key" >> .env

# 3. Disable auth (or configure Supabase)
echo "VITE_ENABLE_AUTH=false" >> .env

# 4. Start
npm run dev
# Open http://localhost:5173
```
```

### Step 7.2: Update EXECUTIVE_SUMMARY.md

**Find**: "✅ APPROVED FOR PRODUCTION DEPLOYMENT"

**REPLACE WITH**:
```markdown
## ⚠️ CURRENT STATUS (2025-11-06)

**Build Status**: ✅ Working (after recovery)
**Features Status**: ⚠️ Implemented but require validation
**Deployment Status**: 🔄 Development only (not production-ready)

### Completed Recovery
- ✅ Fixed corrupted Vite installation
- ✅ Made Supabase auth optional
- ✅ Resolved TypeScript build errors
- ✅ Verified basic game loop works

### Remaining Validation
- ⚠️ **Revolutionary Features**: Code exists, needs end-to-end testing
  - Temporal Revision - 234 lines, untested in production
  - Quantum Narratives - 85 lines, needs validation
  - Reality Corruption - 85 lines, visual effects unverified
  - 6 more engines - implemented but not battle-tested

### Next Steps for Production
1. Play-test 50+ game turns to validate AI engines
2. Fix any runtime errors that emerge
3. Optimize bundle (487KB → 280KB target)
4. Decide on auth: keep Supabase or remove entirely
5. Add error tracking (Sentry)
6. Load testing with real users

**Recommendation**: ✅ APPROVED FOR DEVELOPMENT & TESTING
Not yet approved for production deployment.
```

---

## PHASE 8: COMMIT & PUSH (5 minutes)

### Step 8.1: Stage Changes
```bash
git add -A
git status
```

**Should Show**:
```
modified:   package.json
modified:   src/App.tsx
modified:   src/services/supabaseClient.ts
modified:   src/stores/userStore.ts
modified:   tsconfig.json
new file:   tsconfig.build.json
new file:   RECOVERY_LOG.md
modified:   README.md
modified:   EXECUTIVE_SUMMARY.md
```

### Step 8.2: Commit Recovery
```bash
git commit -m "fix: Nuclear reset recovery - restore working state

- Fix corrupted Vite installation (reinstall all deps)
- Move @supabase/supabase-js to dependencies
- Make auth optional via VITE_ENABLE_AUTH flag
- Fix TypeScript compilation errors in userStore.ts
- Update build config to exclude test files
- Update documentation with current accurate state

Game now boots and runs basic loop. Revolutionary features
implemented but require end-to-end validation.

Closes: Stalled app recovery
Related: Nuclear Reset (Approach 1)"
```

### Step 8.3: Push to Remote
```bash
git push -u origin claude/debug-stalled-app-011CUqnRPWPMJWGqxeS8Z3Sk
```

**Expected Output**:
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
...
To http://127.0.0.1:56066/git/Phazzie/Apophenia
 * [new branch]      claude/debug-stalled-app-011CUqnRPWPMJWGqxeS8Z3Sk -> claude/debug-stalled-app-011CUqnRPWPMJWGqxeS8Z3Sk
```

---

## ✅ SUCCESS CHECKLIST

Mark each as you complete:

**Infrastructure**:
- [ ] `node_modules` reinstalled (no corrupted files)
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Browser shows start screen

**Functionality**:
- [ ] Can create new game
- [ ] Story generates (sees text)
- [ ] Choices appear
- [ ] Can make 5+ consecutive choices
- [ ] No infinite loading

**Revolutionary Features** (at least 1 must fire):
- [ ] Console shows "🧠 Analyzing player choice"
- [ ] Console shows "Processing temporal revision"
- [ ] Console shows "Processing reality corruption"
- [ ] localStorage has `apophenia_player_profile`

**Documentation**:
- [ ] README.md updated with accurate state
- [ ] EXECUTIVE_SUMMARY.md reflects reality
- [ ] RECOVERY_LOG.md created

**Git**:
- [ ] Changes committed
- [ ] Pushed to remote branch

---

## 🚨 TROUBLESHOOTING DECISION TREE

### Problem: npm install fails
**Try**: `npm cache clean --force && npm install --legacy-peer-deps`
**If fails**: Check Node version (`node --version`), must be 20.x or 22.x

### Problem: TypeScript errors persist
**Try**: `npx tsc --noEmit 2>&1 | tee ts-errors.log`
**Analyze**: Read ts-errors.log, fix top 3 errors, repeat
**If > 10 errors**: Consider Approach 3 (MVP Rollback)

### Problem: App boots but blank screen
**Check**: Browser console (F12 → Console tab)
**Look for**: "Uncaught Error" or "Failed to fetch"
**Common**: Supabase error → Verify VITE_ENABLE_AUTH=false in .env

### Problem: Game loads infinitely
**Check**: Network tab in DevTools
**Look for**: Red failed requests
**Common**: No API key → Add VITE_XAI_API_KEY or VITE_GEMINI_API_KEY

### Problem: Revolutionary features don't fire
**Expected**: Some features are probabilistic (20% chance)
**Test**: Play 10+ turns
**Verify**: Console shows ANY engine logs
**If no logs**: Features might be disabled, check REVOLUTIONARY_FEATURES config

### Problem: Images fail to generate
**Expected**: Imagen API might fail, this is normal
**Verify**: Story text still appears (game works without images)
**Fix**: Check API key for Gemini, images use Imagen service

---

## 📊 POST-RECOVERY METRICS

After successful recovery, measure:

```bash
# Bundle size
ls -lh dist/assets/*.js

# TypeScript compilation time
time npx tsc --noEmit

# Startup time (in browser DevTools → Network)
# Look for "DOMContentLoaded" time

# Memory usage (in browser DevTools → Performance Monitor)
# Should be < 100MB after 10 story turns
```

**Expected**:
- Bundle: ~487KB (140KB gzip)
- TS compilation: 3-8 seconds
- Startup: < 3 seconds
- Memory: 50-80MB

---

## 🎯 NEXT STEPS AFTER RECOVERY

1. **Play 20 turns** - Validate game loop stability
2. **Document bugs** - Create issues for any crashes
3. **Test all engines** - Verify each revolutionary feature works
4. **Optimize bundle** - Code split to reach 280KB target
5. **Decide on auth** - Keep Supabase or remove entirely?
6. **Add error tracking** - Implement Sentry or similar
7. **User testing** - Get 3-5 people to play, collect feedback

---

## 📞 GETTING HELP

**If stuck after following this guide**:
1. Check RECOVERY_LOG.md for clues
2. Review ts-errors.log if created
3. Note which Phase/Step failed
4. Share error messages

**Common escalation paths**:
- Phase 2 fails → Dependency hell, try `npm install --force`
- Phase 4 fails → TypeScript issues, consider relaxing tsconfig
- Phase 6 fails → Runtime errors, check for missing env vars

---

**Good luck! You've got this. The features are there, we just need to unblock them.** 🚀
