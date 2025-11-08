# PR Comments to Issues - Complete Workflow System

> Automatically convert PR review comments into trackable GitHub Issues with optional Notion and ClickUp integration.

## 📚 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| **[Quick Reference](PR_COMMENTS_QUICK_REFERENCE.md)** | Fast lookup guide | All users |
| **[Setup Guide](PR_COMMENTS_TO_ISSUES_SETUP.md)** | Complete installation instructions | Admins |
| **[Testing Guide](PR_COMMENTS_TESTING_GUIDE.md)** | Test scenarios and validation | Developers |
| **[Workflow YAML](pr-comments-to-issues.yml)** | The actual GitHub Actions workflow | DevOps |
| **[CODEOWNERS Example](../CODEOWNERS.example)** | Sample ownership file | Team leads |

## 🎯 At a Glance

### What It Does

1. **Monitors** all PR comments for trigger keywords
2. **Creates** GitHub Issues automatically from flagged comments
3. **Labels** issues based on comment content (bug, enhancement, docs, etc.)
4. **Assigns** issues based on CODEOWNERS file
5. **Links** back to the PR, file, and specific code lines
6. **Syncs** to Notion and/or ClickUp (optional)
7. **Notifies** on the PR with a link to the created issue

### Why Use It?

- ✅ **Never lose track** of TODOs in PR comments
- ✅ **Automatic triage** with smart labeling
- ✅ **Clear ownership** via CODEOWNERS integration
- ✅ **Full context** preserved (PR, file, line numbers)
- ✅ **Project management** integration (Notion/ClickUp)
- ✅ **Zero manual work** - completely automated

## 🚀 Quick Start (5 Minutes)

### 1. Enable the Workflow

The workflow is already in your repository:
```
.github/workflows/pr-comments-to-issues.yml
```

### 2. Set Permissions

**Repository Settings > Actions > General:**
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 3. Test It

Create a test PR and add this comment:
```
TODO: Test the automated issue creation
```

**Expected:** Issue is created within 30 seconds! 🎉

### 4. (Optional) Add CODEOWNERS

Copy the example and customize:
```bash
cp .github/CODEOWNERS.example .github/CODEOWNERS
# Edit .github/CODEOWNERS with your team structure
```

### 5. (Optional) Configure Integrations

For Notion or ClickUp, see [Setup Guide](PR_COMMENTS_TO_ISSUES_SETUP.md#optional-integrations).

## 📖 How to Use

### Basic Usage

Simply add trigger keywords to any PR comment:

```
TODO: Add input validation here
```

### Trigger Keywords

| Keyword | Effect |
|---------|--------|
| `TODO:` | Creates issue |
| `FIXME:` | Creates issue |
| `create issue` | Creates issue |
| `track this` | Creates issue |
| `follow up` | Creates issue |

### Issue Types (Auto-Labeled)

| Type | Keywords in Comment |
|------|---------------------|
| 🐛 bug | bug, error, broken, fix, problem |
| ✨ enhancement | feature, improve, add, todo, implement |
| 📚 documentation | docs, readme, comment, explain |
| 🔧 refactor | refactor, cleanup, optimize |
| 🧪 test | test, coverage, spec |
| 🔒 security | security, vulnerability, cve |

### Example Comments

#### Bug Report
```
BUG: Login fails when email contains special characters
Need to add proper URL encoding
```
→ Creates issue with `bug` label

#### Feature Request
```
TODO: Add dark mode support to this component
Create issue to track this enhancement
```
→ Creates issue with `enhancement` label

#### Documentation
```
DOCS: This function needs JSDoc comments
Follow up with proper documentation
```
→ Creates issue with `documentation` label

## 🏗️ Architecture

### Workflow Flow

```
PR Comment Created
       ↓
   [Trigger?] ──No──→ (Skip)
       ↓ Yes
  Parse Comment
       ↓
  Detect Type (bug/enhancement/docs/etc.)
       ↓
  Get File Ownership (CODEOWNERS)
       ↓
  Extract PR & Line Info
       ↓
  Create GitHub Issue
       ├─→ Assign to Owner
       ├─→ Add Labels
       └─→ Include Full Context
       ↓
  Reply on PR
       ↓
  [Notion Configured?] ──Yes──→ Create Notion Page
       ↓ No
  [ClickUp Configured?] ──Yes──→ Create ClickUp Task
       ↓ No
     Done! ✅
```

### Components

1. **Trigger Detection** (`parse` step)
   - Scans comment for keywords
   - Determines if issue should be created

2. **Type Classification** (`parse` step)
   - Analyzes content for type keywords
   - Assigns appropriate labels

3. **Ownership Resolution** (`ownership` step)
   - Reads CODEOWNERS file
   - Matches file path to owner
   - Falls back to comment author

4. **PR Context Extraction** (`pr_details` step)
   - Gets PR number, title, URL
   - Extracts line numbers
   - Builds reference links

5. **Issue Creation** (`create_issue` step)
   - Constructs issue title and body
   - Applies labels and assignment
   - Creates the issue via GitHub API

6. **PR Notification** (`comment back` step)
   - Replies to original comment
   - Links to created issue

7. **External Sync** (`notion/clickup` steps)
   - Syncs to Notion database (optional)
   - Creates ClickUp task (optional)
   - Continues on error (non-blocking)

## 🔧 Configuration

### Required Setup

✅ **GitHub Permissions** (Settings > Actions)
- Read and write permissions
- Allow PR creation/approval

### Optional Setup

🔹 **CODEOWNERS File** (`.github/CODEOWNERS`)
- Enables automatic assignment
- See [example file](../CODEOWNERS.example)

🔹 **Notion Integration**
- `NOTION_API_KEY` secret
- `NOTION_DATABASE_ID` secret
- See [setup guide](PR_COMMENTS_TO_ISSUES_SETUP.md#notion-integration)

🔹 **ClickUp Integration**
- `CLICKUP_API_KEY` secret
- `CLICKUP_LIST_ID` secret
- `CLICKUP_GITHUB_URL_FIELD_ID` secret (optional)
- See [setup guide](PR_COMMENTS_TO_ISSUES_SETUP.md#clickup-integration)

## 📊 What Gets Created

### GitHub Issue

```markdown
## Context

This issue was automatically created from a PR review comment.

**Source PR:** #123 - Feature: User Authentication
**Comment:** https://github.com/owner/repo/pull/123#discussion_r789
**File:** `src/auth/login.ts` (L45-L52)
**Type:** bug

## Original Comment

BUG: Login fails when email contains special characters
Need to add proper URL encoding before sending to API

---

### Quick Links
- [View PR](https://github.com/owner/repo/pull/123)
- [View Comment](https://github.com/owner/repo/pull/123#discussion_r789)
- [View Code](https://github.com/owner/repo/pull/123/files#diff-L45-L52)

### Related Information
- **Commented by:** @reviewer
- **Date:** 2025-11-08
```

**Labels:** `bug`, `from-pr-comment`
**Assignee:** Based on CODEOWNERS or comment author

### Notion Page (if configured)

- **Name:** `#123: BUG: Login fails when email...`
- **Status:** To Do
- **Type:** bug
- **GitHub URL:** Link to issue
- **Assignee:** Owner username

### ClickUp Task (if configured)

- **Name:** `#123: BUG: Login fails when email...`
- **Description:** Full comment + GitHub link
- **Priority:** Based on type (urgent for bugs/security)
- **Status:** to do
- **Tags:** Type + "from-github"

## 🧪 Testing

See **[Testing Guide](PR_COMMENTS_TESTING_GUIDE.md)** for:
- Test scenarios
- Validation checklist
- Debugging tips
- Rollout strategy

### Quick Test

1. Create test PR
2. Add comment: `TODO: Test workflow`
3. Check Actions tab for workflow run
4. Verify issue created with correct labels
5. Confirm PR has reply comment

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not running | Check Actions permissions |
| No issue created | Verify trigger keywords present |
| Wrong assignee | Check CODEOWNERS syntax |
| Notion sync failed | Verify API key and database ID |
| ClickUp sync failed | Check API token and list ID |

**Detailed troubleshooting:** [Testing Guide - Debugging](PR_COMMENTS_TESTING_GUIDE.md#debugging)

## 📈 Best Practices

### For Comment Authors

✅ **DO:**
- Use clear, descriptive language
- Include context and reasoning
- Use trigger keywords intentionally
- Reference specific line numbers

❌ **DON'T:**
- Use trigger keywords in casual comments
- Create duplicate issues
- Omit important context

### For Maintainers

✅ **DO:**
- Keep CODEOWNERS up to date
- Review auto-created issues regularly
- Close duplicates or invalid issues
- Provide feedback to improve triggers

❌ **DON'T:**
- Ignore all auto-created issues
- Over-rely on automation
- Let stale issues accumulate

## 🎨 Customization

The workflow is highly customizable. Common modifications:

### Add Custom Trigger Keywords

Edit workflow file, find the `shouldCreateIssue` condition:

```javascript
const shouldCreateIssue =
  body.includes('todo:') ||
  body.includes('fixme:') ||
  body.includes('your-keyword'); // Add here
```

### Add Custom Labels

Edit the `triggers` object:

```javascript
const triggers = {
  bug: /\b(bug|error|broken)\b/i,
  'custom-label': /\b(your|keywords)\b/i, // Add here
};
```

### Modify Issue Template

Edit the `issueBody` construction in the "Create GitHub Issue" step.

### Add More Integrations

Add new steps after ClickUp integration following the same pattern.

## 📚 Additional Resources

### Internal Documentation
- [Quick Reference](PR_COMMENTS_QUICK_REFERENCE.md) - Fast lookup
- [Setup Guide](PR_COMMENTS_TO_ISSUES_SETUP.md) - Complete installation
- [Testing Guide](PR_COMMENTS_TESTING_GUIDE.md) - Testing & validation

### GitHub Actions Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Script Action](https://github.com/actions/github-script)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

### External APIs
- [Notion API](https://developers.notion.com/)
- [ClickUp API](https://clickup.com/api/)

## 🤝 Contributing

To improve this workflow:

1. Test your changes thoroughly
2. Update documentation
3. Follow existing code style
4. Add test scenarios for new features

## 📝 Changelog

### v1.0.0 (2025-11-08)
- Initial release
- Core issue creation functionality
- Smart labeling based on keywords
- CODEOWNERS integration
- Notion sync support
- ClickUp sync support
- Comprehensive documentation

## 📄 License

This workflow is part of the Apophenia project and follows the same license.

## 🆘 Support

Need help?

1. Check the [Quick Reference](PR_COMMENTS_QUICK_REFERENCE.md)
2. Read the [Setup Guide](PR_COMMENTS_TO_ISSUES_SETUP.md)
3. Review [Testing Guide](PR_COMMENTS_TESTING_GUIDE.md)
4. Check workflow logs in Actions tab
5. Open an issue in the repository

---

**Made with ❤️ for better issue tracking**

**Version:** 1.0.0 | **Updated:** 2025-11-08
