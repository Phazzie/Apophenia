// Tests generated for the Merge Status Log using the Jest (ts-jest) setup.
import * as fs from 'fs';
import * as path from 'path';

const locateMergeStatusLog = (): string => {
  const candidateDirs = [
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', '..'),
  ];
  const filenamePattern = /^merge[-_\s]status[-_\s]log\.md$/i;

  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    const match = fs.readdirSync(dir).find((file) => filenamePattern.test(file));
    if (match) {
      const fullPath = path.join(dir, match);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  throw new Error('Merge status log markdown file not found in expected directories.');
};

const mergeStatusLogPath = locateMergeStatusLog();
const logContent = fs.readFileSync(mergeStatusLogPath, 'utf-8');

describe('Merge Status Log document', () => {
  test('document path resolves correctly', () => {
    expect(fs.existsSync(mergeStatusLogPath)).toBe(true);
    expect(path.basename(mergeStatusLogPath).toLowerCase()).toMatch(/merge[-_\s]status[-_\s]log\.md/);
  });

  test('has expected title and live tracking subtitle', () => {
    const lines = logContent.trim().split('\n');
    expect(lines[0].trim()).toBe('# Merge Status & Progress Log');
    expect(lines[1].trim()).toBe('*Live tracking document - Updated September 27, 2025*');
  });

  test('details current branch and statuses accurately', () => {
    expect(logContent).toContain('- **Current Branch**: `fix/test-suite-stabilization` (PR #34)');
    expect(logContent).toContain('- **Rebase Status**: 🔄 **COMPLETING FINAL COMMIT**');
    expect(logContent).toContain('- **Review Status**: ✅ **APPROVED**');
    expect(logContent).toContain('- **Action**: Finishing rebase - resolving final commit conflict');
  });

  test('lists completed rebase steps sequentially with detailed context', () => {
    const completedSectionMatch = logContent.match(/### ✅ \*\*COMPLETED STEPS\*\*([\s\S]*?)###/);
    expect(completedSectionMatch).toBeTruthy();

    const completedSteps = (completedSectionMatch?.[1] ?? '')
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line));

    expect(completedSteps).toEqual([
      '1. Started rebase: `git rebase origin/feature/ai-director-refactor`',
      '2. Resolved merge conflicts in test files and engine imports',
      '3. Applied 6 commits successfully',
      '4. Currently on final commit: "Add merge status tracking log"',
    ]);
  });

  test('highlights current step conflict resolution targets', () => {
    const currentStepMatch = logContent.match(/### 🔄 \*\*CURRENT STEP\*\*([\s\S]*?)###/);
    expect(currentStepMatch).toBeTruthy();

    const currentItems = (currentStepMatch?.[1] ?? '')
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    expect(currentItems).toEqual([
      '- Resolving merge conflict in `MERGE_STATUS_LOG.md`',
      '- This is the final commit in the rebase sequence',
    ]);
  });

  test('provides actionable next steps as unchecked checkboxes', () => {
    const nextStepsMatch = logContent.match(/### 📝 \*\*NEXT STEPS\*\*([\s\S]*?)---/);
    expect(nextStepsMatch).toBeTruthy();

    const checkboxItems = (nextStepsMatch?.[1] ?? '')
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- [ ]'));

    expect(checkboxItems).toEqual([
      '- [ ] Complete merge conflict resolution',
      '- [ ] Continue rebase: `git rebase --continue`',
      '- [ ] Verify PR #34 ready for merge',
    ]);
  });

  test('summarizes PR statuses in a consistently formatted table', () => {
    const tableHeader = /\| PR \| Title \| Status \| Action Needed \|/;
    expect(logContent).toMatch(tableHeader);

    const prRows = logContent.match(/\| #\d+ \|.*\|.*\|.*\|/g) ?? [];
    expect(prRows).toHaveLength(3);
    expect(prRows).toEqual([
      '| #33 | Feature/implement temporal revision | ❓ **NEEDS CHECKING** | Verify current status |',
      '| #34 | Fix/test suite stabilization | 🔄 **REBASING - FINAL STEP** | Complete rebase |',
      '| #35 | 8-module revolutionary system | ✅ **MERGED** | Complete |',
    ]);
  });

  test('includes recovery commands in the expected order', () => {
    const bashBlockMatch = logContent.match(/```bash([\s\S]*?)```/);
    expect(bashBlockMatch).toBeTruthy();

    const bashBlock = bashBlockMatch?.[1] ?? '';
    const commandSequence = [
      'cd /workspaces/Apophenia',
      'git status  # Should show rebase in progress',
      'git add MERGE_STATUS_LOG.md',
      'git rebase --continue',
    ];

    let lastIndex = -1;
    for (const command of commandSequence) {
      const currentIndex = bashBlock.indexOf(command);
      expect(currentIndex).toBeGreaterThan(lastIndex);
      lastIndex = currentIndex;
    }
  });

  test('tracks last updated metadata at the bottom of the document', () => {
    expect(logContent.trim()).toMatch(/\*Last Updated: September 27, 2025 - Completing final rebase step\*$/);
  });

  test('uses consistent emoji palette for status signalling', () => {
    const expectedEmojis = ['🎯', '🔄', '✅', '❓', '📊', '📝'];
    expectedEmojis.forEach((emoji) => {
      expect(logContent.includes(emoji)).toBe(true);
    });
  });

  test('maintains section separators between major blocks', () => {
    const separators = logContent.match(/^---$/gm) ?? [];
    expect(separators.length).toBeGreaterThanOrEqual(3);
  });

  test('references all relevant PR numbers within the narrative', () => {
    ['PR #33', 'PR #34', 'PR #35'].forEach((prReference) => {
      expect(logContent).toContain(prReference);
    });
  });

  test('reinforces conflict resolution focus on MERGE_STATUS_LOG.md', () => {
    const occurrences = (logContent.match(/MERGE_STATUS_LOG\.md/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});