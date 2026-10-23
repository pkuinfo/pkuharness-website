/**
 * Shared marketplace contract. Owned by the marketplace module; the landing page and docs only
 * read these types. Spec: content/docs/marketplace/manifest.mdx.
 */

export type Capability =
  | 'network'
  | 'campus-network'
  | 'campus-session'
  | 'notifications'
  | 'background'
  | 'shell'
  | 'filesystem'
  | 'cloud'
  | 'ongoing';

/** builtin: ships in the app; remote: an MCP server; declarative: a PLUGIN.md the app interprets. */
export type PluginKind = 'builtin' | 'remote' | 'declarative';

export type ToolEffect = 'read' | 'write' | 'money' | 'public';

/** A tool declared in a PLUGIN.md (effect known when inline or when its file was read). */
export interface MarketplaceTool {
  name: string;
  title?: string;
  effect?: ToolEffect;
  /** File the tool lives in, relative to the plugin folder (absent = inline). */
  path?: string;
  userOnly?: boolean;
}

/** One plugin as the marketplace shows it (official registry entry or scanned community manifest). */
export interface MarketplacePlugin {
  /** Globally unique install handle: `owner/repo/id` (official built-ins: `pkuinfo/pku-harness-plugins/<id>`). */
  slug: string;
  id: string;
  name: string;
  /** English name/description when the manifest provides one. */
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  author: string;
  kind: PluginKind;
  /** GitHub URL of the plugin folder. */
  source: string;
  /** owner/repo the plugin was found in. */
  repo: string;
  /** Path of the plugin folder inside the repo ('' = repo root). */
  path: string;
  endpoint?: string | null;
  auth: 'none' | 'bearer';
  icon?: string;
  requires: Capability[];
  scopes: string[];
  tags: string[];
  cloud?: {
    uses: ('store' | 'channels' | 'push' | 'files' | 'functions')[];
    e2e: boolean;
    disclosure: { zh: string[]; en?: string[] };
  };
  verified: boolean;
  official: boolean;
  version?: string;
  license?: string;
  homepage?: string;
  /** Repo stars at index time (community repos), for sorting. */
  stars?: number;
  updatedAt?: string;
  /** Community: the date the repo was added to data/sources.json (YYYY-MM-DD). */
  addedAt?: string;
  /** Manifest file the plugin was read from, relative to the repo root. */
  manifestPath?: string;
  /** Non-blocking review notes from the scanner (shown as "checks" on the detail page). */
  warnings?: string[];

  /* ---- PLUGIN.md (plugin language, spec v1) ---- */
  /** Which manifest the plugin was read from. Official registry entries have none unless merged. */
  format?: 'plugin-md' | 'json';
  /** Display handle `owner/repo/path` (the plugin language's handle; `slug` stays owner/repo/id for URLs). */
  handle?: string;
  /** Campus services it calls with the user's session (`card`, `treehole`, …). */
  campus?: string[];
  /** Public hosts it calls (same as `scopes` for PLUGIN.md plugins). */
  network?: string[];
  /** Host abilities it uses (`todos`, `browser`, `notify`, …). */
  abilities?: string[];
  tools?: MarketplaceTool[];
  widgets?: string[];
  screens?: string[];
  commands?: { name: string; description: string }[];
  defaultModes?: Partial<Record<ToolEffect, 'auto' | 'ask' | 'off'>>;
  /** Install link the app accepts (GitHub folder URL on the default branch). */
  installUrl?: string;
  /** `pkuharness://plugin?src=<installUrl>` */
  deepLink?: string;
  /** Markdown body of PLUGIN.md (agent instructions), capped. */
  instructions?: string;
  /** Raw PLUGIN.md frontmatter (YAML), capped, for display. */
  manifestSource?: string;
}

export interface MarketplaceSource {
  repo: string;
  addedAt: string;
  plugins: number;
  error?: string;
  stars?: number;
  /** Default branch the index was built from. */
  branch?: string;
  description?: string | null;
}

export interface MarketplaceIndex {
  version: 1;
  generatedAt: string;
  plugins: MarketplacePlugin[];
  sources: MarketplaceSource[];
}
