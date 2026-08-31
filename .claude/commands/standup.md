---
description: Generate a standup summary from recent git activity
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git status:*)
---

Recent commits (last 24h):
!`git log --since="24 hours ago" --pretty=format:"%h %an %s" --no-merges`

Commits since yesterday by me:
!`git log --since="yesterday" --author="$(git config user.name)" --pretty=format:"%h %s" --no-merges`

Uncommitted work in progress:
!`git status --short`

Using the activity above, write a concise standup update for ShopSphere in three sections:

- **Yesterday / recently:** what shipped (group related commits; mention backend vs frontend).
- **In progress:** infer from uncommitted/branch state.
- **Blockers / next:** anything that looks stuck, plus the logical next steps.

Keep it to a few bullets per section. If there was no activity, say so.
