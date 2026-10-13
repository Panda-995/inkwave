// INKWAVE online relay (Cloudflare Worker + Durable Object).
//
//   GET /room/<CODE>?name=<name>&create=1&v=<proto>   (WebSocket upgrade) → the Room object for that code
//   GET /health                                          → "ok"
//   POST /auth/register {name,password}                  → {name, token}   (account store, see Store below)
//   POST /auth/login    {name,password}                  → {name, token}
//   GET  /profile            Authorization: Bearer <t>   → {name, updatedAt, data}
//   PUT  /profile            Authorization: Bearer <t>   → {updatedAt}     (data = {settings, profile})
//
// A Room is a dumb, fast fan-out: game payloads are forwarded as raw strings (never parsed here). The room only
// tracks membership (id, name, join order), elects the host (the oldest member), and refuses joins that can't work
// (unknown code, full, match in progress). Wire format, client → room:
//   "b|<payload>"          broadcast to everyone else          "s|<toId>|<payload>"   to one member
//   {"t":"lock","v":bool}  host: refuse new joins while a match runs
//   "ping"                 → "pong" (answered by the runtime without waking the room; also the liveness signal)
//   {"t":"ping","c":n}     → {"t":"pong","c":n}   (older clients)
// room → client:
//   "m|<fromId>|<payload>"                                      relayed game payload
//   {"t":"welcome","id","host","members":[{id,name}]}           {"t":"join","m":{id,name}}
//   {"t":"leave","id","host"}                                   {"t":"err","e":"…"} (then close)
import { DurableObject } from 'cloudflare:workers';

const PROTO = 1, MAX = 8;
// Public relay hygiene: only the game's own site may open rooms (plus local dev), each socket gets a message budget
// (the game sends ~25/s; a runaway or hostile client is cut off before it can eat the account's quota) and a size cap.
// Self-hosted behind a reverse proxy (nginx/Lucky/…): the page's own origin is allowed two ways —
//   • origin host === request Host (same-origin path proxy), or
//   • RELAY_EXTRA_ORIGIN env (wrangler --var; comma list of exact origins) for setups where the relay
//     lives on a DIFFERENT origin than the page (e.g. Lucky exposes the relay on its own external port).
const LAN_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[a-z0-9-]+\.local)(:\d+)?$/;
function ORIGIN_OK(o, req, env) {
  if (/^https:\/\/([a-z0-9-]+\.)?inkwave-aah\.pages\.dev$/.test(o)) return true;
  if (LAN_ORIGIN.test(o)) return true;
  try {
    if (req.headers.get('host') && new URL(o).host === req.headers.get('host')) return true;
  } catch { /* malformed origin */ }
  const extra = String((env && env.RELAY_EXTRA_ORIGIN) || '').split(',').map((s) => s.trim()).filter(Boolean);
  return extra.includes(o);
}
const MSG_MAX = 65536, RATE = 90, BURST_STRIKES = 4;
// A socket whose "ping"s stop is a player whose connection died without closing (Wi-Fi gone, laptop lid shut): drop
// them so their squidkid is handed to a bot instead of standing frozen. Clients ping every 2 s; a hidden tab still
// pings (throttled to ≥ 1/min after five minutes), so the lobby allowance is generous.
const SILENT_MATCH = 20000, SILENT_LOBBY = 150000, SWEEP = 4000;   // a heavy transition on a slow machine can freeze a tab for seconds
const CODE = /^[A-Z0-9]{4,8}$/;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok', { headers: { 'access-control-allow-origin': '*' } });
    // account + cloud-save endpoints live in one global Store object (the game page is served from a
    // different port than the relay, so browsers preflight these with OPTIONS — answered inside the Store)
    if (/^\/(auth|profile)(\/|$)/.test(url.pathname)) return env.STORE.get(env.STORE.idFromName('accounts')).fetch(req);
    const m = url.pathname.match(/^\/room\/([A-Za-z0-9]+)$/);
    if (!m) return new Response('INKWAVE relay', { status: 404 });
    const code = m[1].toUpperCase();
    if (!CODE.test(code)) return new Response('bad code', { status: 400 });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
    if (!ORIGIN_OK(req.headers.get('Origin') || '', req, env)) return new Response('forbidden', { status: 403 });
    return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(req);
  },
};

// ------------------------------------------------------------------------------------------------------------
// Account store: one global Durable Object holding every user record. Cloudflare Workers' own storage API
// persists to disk under `.wrangler/state` in local dev — which is exactly the directory the Docker image
// volume-maps, so accounts and cloud saves survive container rebuilds. Each record:
//   user:<name> → { name, salt, hash, created, tokens:[…], data:{settings,profile}|null, updatedAt }
//   token:<tok> → <name>   (bearer tokens; a few live per user so several devices stay signed in)
// Passwords are PBKDF2-SHA-256 (100k iterations, per-user salt) — WebCrypto is available in the runtime.
const NAME_OK = /^[\p{L}\p{N}_.-]{2,16}$/u, PW_MIN = 4, DATA_MAX = 65536, TOKENS_MAX = 8;
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');

async function pbkdf2(password, saltB64) {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256));
}

const corsHeaders = (req) => {
  // the game serves from :8490 and talks to the relay on :8787 — echo the origin so any LAN host works
  const o = req.headers.get('Origin') || '*';
  return {
    'access-control-allow-origin': o,
    'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400',
  };
};
const json = (req, obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...corsHeaders(req) } });

export class Store extends DurableObject {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
    try {
      if (req.method === 'POST' && url.pathname === '/auth/register') return await this._register(req);
      if (req.method === 'POST' && url.pathname === '/auth/login') return await this._login(req);
      if (url.pathname === '/profile' && req.method === 'GET') return await this._get(req);
      if (url.pathname === '/profile' && req.method === 'PUT') return await this._put(req);
      return json(req, { e: 'not found' }, 404);
    } catch (e) {
      return json(req, { e: '中继存储出错，请重试' }, 500);
    }
  }

  async _register(req) {
    let body; try { body = await req.json(); } catch { return json(req, { e: '请求格式错误' }, 400); }
    const name = String(body.name || '').trim(), pw = String(body.password || '');
    if (!NAME_OK.test(name)) return json(req, { e: '用户名需为 2–16 个字符（汉字、字母、数字、._-）' }, 400);
    if (pw.length < PW_MIN || pw.length > 64) return json(req, { e: `密码至少 ${PW_MIN} 位` }, 400);
    const key = 'user:' + name.toLowerCase();
    if (await this.ctx.storage.get(key)) return json(req, { e: '这个用户名已被注册' }, 409);
    const salt = hex(16), token = hex(24);
    const rec = { name, salt, hash: await pbkdf2(pw, salt), created: Date.now(), tokens: [token], data: null, updatedAt: 0 };
    await this.ctx.storage.put(key, rec);
    await this.ctx.storage.put('token:' + token, name.toLowerCase());
    return json(req, { name, token });
  }

  async _login(req) {
    let body; try { body = await req.json(); } catch { return json(req, { e: '请求格式错误' }, 400); }
    const rec = await this.ctx.storage.get('user:' + String(body.name || '').trim().toLowerCase());
    const hash = rec ? await pbkdf2(String(body.password || ''), rec.salt) : '';
    if (!rec || hash !== rec.hash) return json(req, { e: '用户名或密码不对' }, 401);
    const token = hex(24);
    rec.tokens = [...rec.tokens.slice(-(TOKENS_MAX - 1)), token];
    await this.ctx.storage.put('user:' + rec.name.toLowerCase(), rec);
    await this.ctx.storage.put('token:' + token, rec.name.toLowerCase());
    return json(req, { name: rec.name, token });
  }

  async _user(req) {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token || token.length > 128) return null;
    const name = await this.ctx.storage.get('token:' + token);
    return name ? this.ctx.storage.get('user:' + name) : null;
  }

  async _get(req) {
    const rec = await this._user(req);
    if (!rec) return json(req, { e: '登录状态已失效，请重新登录' }, 401);
    return json(req, { name: rec.name, updatedAt: rec.updatedAt || 0, data: rec.data || null });
  }

  async _put(req) {
    const rec = await this._user(req);
    if (!rec) return json(req, { e: '登录状态已失效，请重新登录' }, 401);
    let body; try { body = await req.json(); } catch { return json(req, { e: '请求格式错误' }, 400); }
    const raw = JSON.stringify(body.data ?? null);
    if (raw.length > DATA_MAX) return json(req, { e: '存档过大' }, 413);
    rec.data = body.data ?? null;
    rec.updatedAt = Date.now();
    await this.ctx.storage.put('user:' + rec.name.toLowerCase(), rec);
    return json(req, { updatedAt: rec.updatedAt });
  }
}

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.locked = false;
    this.seq = 0;
    this.seen = new Map();   // ws → last message time (in memory: a busy room never hibernates; a quiet one has the pings)
    this.rate = new Map();   // ws → { t: window start, n: messages in it, strikes }
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    // hibernation: rebuild the join counter from surviving sockets
    for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.seq >= this.seq) this.seq = a.seq + 1; }
  }

  members() {
    return this.ctx.getWebSockets().map((ws) => ({ ws, a: ws.deserializeAttachment() })).filter((m) => m.a && !m.a.gone).sort((x, y) => x.a.seq - y.a.seq);
  }
  host() { const ms = this.members(); return ms.length ? ms[0].a.id : null; }

  async fetch(req) {
    const url = new URL(req.url);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const fail = (e) => { server.send(JSON.stringify({ t: 'err', e })); server.close(4000, e); return new Response(null, { status: 101, webSocket: client }); };
    const ms = this.members().filter((m) => m.ws !== server);
    const create = url.searchParams.get('create') === '1';
    if (+(url.searchParams.get('v') || 0) !== PROTO) return fail('Please refresh the page — the game was updated');
    if (create && ms.length) return fail('Room code taken');
    if (!create && !ms.length) return fail('Room not found');
    if (ms.length >= MAX) return fail('Room is full');
    if (this.locked && ms.length) return fail('Match in progress');
    if (!ms.length) this.locked = false;
    const name = (url.searchParams.get('name') || 'Player').replace(/[^\p{L}\p{N} ._\-!?']/gu, '').slice(0, 16) || 'Player';
    let id;
    do { id = Math.random().toString(36).slice(2, 6).toUpperCase(); } while (ms.some((m) => m.a.id === id));
    const a = { id, name, seq: this.seq++, at: Date.now() };
    server.serializeAttachment(a);
    const all = [...ms.map((m) => m.a), a];
    server.send(JSON.stringify({ t: 'welcome', id, host: all[0].id, members: all.map(({ id, name }) => ({ id, name })) }));
    const j = JSON.stringify({ t: 'join', m: { id, name } });
    for (const m of ms) try { m.ws.send(j); } catch { /* closing */ }
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + SWEEP);
    return new Response(null, { status: 101, webSocket: client });
  }

  // liveness sweep (only while the room has members)
  async alarm() {
    const now = Date.now(), limit = this.locked ? SILENT_MATCH : SILENT_LOBBY;
    for (const m of this.members()) {
      const seen = Math.max(m.a.at || 0, this.seen.get(m.ws) || 0, this.ctx.getWebSocketAutoResponseTimestamp(m.ws)?.getTime() || 0);
      if (now - seen > limit) { try { m.ws.close(4001, 'Connection timed out'); } catch { /* gone */ } this._gone(m.ws); }
    }
    if (this.members().length) await this.ctx.storage.setAlarm(Date.now() + SWEEP);
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== 'string') return;
    const me = ws.deserializeAttachment();
    if (!me) return;
    const now = Date.now();
    this.seen.set(ws, now);
    if (msg.length > MSG_MAX) return;                                   // oversized: dropped, never fanned out
    let r = this.rate.get(ws);
    if (!r) this.rate.set(ws, (r = { t: now, n: 0, strikes: 0 }));
    if (now - r.t >= 1000) { r.strikes = r.n > RATE ? r.strikes + 1 : Math.max(0, r.strikes - 1); r.t = now; r.n = 0; }
    if (++r.n > RATE * 3 || r.strikes >= BURST_STRIKES) { try { ws.close(4008, 'Too many messages'); } catch { /* gone */ } this._gone(ws); return; }
    const c = msg.charCodeAt(0);
    if (c === 98 /* b */ && msg.charCodeAt(1) === 124) {
      const out = 'm|' + me.id + '|' + msg.slice(2);
      for (const s of this.ctx.getWebSockets()) if (s !== ws) try { s.send(out); } catch { /* closing */ }
      return;
    }
    if (c === 115 /* s */ && msg.charCodeAt(1) === 124) {
      const k = msg.indexOf('|', 2);
      if (k < 0) return;
      const to = msg.slice(2, k), out = 'm|' + me.id + '|' + msg.slice(k + 1);
      for (const s of this.ctx.getWebSockets()) { const a = s.deserializeAttachment(); if (a && a.id === to) { try { s.send(out); } catch { /* closing */ } break; } }
      return;
    }
    if (c === 123 /* { */) {
      let o; try { o = JSON.parse(msg); } catch { return; }
      if (o.t === 'ping') ws.send(JSON.stringify({ t: 'pong', c: o.c }));
      else if (o.t === 'lock' && this.host() === me.id) this.locked = !!o.v;
    }
  }

  async webSocketClose(ws) { this._gone(ws); }
  async webSocketError(ws) { this._gone(ws); }

  _gone(ws) {
    this.seen.delete(ws); this.rate.delete(ws);
    const a = ws.deserializeAttachment();
    if (!a || a.gone) return;
    a.gone = true;
    try { ws.serializeAttachment(a); } catch { /* already closed */ }
    const host = this.host();
    const out = JSON.stringify({ t: 'leave', id: a.id, host });
    for (const m of this.members()) try { m.ws.send(out); } catch { /* closing */ }
    if (!this.members().length) this.locked = false;
  }
}
