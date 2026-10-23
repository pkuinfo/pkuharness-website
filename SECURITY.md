# Security Policy

## Reporting a vulnerability

**Please don't open a public issue.** Report privately through GitHub:
[Security → Report a vulnerability](https://github.com/pkuinfo/pkuharness-website/security/advisories/new).

Issues in the app itself belong in [pku-harness](https://github.com/pkuinfo/pku-harness/security/advisories/new).
Issues in plugins or the SDK belong in [pku-harness-plugins](https://github.com/pkuinfo/pku-harness-plugins/security/advisories/new).

Include the affected URL or file, steps to reproduce, the commit if you know it, and your view of the
impact. **Never include real credentials, tokens or personal data.** Use test values or redact them.

We aim to acknowledge reports within 7 days. With your permission, we'll credit you once the fix ships.

## Scope

In scope:
- **Marketplace integrity.** Getting a plugin listed, or marked official or verified, when it
  shouldn't be. Making a plugin page misstate what the plugin may access (campus services, hosts,
  abilities, effects). Spoofing install links or deep links.
- **The submission pipeline.** Script injection through issue bodies, abuse of the submission
  workflow's token, or ways to make the bot open pull requests it shouldn't.
- **The scan API** (`/api/marketplace/scan`). Server-side request forgery, bypassing its github.com
  restriction or rate limits, and resource exhaustion.
- **The download page.** Anything that could serve the wrong APK, hash or QR code.
- **OTA paths on this domain** (`/updates/*`). Note that update signatures are verified by the app, so
  report signing issues to pku-harness.
- **Web vulnerabilities on the site:** XSS (for example through rendered plugin instructions or
  release notes), open redirects, and the like.

Out of scope:
- Vulnerabilities in PKU's own services. Please contact the university.
- Denial of service through traffic volume, or reports from automated scanners without a working
  proof of concept.
- Missing security headers without a concrete impact.
