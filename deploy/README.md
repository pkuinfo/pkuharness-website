# Deployment

Production runs at **https://harness.novadiffusion.com** on a small VPS (2 vCPU, 4 GB RAM, Hong Kong).

```
Cloudflare (proxy) ──► Caddy :443 (TLS, compression)
                         ├─ /updates/*  static OTA files (pkuinfo/pku-harness server/updates)
                         └─ everything else ─► 127.0.0.1:3100 ─► Docker: pkuharness-website (Next.js standalone)
```

The container is stateless: docs and pages are baked into the image, and marketplace and release
data are fetched from GitHub and cached in memory for about an hour. Nothing on the server needs a
backup.

## How a change reaches production

1. Push to `main`. **CI** runs `bun run check` and `bun run build`.
2. **Docker image** builds the `Dockerfile` and pushes `ghcr.io/pkuinfo/pkuharness-website` with the
   tags `latest` and `<commit sha>`. It then deletes older versions, so the registry keeps only the
   newest image. The package is public: no credentials, free storage and transfer.
3. Deploy: `deploy/deploy.sh` (needs SSH access as `rainyun`, or pass another host). It pulls `latest`,
   recreates the container and prunes the old image.

```bash
./deploy/deploy.sh            # host alias "rainyun"
./deploy/deploy.sh user@host
```

## Files

| File                  | Where it goes                            | What                                                                                                                                                |
| --------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compose.yml`         | `/opt/pkuharness-website/compose.yml`    | The service: `127.0.0.1:3100`, `restart: unless-stopped`, 1 GB memory limit, rotated logs                                                           |
| `.env` (not in git)   | `/opt/pkuharness-website/.env`, mode 600 | `NEXT_PUBLIC_SITE_URL=https://harness.novadiffusion.com`, `GITHUB_WEBHOOK_SECRET` (release webhook), optional `GITHUB_TOKEN` (read-only, no scopes) |
| `Caddyfile`           | site block in `/etc/caddy/Caddyfile`     | Reverse proxy. Production also imports the OTA snippet; see below                                                                                   |
| `deploy.sh`           | run locally                              | Pull and restart over SSH                                                                                                                           |
| `Dockerfile.prebuilt` |                                          | Fallback image from a local `bun run build` (see below)                                                                                             |

The production site block, with OTA updates served by Caddy itself:

```caddyfile
harness.novadiffusion.com {
	encode zstd gzip
	import /etc/caddy/pkuharness-updates.caddy
	handle {
		reverse_proxy 127.0.0.1:3100
	}
}
```

## First-time setup on a new server

```bash
# as root, with Docker, the compose plugin and Caddy installed
mkdir -p /opt/pkuharness-website && cd /opt/pkuharness-website
# copy deploy/compose.yml here and create .env (see above), then:
docker compose up -d
# add the site block to /etc/caddy/Caddyfile, then:
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

DNS: an `A` record for the domain pointing at the server. If you use Cloudflare's proxy, set SSL
mode to **Full** and don't add Transform rules for `/updates/*`: update files must reach phones
byte-for-byte.

The OTA part (`/srv/pkuharness-updates`, the upload account, the Caddy snippet) is set up from the
app repo: see [pku-harness `docs/OTA.md`](https://github.com/pkuinfo/pku-harness/blob/master/docs/OTA.md).

## Rollback

The registry keeps only the newest image. To go back, run **Actions → Docker image → Run workflow**
on the commit you want, then `./deploy/deploy.sh`.

## If GitHub's registry is unavailable

Build locally and stream the image over SSH:

```bash
NEXT_PUBLIC_SITE_URL=https://harness.novadiffusion.com bun run build
docker build -f deploy/Dockerfile.prebuilt -t ghcr.io/pkuinfo/pkuharness-website:latest .
docker save ghcr.io/pkuinfo/pkuharness-website:latest | gzip -1 | ssh rainyun 'gunzip | docker load'
ssh rainyun 'cd /opt/pkuharness-website && docker compose up -d --pull never'
```

A production build needs several GB of RAM, so don't build on the 4 GB server.
