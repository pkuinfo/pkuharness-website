# pkuharness-website

The official website of [PKU Harness](https://github.com/pkuinfo/pku-harness): download page, developer
documentation and the plugin marketplace.

Built with [Next.js](https://nextjs.org) and [Fumadocs](https://fumadocs.dev). Managed with **bun**.

| Route                                            | What                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `/`                                              | Landing page and project showcase                                               |
| `/download`                                      | Latest app release (read from GitHub Releases of `pkuinfo/pku-harness`)         |
| `/docs`                                          | Developer docs: ecosystem, plugin SDK, marketplace, PKU Harness Cloud (OpenAPI) |
| `/marketplace`                                   | Plugin marketplace: official registry + community repos, submit your own        |
| `/llms.txt`, `/llms-full.txt`, `/docs/<page>.md` | Docs for AI agents (markdown; `Accept: text/markdown` also works)               |

## Develop

```bash
bun install
bun run dev          # http://localhost:3000
bun run build        # production build
bun run lint         # biome
bun run types:check  # next typegen + tsc
```

Optional environment (`.env.local`):

| Variable               | Use                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (OG images, sitemap)                                                           |
| `GITHUB_TOKEN`         | Raises GitHub API limits for releases and marketplace scanning (read-only, no scopes needed) |

## Layout

```
content/docs/        MDX documentation (English; model-facing, kept in sync with the SDK)
openapi/             OpenAPI spec of the PKU Harness Cloud wire protocol
data/sources.json    Community plugin repos indexed by the marketplace
src/app/(home)/      Landing, download, marketplace pages
src/app/docs/        Docs pages
src/lib/marketplace/ Repo scanner, manifest schema, index builder
scripts/             Marketplace CLI (scan / check) used by CI
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). To list a plugin, use the **Submit** page of the marketplace —
you don't need to edit this repo by hand.

## License

MIT
