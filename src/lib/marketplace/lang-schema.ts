import { z } from 'zod';
import { capability, cloudService, pluginId, registryCloud } from './schema';

/*
 * PLUGIN.md frontmatter, plugin language spec v1 (pku-harness docs/PLUGIN-LANGUAGE.md §4).
 *
 * Mirror of `manifestSchema` in pkuinfo/pku-harness-plugins `packages/sdk/src/lang/schema.ts`.
 * Keep this file self-contained (zod only) so it can be replaced by, or diffed against, the SDK's
 * schema when that lands. The scanner only relies on the exported names below.
 */

export const LANG_SPEC = 1;
export const PLUGIN_MD = 'PLUGIN.md';
/** §3: total size of the files the app loads. */
export const MAX_PLUGIN_BYTES = 512 * 1024;

export const toolEffect = z.enum(['read', 'write', 'money', 'public']);
export const permissionMode = z.enum(['auto', 'ask', 'off']);

/** Known campus services (§4). The list is open-ended; unknown names are a warning, not an error. */
export const KNOWN_CAMPUS = [
  'card',
  'its',
  'treehole',
  'blackboard',
  'elective',
  'cwfw',
  'cwpay',
  'bdkj',
  'library',
  'library-space',
  'portal',
] as const;

/**
 * Host abilities (§7) and the minimum effect of a tool that uses them. Exactly `abilitySchema` in
 * pku-harness-plugins packages/sdk/src/lang/schema.ts; the app refuses any other name.
 */
export const ABILITIES: Record<
  string,
  { effect: z.infer<typeof toolEffect>; capability?: z.infer<typeof capability> }
> = {
  verify: { effect: 'read' },
  otp: { effect: 'read' },
  todos: { effect: 'write' },
  timetable: { effect: 'write' },
  scheduler: { effect: 'write', capability: 'background' },
  browser: { effect: 'read' },
  campusPage: { effect: 'read' },
  sms: { effect: 'read' },
  files: { effect: 'read' },
  crypto: { effect: 'read' },
  /** `cloud.call { fn, input }`: this plugin's server functions (needs a `cloud` or `server` block). */
  cloud: { effect: 'read' },
};

const campusName = z.string().regex(/^[a-z][a-z0-9-]{1,30}$/, 'lowercase letters, digits and dashes');
const viewName = z.string().regex(/^[a-zA-Z][\w-]{0,39}$/);
const duration = z.union([
  z.number().nonnegative(),
  z.string().regex(/^\d+(\.\d+)?\s*(ms|s|m|h|d)$/, 'like 30s, 5m, 1h or 1d'),
]);
/**
 * Paths are plain strings here (the SDK refines them); the scanner checks them itself so it can
 * say which file is wrong and whether it exists in the repo.
 */
const relPath = z.string().min(1).max(300);
export const toolName = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/, 'letters, digits and _, starting with a letter');

/** A tool (inline in the frontmatter or in tools/<name>.yaml), §5. Steps are not checked here. */
export const langTool = z.strictObject({
  title: z.string().min(1).max(60),
  /** Short line for people (install review, marketplace); `description` is for the model. */
  summary: z.string().min(1).max(80).optional(),
  description: z.string().min(4).max(2000),
  effect: toolEffect,
  untrusted: z.boolean().optional(),
  userOnly: z.boolean().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  constants: z.record(z.string(), z.unknown()).optional(),
  functions: z.record(z.string(), z.string()).optional(),
  steps: z.array(z.record(z.string(), z.unknown())).max(100).optional(),
  return: z.unknown().optional(),
});

/**
 * Strict like the SDK's: the app refuses unknown top-level keys. Deliberate differences: `requires`
 * also accepts shell/filesystem (warned), `abilities` and `campus` are open (unknown → warning),
 * and `cloud` is checked against the registry's disclosure schema.
 */
export const langManifest = z.strictObject({
  spec: z.literal(LANG_SPEC),
  id: pluginId,
  name: z.string().min(1).max(40),
  description: z.string().min(4).max(200),
  version: z.string().regex(/^\d+\.\d+\.\d+([-+][\w.]+)?$/, 'semver, like 1.0.0'),
  author: z.string().min(1).max(80),
  icon: z.string().max(40).optional(),
  homepage: z.string().url().optional(),
  minApp: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),
  requires: z.array(capability).default([]),
  campus: z.array(campusName).default([]),
  network: z.array(z.string()).default([]),
  abilities: z.array(z.string()).default([]),
  /** A YAML file of `constants` and `functions` every tool sees (a tool's own definitions win). */
  shared: relPath.optional(),
  tools: z.record(toolName, z.union([relPath, langTool])).default({}),
  dataSources: z
    .record(
      z.string(),
      z.strictObject({
        title: z.string().optional(),
        tool: toolName,
        args: z.record(z.string(), z.unknown()).optional(),
        ttl: duration,
      }),
    )
    .default({}),
  widgets: z.record(viewName, relPath).default({}),
  screens: z.record(viewName, relPath).default({}),
  settings: z
    .array(
      z.strictObject({
        screen: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .default([]),
  commands: z
    .record(
      z.string().regex(/^[a-z][a-z0-9-]*$/),
      z.strictObject({
        description: z.string().min(1).max(80),
        prompt: z.string().min(1).max(2000),
        aliases: z.array(z.string()).optional(),
        argHint: z.string().optional(),
      }),
    )
    .default({}),
  defaultModes: z
    .object({ read: permissionMode, write: permissionMode, money: permissionMode, public: permissionMode })
    .partial()
    .optional(),
  /**
   * As in the registry, but `uses` and `e2e` may be left out: the SDK derives them for a plugin
   * with `server:` (uses + functions, e2e false), which then only needs the disclosure.
   */
  cloud: registryCloud.extend({ uses: z.array(cloudService).default([]), e2e: z.boolean().default(false) }).optional(),
  i18n: z
    .object({ en: z.looseObject({ name: z.string().optional(), description: z.string().optional() }).optional() })
    .optional(),
  remote: z.strictObject({ mcp: z.string().url(), auth: z.enum(['none', 'bearer']).optional() }).optional(),
  /** Server functions run by PKU Harness Cloud (CLOUD-FUNCTIONS.md); not checked here. */
  server: z.record(z.string(), z.unknown()).optional(),
});

export type LangManifest = z.infer<typeof langManifest>;
export type LangTool = z.infer<typeof langTool>;
export const LANG_KEYS = new Set(Object.keys(langManifest.shape));
