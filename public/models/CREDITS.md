# 3D assets

Files in this folder are used by the home page's 3D phone (`src/components/landing/phone-scene.tsx`).

| File                      | Asset                  | Author           | Source                                  | License |
| ------------------------- | ---------------------- | ---------------- | --------------------------------------- | ------- |
| `studio_small_09_256.hdr` | Studio Small 09 (HDRI) | Sergej Majboroda | https://polyhaven.com/a/studio_small_09 | CC0 1.0 |

`studio_small_09_256.hdr` is the 1k file from Poly Haven, box-filtered down to 256 × 128 and written as
uncompressed Radiance RGBE (131 KB, 87 KB gzipped). It only provides soft reflections, so the small size
is enough.

## The phone

The phone itself is modelled in code from three.js primitives; there is no mesh file. We looked for a
redistributable model of a generic, non-branded modern Android phone with a separate screen mesh (for the
video texture) and did not find a usable one:
- Poly Haven: no phone models.
- Poly Pizza: the CC0 "Smartphone" (182 triangles) and CC-BY 3.0 phones are low-poly, with a single
  material and no separate screen.
- pmndrs market (market.pmnd.rs): offline.
- Sketchfab: downloads need a signed-in account; the best-known free phone models there are Apple
  iPhones, which we avoid for trademark reasons.

If you add a model here, record its title, author, source URL and license in the table above, and credit
CC-BY assets visibly on the site.
