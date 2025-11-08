# PR Comments to Issues - Setup Guide

This workflow automatically converts PR review comments into GitHub Issues with optional integrations for Notion and ClickUp.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Setup Instructions](#setup-instructions)
- [Required Secrets](#required-secrets)
- [Optional Integrations](#optional-integrations)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Features

✅ **Automatic Issue Creation** - Converts PR comments to trackable issues
✅ **Smart Labeling** - Auto-tags based on keywords (bug, enhancement, documentation, etc.)
✅ **File Ownership** - Assigns issues based on CODEOWNERS file
✅ **Context Preservation** - Links back to PR, file, and specific code lines
✅ **Notion Integration** - Optional sync to Notion databases
✅ **ClickUp Integration** - Optional sync to ClickUp lists
✅ **PR Notifications** - Comments back on PR when issue is created

## How It Works

The workflow triggers when someone creates a comment on a pull request and:

1. **Detects trigger keywords** in the comment:
   - `TODO:`, `FIXME:`, `create issue`, `track this`, `follow up`

2. **Analyzes comment content** to determine issue type:
   - **bug**: keywords like "bug", "error", "broken", "fix"
   - **enhancement**: "feature", "improve", "add", "todo"
   - **documentation**: "docs", "readme", "comment"
   - **refactor**: "refactor", "cleanup", "optimize"
   - **test**: "test", "coverage", "spec"
   - **security**: "security", "vulnerability", "cve"

3. **Determines assignment** from:
   - CODEOWNERS file (if exists)
   - Comment author (fallback)

4. **Creates GitHub Issue** with:
   - Descriptive title with type tag
   - Full context (PR link, file path, line numbers)
   - Automatic labels
   - Assigned owner

5. **Syncs to external tools** (if configured):
   - Notion database
   - ClickUp list

6. **Notifies on PR** by replying to the original comment

## Setup Instructions

### Step 1: Enable the Workflow

The workflow file is located at `.github/workflows/pr-comments-to-issues.yml` and will automatically run when enabled.

### Step 2: Set Repository Permissions

Ensure GitHub Actions has the necessary permissions:

1. Go to **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### Step 3: Create CODEOWNERS File (Optional but Recommended)

Create a file at `.github/CODEOWNERS` to enable automatic assignment:

```plaintext
# CODEOWNERS file
# Format: path/pattern @username @team

# Default owners
* @your-username

# Frontend
/src/components/** @frontend-team
/src/pages/** @frontend-team
*.tsx @frontend-team
*.css @frontend-team

# Backend
/server/** @backend-team
/api/** @backend-team
*.js @backend-team

# Documentation
*.md @tech-writer
/docs/** @tech-writer

# DevOps
/.github/** @devops-team
/docker/** @devops-team
*.yml @devops-team

# Database
/migrations/** @database-team
/schemas/** @database-team
```

### Step 4: Test the Workflow

1. Create a test PR
2. Add a review comment with trigger keywords:
   ```
   TODO: This function needs better error handling
   ```
3. Check that an issue is created automatically

## Required Secrets

### GitHub Token (Automatic)

The workflow uses `${{ secrets.GITHUB_TOKEN }}` which is automatically provided by GitHub Actions. No setup needed.

**Permissions Required:**
- `contents: read`
- `pull-requests: write`
- `issues: write`

## Optional Integrations

### Notion Integration

#### Prerequisites

1. Create a Notion integration:
   - Go to https://www.notion.so/my-integrations
   - Click **+ New integration**
   - Name it "GitHub Issues Sync"
   - Copy the **Internal Integration Token**

2. Create a Notion database with these properties:
   - **Name** (Title)
   - **Status** (Select: To Do, In Progress, Done)
   - **Type** (Select: bug, enhancement, documentation, etc.)
   - **GitHub URL** (URL)
   - **Assignee** (Text)

3. Share the database with your integration:
   - Open the database
   - Click **...** > **Add connections**
   - Select your integration

#### Configuration

Add these secrets to your GitHub repository:

**Settings > Secrets and variables > Actions > New repository secret**

1. **NOTION_API_KEY**
   - Value: Your Notion Internal Integration Token
   - Example: `secret_abc123xyz...`

2. **NOTION_DATABASE_ID**
   - Value: Your Notion database ID
   - To find it: Open database > Copy link > Extract ID from URL
   - URL format: `https://notion.so/workspace/DATABASE_ID?v=...`
   - Example: `abc123def456...` (32 characters)

### ClickUp Integration

#### Prerequisites

1. Get your ClickUp API token:
   - Go to ClickUp > Settings > Apps
   - Click **Generate** under API Token
   - Copy the token

2. Get your List ID:
   - Open the ClickUp list where you want to create tasks
   - Click **...** > **Copy link**
   - Extract List ID from URL
   - URL format: `https://app.clickup.com/WORKSPACE_ID/v/l/LIST_ID`

3. (Optional) Create a custom field for GitHub URL:
   - Go to List settings > Custom Fields
   - Add a URL field named "GitHub URL"
   - Copy the field ID

#### Configuration

Add these secrets to your GitHub repository:

1. **CLICKUP_API_KEY**
   - Value: Your ClickUp API token
   - Example: `pk_123456_ABC...`

2. **CLICKUP_LIST_ID**
   - Value: Your ClickUp list ID
   - Example: `123456789`

3. **CLICKUP_GITHUB_URL_FIELD_ID** (Optional)
   - Value: Custom field ID for GitHub URL
   - Example: `abc-123-def`

## Usage Examples

### Basic Usage

Add a comment on any PR line with trigger keywords:

```
TODO: Add input validation here
```

**Result:**
- ✅ Issue created with label `enhancement`
- ✅ Assigned based on CODEOWNERS
- ✅ PR comment reply with issue link

### Specific Issue Types

#### Bug Report
```
BUG: This function throws an error when input is null
Need to add null check before processing
```

**Result:** Issue labeled as `bug`

#### Feature Request
```
ENHANCEMENT: Add dark mode support to this component
Create issue to track this improvement
```

**Result:** Issue labeled as `enhancement`

#### Documentation
```
DOCS: This function needs better documentation
Add JSDoc comments explaining parameters
```

**Result:** Issue labeled as `documentation`

#### Security Issue
```
SECURITY: This endpoint is vulnerable to SQL injection
Follow up: Implement parameterized queries
```

**Result:** Issue labeled as `security`

### Advanced Usage

#### Multi-line Comment with Context
```
FIXME: Performance bottleneck identified

This loop iterates unnecessarily multiple times.
We should:
1. Memoize the computation
2. Use a more efficient algorithm
3. Add caching

Track this for the next sprint.
```

**Result:**
- Full comment captured in issue body
- Issue includes PR context and file location
- Links to specific code lines

#### Using CODEOWNERS Assignment

If file is in `/src/components/Button.tsx` and CODEOWNERS has:
```
/src/components/** @frontend-team
```

Then the issue will be automatically assigned to `@frontend-team`

## Workflow Behavior

### When Issues Are Created

Issues are created when a PR comment contains:
- `TODO:`
- `FIXME:`
- `create issue`
- `track this`
- `follow up` or `follow-up`

### What's Included in Issues

Each auto-created issue contains:

```markdown
## Context

This issue was automatically created from a PR review comment.

**Source PR:** #123 - Feature: Add user authentication
**Comment:** https://github.com/owner/repo/pull/123#discussion_r456789
**File:** `src/auth/login.ts` (L45-L52)
**Type:** bug

## Original Comment

BUG: Login fails when email contains special characters
Need to add proper URL encoding

---

### Quick Links
- [View PR](https://github.com/owner/repo/pull/123)
- [View Comment](https://github.com/owner/repo/pull/123#discussion_r456789)
- [View Code](https://github.com/owner/repo/pull/123/files#diff-L45-L52)

### Related Information
- **Commented by:** @reviewer-username
- **Date:** 2025-11-08
```

## Troubleshooting

### Issue: Workflow Not Triggering

**Check:**
1. Workflow file is in `.github/workflows/` directory
2. Repository permissions allow GitHub Actions
3. Comment is on a Pull Request (not regular issue)
4. Comment contains trigger keywords

### Issue: No Issue Created

**Possible Causes:**
1. Comment doesn't contain trigger keywords
2. Workflow permissions insufficient
3. Check workflow run logs in Actions tab

### Issue: Wrong Assignee

**Solutions:**
1. Verify CODEOWNERS file syntax
2. Check file path matches CODEOWNERS patterns
3. Ensure usernames in CODEOWNERS exist

### Issue: Notion/ClickUp Not Syncing

**Check:**
1. Secrets are correctly set
2. API tokens are valid
3. Database/List IDs are correct
4. Integration has proper permissions

**Debug:**
- Check workflow logs in Actions tab
- Look for "Notion sync" or "ClickUp sync" step output
- Verify API endpoint responses

### Issue: Permission Denied

**Fix:**
1. Go to Settings > Actions > General
2. Enable "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

## Best Practices

### For Comment Authors

✅ **DO:**
- Use clear, descriptive language
- Include context and rationale
- Use trigger keywords when you want an issue created
- Reference specific line numbers

❌ **DON'T:**
- Use trigger keywords in casual comments
- Create duplicate issues (check existing issues first)

### For Repository Maintainers

✅ **DO:**
- Maintain an up-to-date CODEOWNERS file
- Use consistent labels across repository
- Review auto-created issues regularly
- Close duplicate or unnecessary issues

❌ **DON'T:**
- Over-rely on automation (manual triage is still important)
- Ignore auto-created issues

## Customization

### Modify Trigger Keywords

Edit `.github/workflows/pr-comments-to-issues.yml` and change the trigger detection:

```javascript
const shouldCreateIssue =
  body.includes('todo:') ||
  body.includes('fixme:') ||
  body.includes('create issue') ||
  body.includes('track this') ||
  body.includes('your-custom-keyword'); // Add your keyword
```

### Add Custom Labels

Modify the label detection logic:

```javascript
const triggers = {
  bug: /\b(bug|error|broken|issue|fix|problem)\b/i,
  enhancement: /\b(enhancement|feature|improve|add|todo|implement)\b/i,
  'your-custom-label': /\b(your|custom|keywords)\b/i, // Add custom
};
```

### Change Issue Template

Modify the `issueBody` construction in the "Create GitHub Issue" step.

## Advanced Configuration

### Adding More Integrations

You can extend the workflow to support additional project management tools:

1. Add a new step after the ClickUp integration
2. Use similar HTTPS request pattern
3. Add corresponding secrets
4. Use `continue-on-error: true` to prevent failures

Example structure:
```yaml
- name: Sync to Your-Tool
  if: steps.create_issue.outputs.issue_number && secrets.YOUR_TOOL_API_KEY != ''
  uses: actions/github-script@v7
  continue-on-error: true
  with:
    script: |
      # Your integration code here
```

## Support

For issues or questions:

1. Check workflow run logs in Actions tab
2. Review this documentation
3. Check GitHub Actions documentation
4. Open an issue in the repository

## License

This workflow is part of the Apophenia project and follows the same license.
