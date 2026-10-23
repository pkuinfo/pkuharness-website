import { manifestJsonSchema } from '@/lib/marketplace/schema';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

/** JSON Schema for `pku-harness.plugin.json`; reference it with "$schema" for editor validation. */
export function GET() {
  return Response.json(manifestJsonSchema(siteUrl), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/schema+json; charset=utf-8' },
  });
}
