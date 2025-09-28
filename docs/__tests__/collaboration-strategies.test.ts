import { beforeEach, describe, expect, test } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

// Jest (ts-jest) powers the test suite executed via `npm test`
const DOCUMENT_PATH = path.join(__dirname, '../collaboration-strategies.md');

describe('Collaboration Playbook for PR #34 – Documentation QA', () => {
  let documentContent: string;

  beforeEach(() => {
    if (!fs.existsSync(DOCUMENT_PATH)) {
      throw new Error('collaboration-strategies.md is missing. Tests require this document to exist.');
    }

    documentContent = fs.readFileSync(DOCUMENT_PATH, 'utf-8');
  });

  describe('Document Structure Validation', () => {
    test('contains top-level sections from the collaboration playbook', () => {
      expect(documentContent).toContain('# Collaboration Playbook for PR #34 Finish & DigitalOcean Launch');
      expect(documentContent).toContain('## Idea 1 · "Precision Fix + Automated Polish"');
      expect(documentContent).toContain('## Idea 2 · "Parallel Tracks with Daily Sync"');
      expect(documentContent).toContain('## Idea 3 · "Agent-First Iterations with Human QA Gate"');
      expect(documentContent).toContain('## Batch Execution Checklist');
      expect(documentContent).toContain('## Merge Log Template');
    });

    test('maintains a healthy heading hierarchy', () => {
      const headingPattern = /^#{1,6}\s+.+$/gm;

      const headings = documentContent.match(headingPattern) ?? [];

      expect(headings.length).toBeGreaterThan(5);
      expect(headings.filter(h => h.startsWith('## ')).length).toBeGreaterThanOrEqual(4);
      expect(headings.filter(h => h.startsWith('### ')).length).toBeGreaterThanOrEqual(12);
    });

    test('documents operational constraints prominently', () => {
      expect(documentContent).toContain('Operational constraints');
      expect(documentContent).toContain('Google Jules only sees content on merged branches.');
      expect(documentContent).toContain('Creating GitHub Copilot coding agents or GitHub issues can occasionally report an error');
    });
  });

  describe('Collaboration Ideas Content Validation', () => {
    const ideaSections = ['Scope', 'Roles', 'Hand-off rhythm', 'Pros / Watch-outs'];

    test.each([
      ['Idea 1'],
      ['Idea 2'],
      ['Idea 3'],
    ])('%s includes scope, roles, hand-offs, and watch-outs', (ideaLabel) => {
      const lowerContent = documentContent.toLowerCase();
      const lowerHeader = `## ${ideaLabel.toLowerCase()}`;
      const startIndex = lowerContent.indexOf(lowerHeader);
      expect(startIndex).not.toBe(-1);

      const nextHeaderIndex = lowerContent.indexOf('\n## ', startIndex + 1);
      const endIndex = nextHeaderIndex === -1 ? documentContent.length : nextHeaderIndex;
      const ideaBlock = documentContent.slice(startIndex, endIndex);

      ideaSections.forEach(section => {
        expect(ideaBlock).toContain(section);
      });
    });

    test('roles detail responsibilities for Copilot, Google Jules, and coding agent', () => {
      const rolesSectionRegex = /### Roles[\s\S]*?###/gi;
      const rolesSections = documentContent.match(rolesSectionRegex) ?? [];

      expect(rolesSections.length).toBeGreaterThanOrEqual(3);

      rolesSections.forEach(section => {
        expect(section).toContain('Copilot (me)');
        expect(section).toContain('Google Jules');
        expect(section).toContain('GitHub Copilot coding agent');
      });
    });

    test('technical responsibilities reference critical files and commands', () => {
      ['src/services/gameService.ts', 'AdaptiveNarrativeDNA.ts', 'NeuralEchoChambers.ts'].forEach(reference => {
        expect(documentContent).toContain(reference);
      });

      ['npm run build', 'npx tsc --noEmit', 'npm test'].forEach(command => {
        expect(documentContent).toContain(command);
      });
    });
  });

  describe('Batch Execution Checklist Validation', () => {
    test('lists the nine key batch execution steps', () => {
      const expectedSteps = [
        'Sync baseline',
        'Define batch scope',
        'Create branch',
        'Craft prompt',
        'Run agent',
        'Verify creation',
        'Review & tests',
        'Merge or queue',
        'Communicate to Jules',
      ];

      expectedSteps.forEach(step => {
        expect(documentContent).toContain(step);
      });
    });

    test('references target branches and agent branch naming convention', () => {
      expect(documentContent).toContain('fix/test-suite-stabilization');
      expect(documentContent).toContain('feature/ai-director-refactor');
      expect(documentContent).toContain('agent/batch-<name>');
    });
  });

  describe('Merge Log Template Validation', () => {
    test('contains merge log table with expected headers', () => {
      expect(documentContent).toContain('| Batch | Branch | Summary | Tests | Merge Commit | Jules notified |');
      expect(documentContent).toContain('|-------|--------|---------|-------|--------------|----------------|');
    });

    test('includes sample merge log entries with status indicators', () => {
      expect(documentContent).toContain('Batch 1 – Await & Typings');
      expect(documentContent).toContain('Batch 2 – SSR Guards');
      expect(documentContent).toContain('Batch 3 – Docs & Deploy');
      expect(documentContent).toContain('✅');
      expect(documentContent).toContain('⬜');
      expect(documentContent).toContain('Pending');
    });
  });

  describe('Documentation Quality Checks', () => {
    test('provides decision guidance for collaboration patterns', () => {
      expect(documentContent).toContain('How to choose');
      expect(documentContent).toContain('Need speed & precision');
      expect(documentContent).toContain('Want balanced parallel momentum');
      expect(documentContent).toContain('Prefer automation-heavy workflow');
    });

    test('has ample lists, inline code, and callouts for clarity', () => {
      const bulletMatches = documentContent.match(/^[\t ]*[-*+]\s.+$/gm) ?? [];
      const inlineCodeMatches = documentContent.match(/`[^`]+`/g) ?? [];
      const calloutMatches = documentContent.match(/[✅⚠⬜]/g) ?? [];

      expect(bulletMatches.length).toBeGreaterThan(12);
      expect(inlineCodeMatches.length).toBeGreaterThan(5);
      expect(calloutMatches.length).toBeGreaterThan(6);
    });

    test('is sufficiently comprehensive in length', () => {
      const wordCount = documentContent.trim().split(/\s+/).length;
      const lineCount = documentContent.split('\n').length;

      expect(wordCount).toBeGreaterThan(500);
      expect(lineCount).toBeGreaterThan(110);
    });
  });

  describe('Formatting and Integrity', () => {
    test('does not contain malformed control characters', () => {
      // detect control characters excluding common whitespace (tab, LF, CR)
      const controlChars = new RegExp("[\\u0000-\\u0008\\u000B-\\u000C\\u000E-\\u001F\\u007F]");
      expect(controlChars.test(documentContent)).toBe(false);
    });

    test('keeps line lengths readable outside of tables', () => {
      const lines = documentContent.split(String.fromCharCode(10));
      const longLines = lines.filter(line => line.length > 120 && !line.trim().startsWith('|'));

      expect(longLines.length).toBeLessThan(lines.length * 0.2);
    });

    test('ensures all referenced idea anchors exist', () => {
      ['Idea 1', 'Idea 2', 'Idea 3'].forEach(label => {
        const lines = documentContent.split(String.fromCharCode(10));
        const found = lines.some(lineItem => {
          const trimmedLine = lineItem.trim();
          if (!trimmedLine.startsWith('##')) return false;
          const headingText = trimmedLine.slice(2).trim();
          return headingText === label;
        });
        expect(found).toBe(true);
      });
    });
  });

  describe('Collaboration Workflow Validation', () => {
    test('hand-off rhythms are enumerated with numbered steps', () => {
      const handoffSections = documentContent.match(/### Hand-off rhythm[\s\S]*?(?=###|##|$)/g) ?? [];

      expect(handoffSections.length).toBeGreaterThanOrEqual(3);

      handoffSections.forEach(section => {
        const numberedSteps = section.match(/^\d+\.\s+/gm) ?? [];
        expect(numberedSteps.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('captures risk mitigation considerations', () => {
      const watchOutSections = documentContent.match(/Pros \/ Watch-outs[\s\S]*?(?=###|##|$)/g) ?? [];

      expect(watchOutSections.length).toBeGreaterThanOrEqual(3);

      watchOutSections.forEach(section => {
        expect(section).toContain('⚠');
      });
    });

    test('provides actionable next steps for readers', () => {
      expect(documentContent).toContain('Once you pick a pattern, we can spin up the corresponding branch plan');
      expect(documentContent).toContain('Let me know which route sounds best and I’ll draft the next action list.');
    });
  });
});