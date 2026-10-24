#!/usr/bin/env sh
# Poster frames for the showcase recordings: the first frame of every public/showcase/*.mp4 as
# <name>.poster.webp next to it (same size as the video). The home page picks them up
# automatically (src/components/landing/showcase/media.ts). Re-run after replacing a recording:
#   sh scripts/showcase-posters.sh
set -eu
cd "$(dirname "$0")/../public/showcase"
for v in *.mp4; do
  [ -e "$v" ] || continue
  out="${v%.mp4}.poster.webp"
  ffmpeg -loglevel error -y -i "$v" -frames:v 1 -c:v libwebp -quality 80 "$out"
  echo "$out"
done
