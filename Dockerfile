# INKWAVE self-hosted image (upstream: https://github.com/jaydendavisnc/inkwave, fork build).
# One container serves the whole game: the static web build on :8490 and the LAN room relay
# (the Cloudflare Worker relay run locally via wrangler dev, one Durable Object per room)
# on :8787. A page opened from a LAN address auto-connects to ws://<host>:8787 — see
# src/net/transport.js. There is no build step; songs/manifest.json is generated at image build.
FROM node:22-slim

ENV NODE_ENV=production \
    CI=true \
    WRANGLER_SEND_METRICS=false

WORKDIR /app

# The relay runtime only needs wrangler (it bundles workerd for this platform); the game itself
# has no npm dependencies. Installing globally keeps the game tree pristine and the image small.
RUN npm install --global --no-audit --no-fund wrangler@^4.141.0

COPY . .

# songs/manifest.json drives the file-backed music player (see src/audio/music.js); ffmpeg is
# absent here, which the script handles by skipping loudness normalisation.
RUN node build/music-manifest.mjs

EXPOSE 8490 8787

CMD ["bash", "/app/tools/docker/start.sh"]
