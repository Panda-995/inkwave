#!/usr/bin/env bash
# INKWAVE container entrypoint: the static game on :8490 plus the LAN relay (wrangler dev with one
# Durable Object per room) on :8787. A page served from a LAN IP looks for the relay on this host at
# ws://<host>:8787 automatically, so the two ports are the whole contract. If either process dies the
# container exits and Docker's restart policy brings both back.
set -u

node /app/tools/docker/serve.mjs & serve_pid=$!
cd /app/server
# RELAY_EXTRA_ORIGIN (comma list) → wrangler --var so the relay's Origin whitelist accepts reverse-
# proxied page origins (Lucky/nginx expose page and relay on different origins by default)
wrangler dev --ip 0.0.0.0 --port 8787 ${RELAY_EXTRA_ORIGIN:+--var RELAY_EXTRA_ORIGIN:"$RELAY_EXTRA_ORIGIN"} & relay_pid=$!

term() { kill "$serve_pid" "$relay_pid" 2>/dev/null; wait; exit 0; }
trap term TERM INT

wait -n "$serve_pid" "$relay_pid"
echo "[inkwave] a background process exited — stopping container" >&2
exit 1
