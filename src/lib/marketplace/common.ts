/* Helpers shared by the JSON-manifest scanner and the PLUGIN.md validator. No Next.js imports. */

import type { z } from 'zod';

export const OFFICIAL_REPO = 'pkuinfo/pku-harness-plugins';

export type IssueLevel = 'error' | 'warning' | 'info';
export interface ScanIssue {
  level: IssueLevel;
  message: string;
  /** How to fix it, in one line. */
  hint?: string;
  /** Manifest field the issue is about (dot path). */
  field?: string;
}

export const HOST = /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/i;
export const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|\[?::1\]?$|169\.254\.)|\.(local|localhost|internal|lan)$/i;

export function isOfficialRepo(owner: string, repo: string) {
  return `${owner}/${repo}`.toLowerCase() === OFFICIAL_REPO;
}

export function pluginSlug(owner: string, repo: string, id: string) {
  return `${owner}/${repo}/${id}`.toLowerCase();
}

export function folderUrl(owner: string, repo: string, branch: string, dir: string) {
  return dir ? `https://github.com/${owner}/${repo}/tree/${branch}/${dir}` : `https://github.com/${owner}/${repo}`;
}

export function zodIssues(error: z.ZodError, hints: Record<string, string> = {}): ScanIssue[] {
  return error.issues.map((i) => {
    const field = i.path.join('.');
    const top = String(i.path[0] ?? '');
    return {
      level: 'error' as const,
      field: field || undefined,
      message: field ? `${field}: ${i.message}` : i.message,
      hint: hints[top],
    };
  });
}

/** Problems with an endpoint URL students' phones must reach (https, public host, no secrets). */
export function endpointIssues(endpoint: string, field: string, hint?: string): ScanIssue[] {
  const out: ScanIssue[] = [];
  const u = new URL(endpoint);
  if (u.protocol !== 'https:') out.push({ level: 'error', field, message: `${field} must use https://.`, hint });
  if (PRIVATE_HOST.test(u.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname))
    out.push({
      level: 'error',
      field,
      message: `${field} host "${u.hostname}" is not reachable from students' phones.`,
      hint: 'Use a public domain name with a TLS certificate.',
    });
  if (u.username || u.password || u.search)
    out.push({
      level: 'error',
      field,
      message: `${field} must not embed credentials or query parameters.`,
      hint: 'Use "auth": "bearer"; users paste the token in the app.',
    });
  return out;
}
