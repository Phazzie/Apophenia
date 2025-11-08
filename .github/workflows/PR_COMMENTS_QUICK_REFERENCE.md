# PR Comments to Issues - Quick Reference

## 🚀 Quick Start

1. Enable workflow: File is at `.github/workflows/pr-comments-to-issues.yml`
2. Set permissions: Settings > Actions > "Read and write permissions"
3. (Optional) Create `.github/CODEOWNERS` file
4. Test: Add comment with `TODO:` on any PR

## 🎯 Trigger Keywords

Add these keywords to PR comments to create issues:

| Keyword | Example |
|---------|---------|
| `TODO:` | `TODO: Add validation here` |
| `FIXME:` | `FIXME: Memory leak in this function` |
| `create issue` | `We should create issue for this` |
| `track this` | `Track this for next sprint` |
| `follow up` | `Follow up on this later` |

## 🏷️ Auto-Labeling

Issues are automatically labeled based on keywords:

| Label | Keywords |
|-------|----------|
| `bug` | bug, error, broken, issue, fix, problem |
| `enhancement` | enhancement, feature, improve, add, todo, implement |
| `documentation` | docs, documentation, readme, comment, explain |
| `refactor` | refactor, cleanup, optimize, reorganize |
| `test` | test, testing, coverage, spec |
| `security` | security, vulnerability, cve, exploit |

## 📋 Required Secrets

### Basic (GitHub Only)
✅ No setup needed - uses automatic `GITHUB_TOKEN`

### Notion Integration (Optional)

Add to **Settings > Secrets and variables > Actions**:

```
NOTION_API_KEY = secret_abc123...
NOTION_DATABASE_ID = abc123def456...
```

**Get Notion API Key:**
1. https://www.notion.so/my-integrations
2. Create integration
3. Copy token

**Get Database ID:**
1. Open database in Notion
2. Copy link
3. Extract ID from URL: `notion.so/workspace/DATABASE_ID?v=...`

### ClickUp Integration (Optional)

Add to **Settings > Secrets and variables > Actions**:

```
CLICKUP_API_KEY = pk_123456_ABC...
CLICKUP_LIST_ID = 123456789
CLICKUP_GITHUB_URL_FIELD_ID = abc-123-def (optional)
```

**Get ClickUp API Key:**
1. ClickUp > Settings > Apps
2. Generate API Token

**Get List ID:**
1. Open ClickUp list
2. Copy link
3. Extract from URL: `clickup.com/WORKSPACE_ID/v/l/LIST_ID`

## 📝 Usage Examples

### Simple TODO
```
TODO: Add error handling here
```
→ Creates issue labeled `enhancement`

### Bug Report
```
BUG: This crashes when input is empty
Need to add null check
```
→ Creates issue labeled `bug`

### Documentation
```
DOCS: This function needs better comments
Create issue to add JSDoc
```
→ Creates issue labeled `documentation`

### Security Issue
```
SECURITY: SQL injection vulnerability
Follow up with parameterized queries
```
→ Creates issue labeled `security`

## 🔧 CODEOWNERS Setup

Create `.github/CODEOWNERS`:

```plaintext
# Default owner
* @your-username

# Frontend
/src/components/** @frontend-dev
*.tsx @frontend-dev

# Backend
/server/** @backend-dev
/api/** @backend-dev

# Docs
*.md @tech-writer

# DevOps
/.github/** @devops-team
```

## ✅ What Gets Created

Each issue includes:

- ✅ Descriptive title with type tag
- ✅ Original comment content
- ✅ Link to PR and specific code lines
- ✅ File path and line numbers
- ✅ Auto-assigned based on CODEOWNERS
- ✅ Appropriate labels
- ✅ Reply comment on PR with issue link

## 🎛️ Permissions Required

**Settings > Actions > General:**

- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow not running | Check permissions in Settings > Actions |
| No issue created | Ensure comment has trigger keywords |
| Wrong assignee | Verify CODEOWNERS file syntax |
| Notion not syncing | Check API key and database ID in secrets |
| ClickUp not syncing | Verify API token and list ID |

## 🔍 Check Workflow Status

1. Go to **Actions** tab
2. Find "PR Comments to Issues" workflow
3. Click on latest run to see logs

## 📚 Full Documentation

See `PR_COMMENTS_TO_ISSUES_SETUP.md` for complete setup guide.

## 🎨 Customization

Edit `.github/workflows/pr-comments-to-issues.yml` to:
- Add custom trigger keywords
- Modify label detection
- Change issue template
- Add more integrations

## 💡 Pro Tips

1. **Use descriptive comments** - They become issue titles
2. **Reference line numbers** - Automatically included in issues
3. **Add context** - Multi-line comments work great
4. **Review auto-issues** - Some may need manual closure
5. **Update CODEOWNERS** - Keep it current for accurate assignment

## 🔗 Related Files

- Workflow: `.github/workflows/pr-comments-to-issues.yml`
- Setup Guide: `.github/workflows/PR_COMMENTS_TO_ISSUES_SETUP.md`
- CODEOWNERS Example: `.github/CODEOWNERS.example`

---

**Need help?** Check the full setup guide or workflow logs in the Actions tab.
