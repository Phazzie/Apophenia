# GitHub Secrets Configuration Template

Use this template to configure secrets for the PR Comments to Issues workflow.

## 📍 Location

**Repository Settings > Secrets and variables > Actions > Repository secrets**

Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

## 🔐 Required Secrets

### GitHub Token (Automatic)

✅ **No setup required**

The workflow automatically uses `${{ secrets.GITHUB_TOKEN }}` which is provided by GitHub Actions.

## 🔌 Optional Integration Secrets

### Notion Integration

If you want to sync issues to Notion, add these secrets:

#### NOTION_API_KEY

**Description:** Notion Internal Integration Token

**How to get it:**
1. Go to https://www.notion.so/my-integrations
2. Click **+ New integration**
3. Fill in the details:
   - **Name:** GitHub Issues Sync
   - **Associated workspace:** (Select your workspace)
   - **Type:** Internal integration
4. Click **Submit**
5. Copy the **Internal Integration Token** (starts with `secret_`)

**Value format:**
```
secret_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Example:**
```
secret_1234567890abcdefghijklmnopqrstuvwxyz1234567890abc
```

---

#### NOTION_DATABASE_ID

**Description:** The ID of your Notion database where issues will be created

**How to get it:**
1. Create a database in Notion with these properties:
   - **Name** (Title) - Required
   - **Status** (Select) - Options: To Do, In Progress, Done
   - **Type** (Select) - Options: bug, enhancement, documentation, refactor, test, security
   - **GitHub URL** (URL)
   - **Assignee** (Text or Person)

2. Share the database with your integration:
   - Open the database
   - Click **...** (top right)
   - Click **Add connections**
   - Select your integration (GitHub Issues Sync)

3. Get the database ID from the URL:
   - Copy the database link
   - URL format: `https://www.notion.so/workspace/DATABASE_ID?v=VIEW_ID`
   - Extract the 32-character ID between the last `/` and `?`

**Value format:**
```
abc123def456ghi789jkl012mno345pq
```

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**URL example:**
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                   This is your DATABASE_ID
```

---

### ClickUp Integration

If you want to sync issues to ClickUp, add these secrets:

#### CLICKUP_API_KEY

**Description:** ClickUp API Token

**How to get it:**
1. Open ClickUp
2. Click your avatar (bottom left)
3. Go to **Settings**
4. Click **Apps** in the sidebar
5. Scroll to **API Token**
6. Click **Generate** (or **Regenerate** if you already have one)
7. Copy the token (starts with `pk_`)

**Value format:**
```
pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFG
```

**Example:**
```
pk_87654321_XYZ9876543210ABCDEFGHIJKLMNOPQRSTUVWXYZ12345
```

⚠️ **Important:** Keep this token secure! It has full access to your ClickUp workspace.

---

#### CLICKUP_LIST_ID

**Description:** The ID of the ClickUp list where tasks will be created

**How to get it:**
1. Open ClickUp and navigate to the list where you want tasks created
2. Click **...** (top right of the list)
3. Click **Copy link**
4. Extract the list ID from the URL

**URL format:**
```
https://app.clickup.com/WORKSPACE_ID/v/l/LIST_ID
                                         ^^^^^^^^
                                         This is your LIST_ID
```

**Value format:**
```
901234567
```

**Example:**
```
123456789
```

**Full URL example:**
```
https://app.clickup.com/12345678/v/l/123456789
                                      ^^^^^^^^^
                                      This is your LIST_ID
```

---

#### CLICKUP_GITHUB_URL_FIELD_ID (Optional)

**Description:** Custom field ID for storing GitHub issue URL

**This is optional but recommended for better integration.**

**How to get it:**
1. Open your ClickUp list
2. Click **...** > **Customize**
3. Add a custom field:
   - **Type:** URL
   - **Name:** GitHub URL
4. Save the custom field

5. Get the field ID using the API:
   ```bash
   curl -X GET \
     'https://api.clickup.com/api/v2/list/YOUR_LIST_ID/field' \
     -H 'Authorization: YOUR_API_TOKEN'
   ```

6. Find the field with name "GitHub URL" in the response
7. Copy its `id` value

**Value format:**
```
abc-123-def-456-ghi
```

**Example:**
```
a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

**If you skip this:** The GitHub URL will still be included in the task description, just not as a dedicated field.

---

## 🛠️ Setting Secrets in GitHub

### Via Web Interface

1. Navigate to repository settings:
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
   ```

2. Click **New repository secret**

3. Enter:
   - **Name:** (e.g., `NOTION_API_KEY`)
   - **Secret:** (paste the value)

4. Click **Add secret**

5. Repeat for each secret

### Via GitHub CLI

```bash
# Set Notion secrets
gh secret set NOTION_API_KEY
# Paste your key when prompted

gh secret set NOTION_DATABASE_ID
# Paste your database ID when prompted

# Set ClickUp secrets
gh secret set CLICKUP_API_KEY
# Paste your key when prompted

gh secret set CLICKUP_LIST_ID
# Paste your list ID when prompted

gh secret set CLICKUP_GITHUB_URL_FIELD_ID
# Paste your field ID when prompted (optional)
```

### Via GitHub CLI (One-Liners)

```bash
# Notion
echo "secret_YOUR_NOTION_KEY" | gh secret set NOTION_API_KEY
echo "YOUR_DATABASE_ID" | gh secret set NOTION_DATABASE_ID

# ClickUp
echo "pk_YOUR_CLICKUP_TOKEN" | gh secret set CLICKUP_API_KEY
echo "YOUR_LIST_ID" | gh secret set CLICKUP_LIST_ID
echo "YOUR_FIELD_ID" | gh secret set CLICKUP_GITHUB_URL_FIELD_ID
```

## ✅ Verification

### Check Secrets Are Set

```bash
# List all secrets (values are hidden)
gh secret list

# Expected output:
# NOTION_API_KEY        Updated 2025-11-08
# NOTION_DATABASE_ID    Updated 2025-11-08
# CLICKUP_API_KEY       Updated 2025-11-08
# CLICKUP_LIST_ID       Updated 2025-11-08
# CLICKUP_GITHUB_URL... Updated 2025-11-08
```

### Test Notion Connection

```bash
curl -X GET https://api.notion.com/v1/databases/YOUR_DATABASE_ID \
  -H "Authorization: Bearer YOUR_NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"

# Expected: 200 OK with database details
```

### Test ClickUp Connection

```bash
curl -X GET https://api.clickup.com/api/v2/list/YOUR_LIST_ID \
  -H "Authorization: YOUR_CLICKUP_API_KEY"

# Expected: 200 OK with list details
```

## 🔒 Security Best Practices

### DO:
- ✅ Use repository secrets (never commit secrets to code)
- ✅ Rotate tokens regularly
- ✅ Use minimal permissions required
- ✅ Review secret access regularly
- ✅ Delete unused secrets

### DON'T:
- ❌ Share secrets publicly
- ❌ Commit secrets to repository
- ❌ Use personal access tokens in shared repositories
- ❌ Give secrets broader access than needed
- ❌ Reuse secrets across multiple repositories

## 🚨 If Secrets Are Compromised

### Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Find your integration
3. Click **Regenerate token**
4. Update the GitHub secret with new token

### ClickUp API Token

1. Go to ClickUp > Settings > Apps
2. Click **Regenerate** under API Token
3. Update the GitHub secret with new token
4. Old token is immediately invalidated

## 📋 Quick Setup Checklist

Use this checklist when setting up secrets:

### Notion Setup
- [ ] Created Notion integration at https://www.notion.so/my-integrations
- [ ] Copied Internal Integration Token
- [ ] Created Notion database with required properties:
  - [ ] Name (Title)
  - [ ] Status (Select: To Do, In Progress, Done)
  - [ ] Type (Select: bug, enhancement, documentation, etc.)
  - [ ] GitHub URL (URL)
  - [ ] Assignee (Text)
- [ ] Shared database with integration
- [ ] Copied database ID from URL
- [ ] Set `NOTION_API_KEY` secret in GitHub
- [ ] Set `NOTION_DATABASE_ID` secret in GitHub
- [ ] Tested connection with curl
- [ ] Verified secret appears in `gh secret list`

### ClickUp Setup
- [ ] Generated ClickUp API token (Settings > Apps)
- [ ] Copied API token
- [ ] Found target list in ClickUp
- [ ] Copied list ID from URL
- [ ] (Optional) Created custom field "GitHub URL"
- [ ] (Optional) Got custom field ID from API
- [ ] Set `CLICKUP_API_KEY` secret in GitHub
- [ ] Set `CLICKUP_LIST_ID` secret in GitHub
- [ ] (Optional) Set `CLICKUP_GITHUB_URL_FIELD_ID` secret
- [ ] Tested connection with curl
- [ ] Verified secrets appear in `gh secret list`

## 🆘 Troubleshooting

### "Resource not accessible by integration" Error

**Issue:** Notion returns 403 Forbidden

**Solution:**
- Verify database is shared with integration
- Go to database > ... > Add connections > Select your integration

### "Invalid API Token" Error

**Issue:** ClickUp returns 401 Unauthorized

**Solution:**
- Regenerate API token in ClickUp settings
- Update GitHub secret with new token
- Ensure no extra spaces in token

### "Database not found" Error

**Issue:** Notion returns 404 Not Found

**Solution:**
- Verify database ID is correct (32 characters)
- Ensure no extra characters or spaces
- Check database still exists in Notion

### "List not found" Error

**Issue:** ClickUp returns 404 Not Found

**Solution:**
- Verify list ID is correct (numeric)
- Ensure list hasn't been deleted or archived
- Check you have access to the list

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Notion API Documentation](https://developers.notion.com/)
- [ClickUp API Documentation](https://clickup.com/api/)
- [Main Setup Guide](PR_COMMENTS_TO_ISSUES_SETUP.md)

---

**Security Note:** Never commit this file with actual secret values. This is a template only.
