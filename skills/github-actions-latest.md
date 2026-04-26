# GitHub Actions Latest Versions Skill

## Overview

This skill provides guidance for maintaining GitHub Actions workflows with the latest action versions to ensure compatibility, security, and performance. It covers checking for updates, updating workflows, and best practices for action versioning.

## Common GitHub Actions

### Core Actions

| Action | Current Latest | Purpose |
|--------|---------------|---------|
| `actions/checkout` | v6 | Checkout repository code |
| `actions/setup-node` | v6 | Set up Node.js environment |
| `actions/upload-artifact` | v7 | Upload build artifacts |
| `actions/download-artifact` | v4 | Download build artifacts |
| `pnpm/action-setup` | v5 | Set up pnpm package manager |
| `actions/setup-python` | v5 | Set up Python environment |
| `actions/setup-go` | v5 | Set up Go environment |
| `actions/cache` | v4 | Cache dependencies |

## Checking for Latest Versions

### Manual Check via GitHub

1. Visit the action's GitHub repository
2. Navigate to the Releases page
3. Check the latest release tag (e.g., v6.0.2)
4. Review release notes for breaking changes

### Using GitHub CLI

```bash
# Check latest release for an action
gh release list --repo actions/checkout --limit 1
gh release list --repo actions/setup-node --limit 1
gh release list --repo actions/upload-artifact --limit 1
```

### Web Search Approach

When uncertain about the latest version, search for:
- "actions/checkout latest version 2026"
- "actions/setup-node latest release"
- "GitHub Actions [action-name] latest version"

## Updating Workflow Files

### Basic Update Pattern

```yaml
# Before
- uses: actions/checkout@v4

# After
- uses: actions/checkout@v6
```

### Multi-Action Update

When updating multiple actions, use a systematic approach:

1. List all actions in the workflow
2. Check each action's latest version
3. Update all at once to minimize commits
4. Test the workflow after updates

Example:
```yaml
steps:
  - uses: actions/checkout@v6
  - uses: pnpm/action-setup@v5
    with:
      version: 10
  - uses: actions/setup-node@v6
    with:
      node-version: 22
      cache: 'pnpm'
  - uses: actions/upload-artifact@v7
    with:
      name: artifact
      path: ./dist
```

## Node.js Runtime Compatibility

### The Node.js 20 Deprecation

GitHub Actions is transitioning from Node.js 20 to Node.js 24:
- **June 2, 2026**: Node.js 24 becomes default
- **September 16, 2026**: Node.js 20 removed from runners

### Opt into Node.js 24 Early

Add this to your workflow job:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      # your steps
```

### Verify Action Compatibility

Before updating, check if the action supports Node.js 24:
- Review the action's release notes
- Look for "Node.js 24 support" in changelog
- Actions v6+ typically support Node.js 24

## Best Practices

### Version Pinning

**Recommended:** Pin to major version
```yaml
- uses: actions/checkout@v6  # Good: gets v6.x.x updates
```

**Not Recommended:** Pin to exact version
```yaml
- uses: actions/checkout@v6.0.2  # Too specific, misses patch updates
```

**Avoid:** Using branches
```yaml
- uses: actions/checkout@main  # Risky: breaking changes
```

### Semantic Versioning

- **Major version (v6)**: Breaking changes possible
- **Minor version (v6.1)**: New features, backward compatible
- **Patch version (v6.1.2)**: Bug fixes, backward compatible

### Update Strategy

1. **Check monthly** for action updates
2. **Review release notes** for breaking changes
3. **Update in CI first** before local development
4. **Test thoroughly** after updates
5. **Roll back** if issues occur

### Security Considerations

- Latest versions often include security patches
- Dependabot can automate action updates
- Review security advisories for actions you use

## Common Actions Reference

### actions/checkout

```yaml
- uses: actions/checkout@v6
  with:
    # Optional: fetch all history for all branches
    fetch-depth: 0
    # Optional: persist token for subsequent steps
    persist-credentials: true
```

### actions/setup-node

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: '22'
    cache: 'npm'  # or 'pnpm', 'yarn'
    cache-dependency-path: '**/package-lock.json'
```

### actions/upload-artifact

```yaml
- uses: actions/upload-artifact@v7
  with:
    name: artifact-name
    path: ./dist
    retention-days: 30
    if-no-files-found: warn  # or 'error' or 'ignore'
```

### pnpm/action-setup

```yaml
- uses: pnpm/action-setup@v5
  with:
    version: 10
    # Optional: run install automatically
    run_install: false
```

## Automation

### Dependabot for Actions

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Script to Check Versions

```bash
#!/bin/bash
# check-actions-versions.sh

actions=(
  "actions/checkout"
  "actions/setup-node"
  "actions/upload-artifact"
  "pnpm/action-setup"
)

for action in "${actions[@]}"; do
  echo "Checking $action..."
  gh release list --repo "$action" --limit 1
  echo "---"
done
```

## Troubleshooting

### Action Not Found

If an action version doesn't exist:
- Verify the action name is correct
- Check if the version tag exists
- Use a valid major version instead

### Breaking Changes

After updating, if workflow fails:
1. Check the action's release notes
2. Review required configuration changes
3. Update workflow configuration accordingly
4. Roll back to previous version if needed

### Deprecation Warnings

GitHub may show deprecation warnings:
- Read the warning message carefully
- Follow the recommended migration path
- Update before the deprecation deadline

## Workflow Checklist

When updating GitHub Actions:

- [ ] Check latest version for each action
- [ ] Review release notes for breaking changes
- [ ] Update action versions in workflow file
- [ ] Add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` if needed
- [ ] Test workflow in a feature branch
- [ ] Verify CI/CD pipeline passes
- [ ] Commit changes with descriptive message
- [ ] Monitor workflow after deployment

## Project-Specific Notes

### StudioCMS Blog Workflows

**Active Workflows:**
- `.github/workflows/playwright.yml` - E2E testing

**Current Actions:**
- `actions/checkout@v6`
- `pnpm/action-setup@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v7`

**Update Schedule:**
- Check for updates monthly
- Update before Node.js 20 deprecation (June 2026)
- Review Dependabot PRs for action updates

**Environment Variables:**
- `CMS_ENCRYPTION_KEY` - Stored as GitHub secret
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` - Set to true for Node.js 24
