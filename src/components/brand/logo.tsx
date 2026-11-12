/** Generated from pku-harness/src/theme/brand.ts. See public/brand and docs/BRAND.md. */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  // biome-ignore lint/performance/noImgElement: local vector, no raster optimization required
  return <img src="/brand/icon.svg" width={size} height={size} alt="" aria-hidden="true" className={className} />;
}
