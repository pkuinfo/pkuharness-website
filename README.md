<div align="center">

<img src="public/icon.png" width="88" alt="PKU Harness logo" />

# PKU Harness website

The official website of [PKU Harness](https://github.com/pkuinfo/pku-harness), the open-source,
AI-native app for campus life at Peking University: download page, developer documentation, and the
plugin marketplace.

[![CI](https://github.com/pkuinfo/pkuharness-website/actions/workflows/ci.yml/badge.svg)](https://github.com/pkuinfo/pkuharness-website/actions/workflows/ci.yml)
[![Docker image](https://github.com/pkuinfo/pkuharness-website/actions/workflows/docker.yml/badge.svg)](https://github.com/pkuinfo/pkuharness-website/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-8B0012.svg)](LICENSE)

**[harness.novadiffusion.com](https://harness.novadiffusion.com)** ·
[Docs](https://harness.novadiffusion.com/docs) ·
[Marketplace](https://harness.novadiffusion.com/marketplace) ·
[Download](https://harness.novadiffusion.com/download)

</div>

## What's here

|                          |                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing and download** | The project showcase (WebGL aurora, three.js plugin constellation, motion) and a download page that reads the latest APK, size, SHA-256 and release notes from [GitHub Releases](https://github.com/pkuinfo/pku-harness/releases).                                                                              |
| **Developer docs**       | How the harness works and how to build plugins: concepts, the `PLUGIN.md` plugin language, remote (MCP) plugins, the SDK, PKU Harness Cloud with an OpenAPI reference. Written for people **and** AI agents.                                                                                                    |
| **Plugin marketplace**   | Indexes GitHub repos the way [skills.sh](https://skills.sh) indexes skills: one repo can hold many plugins, each found by its `PLUGIN.md`. Every plugin page shows exactly what it may access, plus an install link, deep link and QR code. Anyone can submit a repo; a bot checks it and opens a pull request. |

### Docs for AI agents

Every docs page is also served as Markdown, so coding agents can read the docs directly:

| URL                                                                                                                                                          | Content                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| [`/llms.txt`](https://harness.novadiffusion.com/llms.txt)                                                                                                    | Index of all pages                      |
| [`/llms-full.txt`](https://harness.novadiffusion.com/llms-full.txt)                                                                                          | All docs in one file                    |
| `/docs/<page>.md`, or `Accept: text/markdown`                                                                                                                | One page                                |
| [`/marketplace.json`](https://harness.novadiffusion.com/marketplace.json), [`/marketplace/llms.txt`](https://harness.novadiffusion.com/marketplace/llms.txt) | The marketplace index                   |
| [`/schema/plugin-manifest.v1.json`](https://harness.novadiffusion.com/schema/plugin-manifest.v1.json)                                                        | JSON Schema for remote-plugin manifests |

## Tech stack

[Next.js 16](https://nextjs.org) (App Router, Turbopack) · [Fumadocs 16](https://fumadocs.dev) ·
Tailwind CSS 4 · [Motion](https://motion.dev) · three.js / React Three Fiber · zod · Biome ·
[bun](https://bun.sh). Several landing components are adapted from [21st.dev](https://21st.dev); each
file credits its author.

## Getting started

Requirements: [bun](https://bun.sh) 1.4 or newer. This repo uses bun only (no npm, pnpm or yarn).

```bash
git clone https://github.com/pkuinfo/pkuharness-website
cd pkuharness-website
bun install
bun run dev        # http://localhost:3000
```

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `bun run dev`                           | Development server                                          |
| `bun run build` / `bun run start`       | Production build and server                                 |
| `bun run check`                         | Everything CI checks: Biome lint/format, types, unit tests  |
| `bun run format`                        | Format with Biome                                           |
| `bun run openapi`                       | Regenerate the Cloud API pages from `openapi/cloud-v1.yaml` |
| `bun run marketplace scan <owner/repo>` | Scan a GitHub repo for plugins, as the submit page does     |

> [!TIP]
> `next dev` can use several GB of RAM on machines with many cores. If memory is tight, cap it, e.g.
> `systemd-run --user --scope -p MemoryMax=4G bun run dev`.

Optional environment variables (`.env.local`):

| Variable                | Use                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | Canonical URL for OG images, `llms.txt` and schema ids. Defaults to `http://localhost:3000`                                                   |
| `GITHUB_TOKEN`          | Raises GitHub API rate limits for releases and marketplace scans. Read-only; no scopes needed                                                 |
| `GITHUB_WEBHOOK_SECRET` | Secret of the `release` webhook on pkuinfo/pku-harness (`/api/github-webhook`). Refreshes the download page as soon as a release is published |

## Project structure

```
content/docs/          Documentation (MDX). marketplace/ holds the manifest spec and submit flow
openapi/               OpenAPI 3.1 spec of the PKU Harness Cloud wire protocol
data/sources.json      Community repos indexed by the marketplace (edited by the submission bot)
scripts/marketplace.ts Marketplace CLI: scan, add, check (used by CI)
src/app/(home)/        Landing, download and marketplace routes
src/app/docs/          Docs routes; llms*/ serve Markdown for agents
src/components/        landing/, marketplace/, ui/ (adapted 21st.dev components), brand/
src/lib/marketplace/   Repo scanner, PLUGIN.md and JSON manifest schemas, index builder
deploy/                Production: Docker Compose, Caddy, deploy script (see deploy/README.md)
```

## Listing a plugin

You don't need to edit this repo. Open
[harness.novadiffusion.com/marketplace/submit](https://harness.novadiffusion.com/marketplace/submit),
paste your GitHub repo and follow the checks. See [Publishing](https://harness.novadiffusion.com/docs/marketplace/publishing).

## Deployment

`main` is built into `ghcr.io/pkuinfo/pkuharness-website` by GitHub Actions and served by Docker behind
Caddy. Details, first-time setup and rollback are in [deploy/README.md](deploy/README.md).

## Contributing

Contributions are welcome: docs fixes, new guides, UI polish, marketplace features. Read
[CONTRIBUTING.md](CONTRIBUTING.md) first. By participating you agree to the
[Code of Conduct](CODE_OF_CONDUCT.md). To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Related repositories

| Repo                                                                          |                                                           |
| ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| [pkuinfo/pku-harness](https://github.com/pkuinfo/pku-harness)                 | The app (Expo / React Native, Android first)              |
| [pkuinfo/pku-harness-plugins](https://github.com/pkuinfo/pku-harness-plugins) | SDK, official plugins, marketplace registry               |
| [pkuinfo/pkucli](https://github.com/pkuinfo/pkucli)                           | Reference implementations of PKU service protocols (Rust) |

## License

[MIT](LICENSE). PKU Harness is a student community project and is not an official product of Peking
University. The name and emblem of Peking University belong to the university.
