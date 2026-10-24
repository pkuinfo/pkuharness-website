# Contributing to the PKU Harness website

Thanks for helping. This repo is the website: landing and download pages, the developer docs and the
plugin marketplace. For the app itself see [pku-harness](https://github.com/pkuinfo/pku-harness); for
plugins and the SDK see [pku-harness-plugins](https://github.com/pkuinfo/pku-harness-plugins).

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Fix or improve the docs.** Every docs page links to its source file on GitHub (the page menu next
  to "Copy Markdown"). Small fixes can go
  straight to a pull request.
- **Write a guide.** Open an issue first with the outline, so we can agree on where it fits.
- **Improve the site.** UI, accessibility, performance, marketplace features. For anything larger
  than a small fix, open an issue first.
- **List a plugin.** Use the [submit page](https://harness.novadiffusion.com/marketplace/submit). You
  don't need a pull request here.

## Development setup

```bash
bun install
bun run dev      # http://localhost:3000
```

Use **bun** for everything (`bun install`, `bun add`, `bun run`, `bunx`). Don't commit a
`package-lock.json`, `pnpm-lock.yaml` or `yarn.lock`.

This is Next.js 16 and Fumadocs 16, and both changed a lot recently. Before using an API, check the
docs bundled in `node_modules/next/dist/docs/` and [fumadocs.dev](https://fumadocs.dev) rather than
relying on memory.

## Before you open a pull request

```bash
bun run check    # Biome lint + format, next typegen + tsc, bun test (what CI runs)
bun run build    # if you changed routes, config, MDX components or dependencies
```

CI must stay green. A pull request that fails `check` won't be merged.

Then, in the pull request:
- Describe what changed and why, and link the issue (`Closes #123`).
- For UI changes, attach screenshots in **dark and light** themes, at desktop and phone widths.
- Keep it focused: one topic per pull request.

## Writing docs

Docs live in `content/docs/` as MDX, in two languages (Fumadocs i18n, dot parser): `page.mdx` is
Simplified Chinese (served at `/docs/...`), `page.en.mdx` is English (`/en/docs/...`). A page
without a Chinese file falls back to English. Change both languages in the same pull request, or
say in the PR that a translation is pending.

They have two readers: a student developer and an AI agent that reads the Markdown version
(`/en/docs/<page>.md`, `/llms-full.txt`).
- **Follow [STYLE.md](STYLE.md).** It is the writing standard for docs and page text in both languages.
- **Write like a person.** Short, concrete sentences, "you", active voice. No filler intros or
  marketing words ("seamless", "powerful", "leverage"). The Chinese should read like native docs
  (全角标点, a space between Chinese and Latin text, no 翻译腔), not a translation.
- **Precise and runnable.** Use complete, copy-pasteable examples. Name exact types, fields and
  commands.
- **Only document what exists.** Every claim must match the source in
  [pku-harness](https://github.com/pkuinfo/pku-harness) or
  [pku-harness-plugins](https://github.com/pkuinfo/pku-harness-plugins). Mark planned features as
  planned.
- **Verify examples.** For plugin examples, run them through the author CLI in the plugins repo:
  `bun run plugin validate|test <dir>`.
- **Links:** in `.en.mdx` files, link to `/en/docs/...` (and `/en/marketplace`); Chinese pages use
  `/docs/...`. UI strings outside the docs go in `src/lib/messages/<area>.ts`, never inline.
- **Self-contained pages.** Every page needs a `title` and a one-sentence `description` in its
  frontmatter, because the description shows up in `llms.txt`.
- **New pages** go in the folder's `meta.json`. Use Fumadocs components (`Callout`, `Steps`, `Tabs`,
  `TypeTable`, `Cards`) rather than raw HTML.
- **Generated pages:** the Cloud API pages are generated. Edit `openapi/cloud-v1.yaml`, then run
  `bun run openapi`.

## Code style

- TypeScript, formatted and linted by Biome (`bun run format`).
- Server components by default; use `'use client'` only where needed. Lazy-load WebGL and three.js.
- Respect `prefers-reduced-motion`, keep everything keyboard-accessible, and check contrast in both
  themes.
- Colours come from the tokens in `src/app/global.css`, never hard-coded hex values in components.
- Components adapted from [21st.dev](https://21st.dev) or elsewhere keep a comment crediting the
  author and source.
- Never commit real personal data. That includes app screenshots with student IDs, names or
  balances, and any credentials or tokens.

## Marketplace changes

The scanner (`src/lib/marketplace/`) mirrors the plugin-language schema in
[pku-harness-plugins](https://github.com/pkuinfo/pku-harness-plugins/tree/main/packages/sdk/src/lang).
When that schema changes, update `lang-schema.ts` and the tests together.

`data/sources.json` is edited by the submission bot. Edit it by hand only to fix a listing.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org): `feat(marketplace): …`,
`fix(docs): …`, `docs: …`, `ci: …`. Keep commits small and focused.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
