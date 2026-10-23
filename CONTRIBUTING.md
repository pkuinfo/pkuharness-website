# Contributing

Thanks for helping the PKU Harness website.
- **Docs** live in `content/docs/*.mdx`. Write for two readers: a student developer and an AI agent.
  Be precise, give runnable examples, and keep pages in sync with
  [`@pku-harness/sdk`](https://github.com/pkuinfo/pku-harness-plugins/tree/main/packages/sdk).
- **Plugins** are listed through the marketplace's Submit flow, which opens an issue here; a bot scans the
  repo and opens a pull request adding it to `data/sources.json`. Maintainers review and merge.
- Use **bun** (`bun install`, `bun run …`, `bunx`), never npm/pnpm/yarn.
- Before a PR: `bun run check` (lint + types + tests), then `bun run build`.
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:` …).
