# PR Comments to Issues - Testing Guide

This guide helps you test the workflow before rolling it out to your team.

## Table of Contents

- [Pre-Deployment Testing](#pre-deployment-testing)
- [Test Scenarios](#test-scenarios)
- [Validation Checklist](#validation-checklist)
- [Debugging](#debugging)

## Pre-Deployment Testing

### 1. Dry Run Setup

Before enabling for all PRs, test in a controlled environment:

1. Create a test branch
2. Create a test PR from that branch
3. Use the test scenarios below
4. Verify each feature works correctly

### 2. Enable Workflow

The workflow is automatically enabled when the file exists at:
```
.github/workflows/pr-comments-to-issues.yml
```

### 3. Check Permissions

Verify permissions are set correctly:

**Settings > Actions > General > Workflow permissions:**
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## Test Scenarios

### Scenario 1: Basic Issue Creation

**Objective:** Verify basic issue creation from PR comment

**Steps:**
1. Create a test PR
2. Add this comment on any line:
   ```
   TODO: Test issue creation workflow
   ```
3. Wait 10-30 seconds for workflow to run

**Expected Results:**
- ✅ Issue created with title: `[ENHANCEMENT] TODO: Test issue creation workflow`
- ✅ Issue has label `enhancement`
- ✅ Issue has label `from-pr-comment`
- ✅ Issue body contains PR link
- ✅ Issue body contains comment link
- ✅ Issue body contains file path
- ✅ Reply comment added to PR with issue link

**Verify:**
```bash
# Check workflow ran
gh run list --workflow=pr-comments-to-issues.yml

# Check issue created
gh issue list --label from-pr-comment
```

### Scenario 2: Bug Label Detection

**Objective:** Verify bug keyword detection

**Steps:**
1. Add comment:
   ```
   BUG: This function throws an error when input is null
   Create issue to track this
   ```

**Expected Results:**
- ✅ Issue labeled as `bug`
- ✅ Title starts with `[BUG]`

### Scenario 3: Documentation Label

**Objective:** Verify documentation keyword detection

**Steps:**
1. Add comment:
   ```
   DOCS: This function needs better documentation
   TODO: Add JSDoc comments
   ```

**Expected Results:**
- ✅ Issue labeled as `documentation`
- ✅ Title starts with `[DOCUMENTATION]`

### Scenario 4: Security Issue

**Objective:** Verify security keyword detection

**Steps:**
1. Add comment:
   ```
   SECURITY: Potential SQL injection vulnerability here
   Follow up with proper parameterization
   ```

**Expected Results:**
- ✅ Issue labeled as `security`
- ✅ Title starts with `[SECURITY]`

### Scenario 5: Multi-line Comment

**Objective:** Verify full comment content is captured

**Steps:**
1. Add comment:
   ```
   FIXME: Performance issue identified

   This section has multiple problems:
   1. Inefficient loop
   2. Unnecessary API calls
   3. Missing memoization

   Track this for optimization sprint
   ```

**Expected Results:**
- ✅ Full comment text in issue body
- ✅ Formatting preserved
- ✅ All context included

### Scenario 6: CODEOWNERS Assignment

**Objective:** Verify automatic assignment based on file ownership

**Prerequisites:**
- Create `.github/CODEOWNERS` file:
  ```
  /src/components/** @your-username
  ```

**Steps:**
1. Comment on a file matching the pattern (`/src/components/Button.tsx`)
2. Add comment: `TODO: Improve this component`

**Expected Results:**
- ✅ Issue assigned to `@your-username`
- ✅ Assignee matches CODEOWNERS pattern

### Scenario 7: Line Number Reference

**Objective:** Verify line number tracking

**Steps:**
1. Add comment on specific line (e.g., line 45)
2. Add comment: `TODO: Refactor this section`

**Expected Results:**
- ✅ Issue body contains line reference (L45)
- ✅ Quick link includes line number anchor

### Scenario 8: Non-Triggering Comment

**Objective:** Verify workflow doesn't create issues for regular comments

**Steps:**
1. Add comment without trigger keywords:
   ```
   This looks good, nice work!
   ```

**Expected Results:**
- ✅ No issue created
- ✅ No workflow run (or workflow runs but skips issue creation)

### Scenario 9: Notion Integration

**Objective:** Test Notion sync (if configured)

**Prerequisites:**
- Set `NOTION_API_KEY` secret
- Set `NOTION_DATABASE_ID` secret

**Steps:**
1. Add comment: `TODO: Test Notion integration`
2. Wait for workflow to complete

**Expected Results:**
- ✅ GitHub issue created
- ✅ Notion page created in database
- ✅ Notion page has correct properties:
  - Name: `#N: TODO: Test Notion integration`
  - Status: To Do
  - Type: enhancement
  - GitHub URL: Link to issue

**Verify:**
- Check Notion database for new entry
- Verify all properties are populated

### Scenario 10: ClickUp Integration

**Objective:** Test ClickUp sync (if configured)

**Prerequisites:**
- Set `CLICKUP_API_KEY` secret
- Set `CLICKUP_LIST_ID` secret

**Steps:**
1. Add comment: `TODO: Test ClickUp integration`
2. Wait for workflow to complete

**Expected Results:**
- ✅ GitHub issue created
- ✅ ClickUp task created in list
- ✅ Task has correct properties:
  - Name includes issue number
  - Description contains original comment
  - Priority set based on type
  - Tags include issue type
  - Status set to "to do"

**Verify:**
- Check ClickUp list for new task
- Verify task details match GitHub issue

## Validation Checklist

Use this checklist to ensure all features work correctly:

### Core Functionality
- [ ] Issue created from PR comment
- [ ] Issue title is descriptive
- [ ] Issue body contains original comment
- [ ] Issue body contains PR link
- [ ] Issue body contains file path
- [ ] Issue body contains line numbers
- [ ] Reply comment added to PR
- [ ] Reply contains link to created issue

### Labeling
- [ ] `from-pr-comment` label always added
- [ ] `bug` label for bug keywords
- [ ] `enhancement` label for feature keywords
- [ ] `documentation` label for docs keywords
- [ ] `refactor` label for refactor keywords
- [ ] `test` label for test keywords
- [ ] `security` label for security keywords

### Assignment
- [ ] Assignment based on CODEOWNERS (if file exists)
- [ ] Fallback to comment author (if no CODEOWNERS)
- [ ] Assignment works for different file paths

### Integrations (if configured)
- [ ] Notion page created
- [ ] Notion properties correct
- [ ] ClickUp task created
- [ ] ClickUp properties correct
- [ ] Integration failures don't break workflow

### Edge Cases
- [ ] Multi-line comments handled
- [ ] Special characters in comments
- [ ] Comments without trigger keywords ignored
- [ ] Multiple trigger keywords in one comment
- [ ] Very long comments (>1000 chars)
- [ ] Comments on deleted lines

## Debugging

### Check Workflow Logs

1. Go to **Actions** tab
2. Find "PR Comments to Issues" workflow
3. Click on run to see detailed logs
4. Expand each step to see output

### Common Issues and Solutions

#### Issue: Workflow Not Running

**Check:**
```bash
# List all workflows
gh workflow list

# View workflow details
gh workflow view pr-comments-to-issues.yml
```

**Verify:**
- File is at `.github/workflows/pr-comments-to-issues.yml`
- File has correct YAML syntax
- Repository has Actions enabled

**Fix:**
```bash
# Validate YAML syntax
yamllint .github/workflows/pr-comments-to-issues.yml

# Check workflow status
gh workflow enable pr-comments-to-issues.yml
```

#### Issue: Permission Denied

**Error Message:**
```
Error: Resource not accessible by integration
```

**Fix:**
1. Settings > Actions > General
2. Workflow permissions: "Read and write permissions"
3. Enable: "Allow GitHub Actions to create and approve pull requests"

#### Issue: CODEOWNERS Not Working

**Debug:**
```bash
# Test CODEOWNERS syntax
gh api repos/:owner/:repo/codeowners/errors
```

**Common Problems:**
- File not at `.github/CODEOWNERS`
- Username typo (missing @)
- Pattern doesn't match file path

**Fix:**
```bash
# Verify file location
ls -la .github/CODEOWNERS

# Check pattern matching
# Pattern: /src/components/**
# File: /src/components/Button.tsx
# Should match: YES
```

#### Issue: Notion Sync Failing

**Check Logs:**
Look for "Notion sync" step in workflow logs

**Common Errors:**
- `401 Unauthorized`: Invalid API key
- `404 Not Found`: Wrong database ID
- `400 Bad Request`: Database not shared with integration

**Debug:**
```bash
# Test API key
curl -X GET https://api.notion.com/v1/users/me \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Notion-Version: 2022-06-28"

# Test database access
curl -X GET https://api.notion.com/v1/databases/YOUR_DB_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

#### Issue: ClickUp Sync Failing

**Check Logs:**
Look for "ClickUp sync" step in workflow logs

**Common Errors:**
- `401 Unauthorized`: Invalid API token
- `404 Not Found`: Wrong list ID
- `400 Bad Request`: Missing required fields

**Debug:**
```bash
# Test API token
curl -X GET https://api.clickup.com/api/v2/team \
  -H "Authorization: YOUR_API_TOKEN"

# Test list access
curl -X GET https://api.clickup.com/api/v2/list/YOUR_LIST_ID \
  -H "Authorization: YOUR_API_TOKEN"
```

### Manual Workflow Trigger (for testing)

While the workflow is triggered by PR comments, you can test individual components:

**Test GitHub Script locally:**
```bash
# Install dependencies
npm install @actions/core @actions/github

# Create test script
node test-workflow.js
```

**Test API integrations:**
```bash
# Test Notion API
curl -X POST https://api.notion.com/v1/pages \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{
    "parent": { "database_id": "YOUR_DB_ID" },
    "properties": {
      "Name": { "title": [{ "text": { "content": "Test" } }] }
    }
  }'

# Test ClickUp API
curl -X POST https://api.clickup.com/api/v2/list/$CLICKUP_LIST_ID/task \
  -H "Authorization: $CLICKUP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Task",
    "description": "Test"
  }'
```

## Performance Testing

### Workflow Execution Time

**Expected Times:**
- Basic issue creation: 10-30 seconds
- With Notion sync: 15-40 seconds
- With ClickUp sync: 15-40 seconds
- With both: 20-50 seconds

**Monitor:**
```bash
# Check recent runs
gh run list --workflow=pr-comments-to-issues.yml --limit 10

# View specific run timing
gh run view RUN_ID --log
```

### Rate Limits

**GitHub API:**
- Authenticated: 5,000 requests/hour
- This workflow uses ~2-3 requests per comment

**Notion API:**
- Rate limit: 3 requests/second
- This workflow makes 1 request per comment

**ClickUp API:**
- Rate limit: 100 requests/minute
- This workflow makes 1 request per comment

## Rollout Strategy

### Phase 1: Internal Testing (Week 1)
- Enable workflow
- Test with team in test repository
- Gather feedback
- Fix any issues

### Phase 2: Limited Rollout (Week 2)
- Enable in production repository
- Announce to team
- Monitor first 10-20 issues
- Adjust as needed

### Phase 3: Full Deployment (Week 3+)
- Document any custom configurations
- Train team on best practices
- Review and close unnecessary auto-issues
- Collect feedback for improvements

## Success Metrics

Track these metrics to measure workflow effectiveness:

- **Adoption Rate:** % of PRs with triggered comments
- **Issue Quality:** % of auto-issues that are kept (not closed as invalid)
- **Time Saved:** Estimated time saved vs. manual issue creation
- **Assignment Accuracy:** % of correctly assigned issues
- **Integration Success:** % of successful Notion/ClickUp syncs

**Example Query:**
```bash
# Count auto-created issues
gh issue list --label from-pr-comment --state all --json number | jq '. | length'

# Count open auto-created issues
gh issue list --label from-pr-comment --state open --json number | jq '. | length'

# Check assignment accuracy
gh issue list --label from-pr-comment --json number,assignees --jq \
  'map(select(.assignees | length > 0)) | length'
```

## Cleanup

After testing, if you want to remove test issues:

```bash
# List all test issues
gh issue list --label from-pr-comment

# Close all test issues (use with caution!)
gh issue list --label from-pr-comment --json number --jq '.[].number' | \
  xargs -I {} gh issue close {}

# Or close with comment
gh issue list --label from-pr-comment --json number --jq '.[].number' | \
  xargs -I {} gh issue close {} --comment "Closing test issue"
```

## Next Steps

After successful testing:

1. ✅ Document your specific configuration
2. ✅ Train team on trigger keywords
3. ✅ Set up CODEOWNERS file
4. ✅ Configure integrations (Notion/ClickUp)
5. ✅ Monitor and adjust as needed
6. ✅ Gather team feedback
7. ✅ Iterate on customizations

---

**Happy Testing!** 🚀

For questions or issues, check the main setup guide or workflow logs.
