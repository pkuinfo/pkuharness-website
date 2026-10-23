import { createOpenAPI } from 'fumadocs-openapi/server';

/** Schema id → file. The id is what generated pages reference (`<APIPage document="cloud-v1" />`). */
export const openapi = createOpenAPI({
  input: { 'cloud-v1': './openapi/cloud-v1.yaml' },
});

type Json = Record<string, unknown>;
type Operation = { path: string; method: string };

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);

/** `#/components/schemas/Foo` → `Foo`. */
const refName = (ref: string) => ref.split('/').at(-1) ?? ref;

/** Compact TypeScript-like rendering of a JSON Schema, with `$ref`s kept as names. */
function typeOf(schema: unknown, depth = 0): string {
  if (!isObject(schema)) return 'unknown';
  if (typeof schema.$ref === 'string') return refName(schema.$ref);
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (Array.isArray(schema.enum)) return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  for (const key of ['oneOf', 'anyOf'] as const) {
    const list = schema[key];
    if (Array.isArray(list)) return list.map((s) => typeOf(s, depth)).join(' | ');
  }
  if (schema.type === 'array') return `${typeOf(schema.items, depth)}[]`;
  if (schema.type === 'object' || isObject(schema.properties)) {
    const props = isObject(schema.properties) ? schema.properties : {};
    const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
    const pad = '  '.repeat(depth + 1);
    const lines = Object.entries(props).map(([k, v]) => {
      const note = constraints(v);
      return `${pad}${k}${required.has(k) ? '' : '?'}: ${typeOf(v, depth + 1)};${note ? ` // ${note}` : ''}`;
    });
    return lines.length ? `{\n${lines.join('\n')}\n${'  '.repeat(depth)}}` : 'Record<string, unknown>';
  }
  if (schema.type === 'integer') return 'number';
  if (typeof schema.type === 'string') return schema.type;
  return 'unknown';
}

/** Constraints worth telling a reader (pattern, bounds, default). */
function constraints(schema: unknown): string {
  if (!isObject(schema)) return '';
  const out: string[] = [];
  if (typeof schema.pattern === 'string') out.push(`pattern \`${schema.pattern}\``);
  for (const k of ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems'])
    if (schema[k] !== undefined) out.push(`${k} ${schema[k]}`);
  if (schema.default !== undefined) out.push(`default ${JSON.stringify(schema.default)}`);
  return out.join(', ');
}

function collectRefs(schema: unknown, into: Set<string>) {
  if (Array.isArray(schema)) {
    for (const s of schema) collectRefs(s, into);
    return;
  }
  if (!isObject(schema)) return;
  if (typeof schema.$ref === 'string') into.add(refName(schema.$ref));
  for (const v of Object.values(schema)) collectRefs(v, into);
}

/**
 * Markdown for one generated API page (for `/llms.txt`, `/docs/<page>.md`): the `<APIPage />`
 * element is interactive UI, so an agent gets the operations rendered as text instead, with every
 * schema they use.
 */
export async function renderOpenAPIMarkdown(documentId: string, operations: Operation[]): Promise<string> {
  const { bundled } = await openapi.getSchema(documentId);
  const doc = bundled as unknown as Json;
  const paths = (doc.paths ?? {}) as Record<string, Json>;
  const schemas = ((doc.components as Json | undefined)?.schemas ?? {}) as Record<string, unknown>;
  const parametersById = ((doc.components as Json | undefined)?.parameters ?? {}) as Record<string, Json>;
  const servers = (doc.servers as { url: string }[] | undefined)?.map((s) => s.url) ?? [];
  const refs = new Set<string>();
  const sharedResponses = new Set<string>();
  const parts: string[] = [];
  if (servers.length) parts.push(`Base URL: ${servers.map((s) => `\`${s}\``).join(' or ')}`);

  for (const { path, method } of operations) {
    const item = paths[path];
    const op = item?.[method] as Json | undefined;
    if (!item || !op) continue;
    const lines: string[] = [`## ${method.toUpperCase()} ${path}`, ''];
    if (op.summary) lines.push(`**${op.summary}**${op.operationId ? ` (\`${op.operationId}\`)` : ''}`, '');
    if (typeof op.description === 'string') {
      lines.push(op.description.trim(), '');
      // Schemas named in the prose (WebSocket frames) are listed below too.
      for (const m of op.description.matchAll(/`([A-Z][A-Za-z0-9]+)`/g)) if (schemas[m[1]]) refs.add(m[1]);
    }

    const security = (op.security ?? doc.security) as Record<string, string[]>[] | undefined;
    const schemes = security?.flatMap((s) => Object.keys(s)) ?? [];
    lines.push(`Auth: ${schemes.length ? schemes.map((s) => `\`${s}\``).join(', ') : 'none'}`, '');

    const params = [
      ...((item.parameters as Json[] | undefined) ?? []),
      ...((op.parameters as Json[] | undefined) ?? []),
    ].map((p) => (typeof p.$ref === 'string' ? parametersById[refName(p.$ref)] : p));
    if (params.length) {
      lines.push('| Parameter | In | Type | Required | Notes |', '| --- | --- | --- | --- | --- |');
      for (const p of params) {
        if (!p) continue;
        collectRefs(p.schema, refs);
        const note = [p.description, constraints(p.schema)].filter(Boolean).join(' ').replaceAll('|', '\\|');
        lines.push(
          `| \`${p.name}\` | ${p.in} | \`${typeOf(p.schema).replaceAll('|', '\\|')}\` | ${p.required ? 'yes' : 'no'} | ${note} |`,
        );
      }
      lines.push('');
    }

    const body = ((op.requestBody as Json | undefined)?.content ?? {}) as Record<string, { schema?: unknown }>;
    for (const [type, media] of Object.entries(body)) {
      collectRefs(media.schema, refs);
      lines.push(`Request body (\`${type}\`): \`${typeOf(media.schema)}\``, '');
    }

    const responses = (op.responses ?? {}) as Record<string, Json>;
    for (const [status, res] of Object.entries(responses)) {
      if (typeof res.$ref === 'string') {
        sharedResponses.add(refName(res.$ref));
        lines.push(`- **${status}**: see [${refName(res.$ref)}](#response-${refName(res.$ref).toLowerCase()}) below`);
        continue;
      }
      const content = (res.content ?? {}) as Record<string, { schema?: unknown }>;
      const types = Object.entries(content).map(([type, media]) => {
        collectRefs(media.schema, refs);
        return `\`${type}\` \`${typeOf(media.schema)}\``;
      });
      const description = typeof res.description === 'string' ? res.description.replace(/\s+/g, ' ').trim() : '';
      lines.push(`- **${status}**: ${description}${types.length ? ` → ${types.join(', ')}` : ''}`);
    }
    parts.push(lines.join('\n'));
  }

  // Responses shared through `$ref` (the error body), described once.
  const responseDefs = ((doc.components as Json | undefined)?.responses ?? {}) as Record<string, Json>;
  for (const name of sharedResponses) {
    const res = responseDefs[name];
    if (!res) continue;
    const content = (res.content ?? {}) as Record<string, { schema?: unknown }>;
    const types = Object.entries(content).map(([type, media]) => {
      collectRefs(media.schema, refs);
      return `\`${type}\` \`${typeOf(media.schema)}\``;
    });
    const description = typeof res.description === 'string' ? res.description.trim() : '';
    parts.push(`## Response: ${name}\n\n${description}${types.length ? `\n\nBody: ${types.join(', ')}` : ''}`);
  }

  // Schemas used by these operations, and the schemas those use.
  const seen = new Set<string>();
  const queue = [...refs];
  while (queue.length) {
    const name = queue.shift() as string;
    if (seen.has(name) || !schemas[name]) continue;
    seen.add(name);
    const nested = new Set<string>();
    collectRefs(schemas[name], nested);
    queue.push(...nested);
  }
  if (seen.size) {
    const defs = [...seen].sort().map((name) => {
      const s = schemas[name] as Json;
      const notes = [typeof s.description === 'string' ? s.description.trim() : '', constraints(s)]
        .filter(Boolean)
        .join(' ');
      return `### ${name}\n\n${notes ? `${notes}\n\n` : ''}\`\`\`ts\ntype ${name} = ${typeOf(s)};\n\`\`\``;
    });
    parts.push(`## Schemas\n\n${defs.join('\n\n')}`);
  }
  return parts.join('\n\n');
}

/**
 * Read `<OpenAPIPage document="…" operations={[…]} />` from the raw source of a page generated by
 * `bun run openapi` (the processed Markdown drops it: it sits inside an ESM `export`).
 */
export function parseAPIPageElement(source: string): { document: string; operations: Operation[] } | undefined {
  const element = /<(?:OpenAPIPage|APIPage)\b[^>]*\/>/.exec(source)?.[0];
  if (!element) return undefined;
  const doc = /\bdocument=\{?"([^"]+)"\}?/.exec(element)?.[1];
  const ops = /\boperations=\{(\[.*?\])\}/.exec(element)?.[1];
  if (!doc || !ops) return undefined;
  try {
    return { document: doc, operations: JSON.parse(ops) as Operation[] };
  } catch {
    return undefined;
  }
}
