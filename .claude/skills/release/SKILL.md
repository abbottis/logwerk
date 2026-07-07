---
name: release
description: Use when cutting/publishing a new LogWerk version — bumping the version, releasing, tagging, or "pushing a version". Runs the full release procedure: changelog + README badge, tag, push, and GitHub release.
---

# Releasing a LogWerk Version

## Overview

LogWerk is versioned with SemVer and a hand-maintained `changelog.md`. A release is **not** just a push to `main` — every version must also be recorded in the changelog, reflected in the README badge, tagged in git, and published as a GitHub release so the badge's `/releases` link is never empty.

**Repo:** `abbottis/logwerk` · **Default branch:** `main`

## When to Use

- The user asks to "release", "cut a version", "bump the version", "publish vX.Y.Z", or "push a new version".
- After a feature/fix milestone that should become a numbered release.

Pick the SemVer bump from the change scope: **patch** (fixes, small additions), **minor** (new features, backwards-compatible), **major** (breaking changes). If unclear, ask.

## Procedure

Run these in order. Substitute `X.Y.Z` and use today's date (`YYYY-MM-DD`).

**1. Changelog** — Prepend a new section to `changelog.md`, above the previous version:
```markdown
## [X.Y.Z] - YYYY-MM-DD
### Added        # and/or ### Changed / ### Fixed / ### Removed
- **Feature**: concise, user-facing description.
```

**2. README badge** — In `README.md`, bump the version badge:
```
[![Version](https://img.shields.io/badge/version-X.Y.Z-6d28d9?style=flat-square)](https://github.com/abbottis/logwerk/releases)
```
Also update any version-dependent copy (e.g. the "70+ known bots" count) if the release changed it.

**3. Commit & push** — Include the code changes plus changelog + README:
```bash
git add -A && git commit -m "Release vX.Y.Z: <one-line summary>

<optional body>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push origin main
```
If the push is rejected, `git pull --rebase origin main`, resolve conflicts, then push.

**4. Annotated tag** — Tag the release commit and push tags:
```bash
git tag -a vX.Y.Z -m "LogWerk vX.Y.Z — <one-line summary>"
git push origin --tags
```

**5. GitHub release** — Publish notes derived from the changelog entry:
```bash
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --latest --notes "$(cat <<'EOF'
### Added
- ...

**Full changelog:** [changelog.md](https://github.com/abbottis/logwerk/blob/main/changelog.md)
EOF
)"
```

**6. Verify** — Confirm it published and points at the right tag:
```bash
gh release view vX.Y.Z
```
Report the release URL to the user.

## Common Mistakes

- **Committing/pushing without a tag + release** → the README badge links to an empty/stale `/releases` page. All five steps go together.
- **Tag on the wrong commit** → always tag *after* the release commit is pushed (or pass the explicit SHA to `git tag -a vX.Y.Z <sha>`).
- **Changelog date drift** → use the actual current date, not a copied one.
- **Release notes ≠ changelog** → derive notes from the changelog entry so they stay consistent.

## Notes

- No build/test step exists (pure static app) — verify changes manually in the browser before releasing (see `CLAUDE.md`).
- For retroactive tagging of past versions, `git tag -a vX.Y.Z <sha>` against the matching commit and `git push origin --tags`; only the current version needs a full GitHub release.
