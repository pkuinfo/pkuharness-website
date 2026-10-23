import { z } from 'zod';

/*
 * Schemas for the marketplace. The registry part mirrors `registry/schema.ts` in
 * pkuinfo/pku-harness-plugins (the source of truth for entry fields); `schema.test.ts` checks the
 * live registry.json still parses with it when a sibling checkout is present. The manifest is
 * the registry entry minus the fields the marketplace derives (`source`, `verified`).
 *
 * Spec: content/docs/marketplace/manifest.mdx. No Next.js imports: the CLI uses this file too.
 */

export const MANIFEST_FILE = 'pku-harness.plugin.json';
export const REPO_CONFIG_FILE = 'pku-harness.json';
export const PACKAGE_KEY = 'pkuHarness';
export const MANIFEST_SCHEMA_PATH = '/schema/plugin-manifest.v1.json';

export const capability = z.enum([
  'network',
  'campus-network',
  'campus-session',
  'notifications',
  'background',
  'shell',
  'filesystem',
  'cloud',
  'ongoing',
]);

export const cloudService = z.enum(['store', 'channels', 'push', 'files', 'functions']);

export const registryCloud = z.object({
  uses: z.array(cloudService).describe('PKU Harness Cloud services the plugin uses.'),
  e2e: z.boolean().describe('Whether everything sent to the cloud is end-to-end encrypted.'),
  disclosure: z
    .object({
      zh: z.array(z.string()).describe('Plain-language lines (Chinese): exactly what leaves the device.'),
      en: z.array(z.string()).optional().describe('English translation, one line per zh line.'),
    })
    .describe('Shown on the consent sheet before install.'),
  backend: z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('provider') }),
      z.object({ kind: z.literal('external'), url: z.string().url() }),
    ])
    .optional(),
});

export const pluginId = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{1,40}$/, 'lowercase letters, digits and dashes, 2-41 chars, not starting with a dash');

export const registryEntry = z.object({
  id: pluginId,
  name: z.string().min(1),
  description: z.string().min(4).max(200),
  author: z.string().min(1),
  source: z.string().url(),
  kind: z.enum(['builtin', 'remote']),
  endpoint: z.string().url().nullable().optional(),
  auth: z.enum(['none', 'bearer']).default('none'),
  icon: z.string().optional(),
  requires: z.array(capability).default([]),
  scopes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  cloud: registryCloud.optional(),
  verified: z.boolean().default(false),
});

export const registry = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  plugins: z.array(registryEntry),
});

export type RegistryEntry = z.infer<typeof registryEntry>;
export type RegistryCloud = z.infer<typeof registryCloud>;

/** Same rules as `cloudIssues` in pku-harness-plugins/registry/schema.ts. */
export function cloudIssues(c: RegistryCloud): string[] {
  const out: string[] = [];
  if (new Set(c.uses).size !== c.uses.length) out.push('cloud.uses has duplicates');
  if (c.uses.length > 0 && c.disclosure.zh.length === 0)
    out.push('cloud.uses is non-empty, so cloud.disclosure.zh must say what leaves the device');
  for (const [lang, lines] of Object.entries(c.disclosure))
    if (lines?.some((l) => !l.trim())) out.push(`cloud.disclosure.${lang} has an empty line`);
  if (c.disclosure.en && c.disclosure.en.length !== c.disclosure.zh.length)
    out.push('cloud.disclosure.en must translate every zh line');
  if (c.backend?.kind === 'external' && !c.backend.url.startsWith('https://'))
    out.push('cloud.backend.url must be https');
  return out;
}

/** Plugin manifest v1: `pku-harness.plugin.json`, or the `pkuHarness` object of a package.json. */
export const manifestV1 = z
  .object({
    $schema: z.string().optional().describe(`Editor validation: https://<site>${MANIFEST_SCHEMA_PATH}`),
    id: pluginId.describe(
      'Unique plugin id. Also the MCP server `name` (the app installs remote plugins as `mcp-<id>`).',
    ),
    name: z.string().min(1).max(40).describe('Display name, Chinese first (e.g. "食堂菜单").'),
    description: z.string().min(4).max(200).describe('One sentence: what it does, for students.'),
    author: z.string().min(1).optional().describe('Defaults to the GitHub repo owner.'),
    kind: z
      .enum(['builtin', 'remote'])
      .default('remote')
      .describe('"remote" (an MCP server). "builtin" is reserved for plugins bundled in the app.'),
    endpoint: z
      .string()
      .url()
      .nullable()
      .optional()
      .describe('Public MCP (Streamable HTTP) endpoint, https. Omit or null when users self-host from source.'),
    auth: z
      .enum(['none', 'bearer'])
      .default('none')
      .describe('"bearer": users paste a token in the app; it stays in their keychain.'),
    icon: z.string().optional().describe('Icon name (app icon set) or an https URL to a square image.'),
    requires: z.array(capability).default([]).describe('What the plugin needs from the device and account.'),
    scopes: z.array(z.string()).default([]).describe('Hosts the plugin talks to, e.g. "dining.pku.edu.cn".'),
    tags: z.array(z.string()).default([]).describe('Search tags, lowercase.'),
    cloud: registryCloud.optional().describe('PKU Harness Cloud use, copied from PluginDef.cloud.'),
    version: z.string().max(40).optional(),
    license: z.string().max(80).optional().describe('SPDX id, e.g. "MIT".'),
    homepage: z.string().url().optional(),
    i18n: z
      .object({
        en: z
          .object({
            name: z.string().min(1).max(60).optional(),
            description: z.string().min(4).max(240).optional(),
          })
          .optional(),
      })
      .optional()
      .describe('Translations of user-facing strings.'),
  })
  .describe('PKU Harness plugin manifest v1');

export type ManifestV1 = z.infer<typeof manifestV1>;
export const MANIFEST_KEYS = new Set(Object.keys(manifestV1.shape));

/** Optional repo-root `pku-harness.json`: restricts and orders discovery in big monorepos. */
export const repoConfig = z.object({
  $schema: z.string().optional(),
  plugins: z
    .array(z.string().min(1).max(300))
    .max(200)
    .describe('Plugin folders, relative to the repo root (e.g. "plugins/canteen"). "." = root.'),
});

/** data/sources.json */
export const sourcesFile = z.object({
  sources: z.array(
    z.object({
      repo: z.string().regex(/^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/, 'owner/repo'),
      addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
      /** Plugin ids in this repo a maintainer has reviewed. */
      verified: z.array(pluginId).optional(),
      /** Optional sub-folder to scan (like a /tree/<branch>/<path> URL). */
      path: z.string().optional(),
    }),
  ),
});

export type SourcesFile = z.infer<typeof sourcesFile>;
export type SourceEntry = SourcesFile['sources'][number];

/** JSON Schema served at /schema/plugin-manifest.v1.json. */
export function manifestJsonSchema(siteUrl: string): Record<string, unknown> {
  const schema = z.toJSONSchema(manifestV1, { io: 'input', target: 'draft-07' }) as Record<string, unknown>;
  return {
    ...schema,
    $id: new URL(MANIFEST_SCHEMA_PATH, siteUrl).toString(),
    title: 'PKU Harness plugin manifest',
    additionalProperties: false,
  };
}
