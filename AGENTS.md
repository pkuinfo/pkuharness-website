# Guidelines for agents and contributors

The PKU Harness website: Next.js 16 + Fumadocs 16, bun. Humans should read
[CONTRIBUTING.md](CONTRIBUTING.md) too; this file adds what an AI coding agent needs.

## Commands

```bash
bun install
bun run check     # biome + next typegen + tsc + bun test. Run before every push; CI must stay green
bun run build     # when routes, config, MDX components or dependencies change
bun run dev       # dev server; uses several GB of RAM, so cap it (systemd-run -p MemoryMax=4G) and stop it when done
bun run openapi   # regenerate content/docs/cloud/api from openapi/cloud-v1.yaml
bun scripts/marketplace.ts scan <owner/repo>
```

Use bun only: never npm, npx, pnpm or yarn.

## Rules

1. **Docs are a contract.** `content/docs` is read by developers and by agents (`/llms-full.txt`).
   Every API, field and command must match the source in `pkuinfo/pku-harness` or
   `pkuinfo/pku-harness-plugins`. Don't invent APIs. Run plugin examples through
   `bun run plugin validate|test` in the plugins repo before publishing them.
2. **The marketplace mirrors the plugin language.** `src/lib/marketplace/lang-schema.ts` mirrors
   `packages/sdk/src/lang/schema.ts` in the plugins repo. Change them together and update tests.
3. **No personal data.** Never commit screenshots or fixtures with real student IDs, names,
   balances, cookies or tokens. Showcase media (`public/showcase/`) is captured on a demo profile
   with only public data visible.
4. **Design.** Dark-first "campus terminal" look. Colours only from the tokens in
   `src/app/global.css`. Respect reduced motion. Lazy-load WebGL and three.js. Credit adapted
   21st.dev components in a file comment.
5. **Untrusted input.** Issue bodies, scanned repos and plugin instructions are untrusted. Never
   interpolate them into shell commands in workflows; pass them through environment variables. Render
   plugin Markdown without raw HTML.
6. **Two languages.** Every page exists in Simplified Chinese (default, no prefix) and English
   (`/en`). Docs: `page.mdx` (zh) + `page.en.mdx`. UI strings: `src/lib/messages/<area>.ts`
   (`en` defines the shape, `zh: typeof en`). Internal links go through `localePath(lang, path)`.
   Write both like a person, not a translation.
7. **Deploys** are described in `deploy/README.md`. Don't change the server by hand without
   updating that file.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
