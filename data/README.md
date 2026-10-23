# Marketplace data

`sources.json` lists the GitHub repositories the [plugin marketplace](../content/docs/marketplace/index.mdx)
indexes, next to the official registry in `pkuinfo/pku-harness-plugins`. Every plugin manifest
in a listed repo is scanned about once an hour and shown at `/marketplace/<owner>/<repo>/<id>`.

```json
{
  "sources": [
    { "repo": "alice/campus-tools", "addedAt": "2026-11-02", "verified": ["canteen-menu"], "path": "plugins" }
  ]
}
```

| Field      |                                                                                         |
| ---------- | --------------------------------------------------------------------------------------- |
| `repo`     | `owner/repo` on github.com (public). Sorted case-insensitively.                         |
| `addedAt`  | Date it was listed (`YYYY-MM-DD`). Earlier entries win plugin-id conflicts.             |
| `verified` | Plugin ids a maintainer reviewed (read the source, checked the review rules). Optional. |
| `path`     | Only scan this sub-folder. Optional.                                                    |

Entries are added by the `plugin-submission` workflow (issue → scan → pull request) or with
`bun scripts/marketplace.ts add <owner/repo>`. CI runs `bun scripts/marketplace.ts check` on
every change here and weekly. See `content/docs/marketplace/review.mdx` for the verification
checklist.
