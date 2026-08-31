---
name: release-notes
description: Generate release notes / changelog entries for ShopSphere from git history. Use when cutting a release or summarizing what changed between two refs (tags, branches, or dates).
---

# ShopSphere release notes

Produce clean, user-facing release notes from git history.

## Steps
1. **Determine the range.** Ask or infer: `<from-ref>..<to-ref>` (default: last tag → `HEAD`, else
   the last ~30 commits). Find the last tag with `git describe --tags --abbrev=0` when available.
2. **Collect commits:** `git log <range> --no-merges --pretty=format:"%h|%s|%an"`. For detail on a
   commit, use `git show <hash>`.
3. **Classify** each commit into: **Features**, **Fixes**, **Performance**, **Security**,
   **Refactor/Chore**, **Docs**. Infer from Conventional-Commit prefixes when present
   (`feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `chore:`), else from the message + diff.
4. **Tag the area** where useful: `backend` / `frontend` / specific domain (products, cart, orders,
   payments, seller, admin).
5. **Rewrite tersely for readers** — active voice, one line each, no bare hashes in the headline
   (link them at the end if requested). Drop pure noise (merge/format-only commits).

## Output format

```
## <version or range> — <YYYY-MM-DD>

### ✨ Features
- ...

### 🐛 Fixes
- ...

### ⚡ Performance
- ...

### 🔒 Security
- ...

### 🧹 Maintenance
- ...
```

Omit empty sections. Call out any **breaking changes** or required env/migration steps in a bold
note at the top. Highlight anything touching payments, auth, or data models.
