// Shared tuning + content definitions. Every module reads from here; nothing here imports anything.

export const GAME_TITLE = 'INKWAVE';
export const GAME_SUBTITLE = '占地大乱斗';
export const VERSION = '1.0.0';

// Team ink palettes. Team 0 ("Alpha") is always the local player's team; a palette is picked per match.
export const TEAM_PALETTES = [
  { id: 'tangerine-cobalt', a: '#ff8a14', b: '#2f5bff', names: ['橘子', '钴蓝'] },
  { id: 'bubblegum-mint', a: '#ff3f9e', b: '#18d48c', names: ['泡泡糖', '薄荷'] },
  { id: 'lemon-grape', a: '#f2e312', b: '#8a3cff', names: ['柠檬', '葡萄'] },
  { id: 'aqua-cherry', a: '#10d2e6', b: '#ff4150', names: ['水蓝', '樱桃'] },
  { id: 'lime-magenta', a: '#a6f01a', b: '#e02cd8', names: ['青柠', '洋红'] },
];
// Used instead when settings.colorblind is on (yellow vs blue is safe for all common CVD types).
export const COLORBLIND_PALETTE = { id: 'cb-yellow-blue', a: '#ffd21a', b: '#2a52ff', names: ['骄阳', '碧海'] };

export const TEAM_NAMES = ['Alpha', 'Bravo'];

// ---- Player physics / feel (meters, seconds) ----
export const PLAYER = {
  hp: 100,
  specialChargeRate: 0.8,   // special meter points per m² of turf inked (0.8 = charges 20% slower); special ink never charges it
  radius: 0.38,
  height: 1.45,          // kid form standing height (feet -> top of head)
  squidHeight: 0.55,
  runSpeed: 6.0,
  squidDrySpeed: 2.9,    // squid hopping on unpainted ground
  swimSpeed: 11.8,       // squid submerged in own ink
  enemyInkSpeed: 1.9,
  climbSpeed: 7.5,
  accelGround: 42,
  accelAir: 14,
  accelSwim: 60,
  jumpVel: 8.4,
  swimJumpVel: 9.4,
  gravity: 25,
  maxFall: 40,
  inkMax: 100,
  inkRefillSwim: 42,     // per second while submerged
  inkRefillKid: 9,       // per second in kid form after idle delay
  inkRefillDelay: 0.9,
  enemyInkDps: 20,       // damage/s while standing in enemy ink ...
  enemyInkDamageCap: 40, // ... never takes you below (hp - cap) from ink alone
  regenDelay: 1.3,
  regenRate: 22,
  regenRateSwim: 60,
  respawnTime: 5.5,
  // share of the special gauge you keep when splatted (a special running at the time ends and the gauge restarts
  // from this share of full); the rest is lost, and what's kept carries through the respawn
  specialKeepOnSplat: 0.5,
  spawnInvuln: 1.6,
  fallDeathY: -1.45,  // touching the sea (surface y = -1.6) splats you
  waterY: -1.6,

  // ---- handling (stream 4; see actor.js _horizontal / _integrate). Measured with tools/measure-handling.mjs.
  // ground run: S-curve accel (ease-in over the first ~1.6 m/s, ease-out over the last 28 % of top speed)
  runAccel: 70, runAccelIn: 0.5, runInKnee: 1.6, runOutKnee: 0.28, runOutMin: 0.22,
  runDecel: 58, runDecelMin: 0.4, runDecelKnee: 2.2,   // brake: strong at speed, eases into the stop (no hard corner)
  reverseDecel: 78, reverseAngle: 2.2,                  // > ~126° input change = plant-and-reverse (vector brake-through)
  turnRate: 15, turnRateSlow: 1.5,                      // velocity heading slew (rad/s); faster when slow → carve, never dip
  airAccel: 20, airDecel: 4, airMinSpeed: 4.6,
  squidAccel: 34, squidDecel: 26, squidTurn: 13,        // squid hopping on dry ground (also the swim-exit glide)
  swimAccel: 64, swimAccelIn: 0.75, swimDecel: 42, swimTurn: 11, swimOutKnee: 0.22,   // 90 % speed in 0.18 s, 1.6 m glide to a stop
  squidAirAccel: 14, squidAirDecel: 3,
  enemyInkDecel: 30, enemyInkAccel: 30,                 // wading into enemy ink: a quick but readable bog-down
  // jumping
  jumpBuffer: 0.13,       // a jump pressed this long before touching down still fires on landing
  coyoteTime: 0.12,       // ... and this long after walking off an edge
  fallGravityMul: 1.2,    // snappier descent
  apexGravityMul: 0.82,   // a hair of hang at the top of the arc (|vy| < apexBand)
  apexBand: 1.6,
  hardLandSpeed: 11.5,    // landings faster than this (falls > ~2.3 m) cost a short recovery
  hardLandSlow: 0.72, hardLandTime: 0.16,
  // character controller
  footRadius: 0.24,       // flat footprint for the ground probe (ledge hold / lips)
  stepUp: 0.35,           // curbs/lips a kid walks straight onto (body capsule is lifted by this much)
  stepDown: 0.45,         // ground stick range while grounded (ramps, steps down)
  squidStepUp: 0.24, squidBodyLift: 0.16,
  ledgeAssist: 0.35,      // falling feet this far below a ledge top still land on it (pop-up, visually smoothed)
  // facing (angular spring with a rate cap: smooth ease-in/out turns, never a snap)
  faceOmega: 20, faceMaxRate: 12.5, faceMaxAcc: 170, squidFaceOmega: 26, squidFaceMaxRate: 17, swimFaceMaxRate: 14, squidFaceMaxAcc: 260,
  aimFaceOmega: 36, aimFaceMaxRate: 24, aimFaceMaxAcc: 380,
  // wall climb
  climbAccel: 46, climbSideSpeed: 5.2, climbAttachDot: 0.5, climbDetachDot: -0.45,
  ledgePopClear: 0.42,    // apex this far above the ledge top when popping over it
  ledgePopCarry: 2.5,     // forward speed onto the ledge
  emergeDelay: 0.07,      // squid → kid before the first shot can leave the barrel (the shot is buffered, not lost)
  fireBuffer: 0.16,
};

// ---- Weapons ----
// stats.* are 0..1 display bars for the loadout screen.
export const WEAPONS = {
  shooter: {
    id: 'shooter', name: '细雾枪', kind: 'shooter', class: '射击枪',
    blurb: '速射全能型。持续喷出稳定的墨汁弹流。',
    stats: { range: 0.5, damage: 0.45, rate: 0.85, mobility: 0.7, paint: 0.6 },
    fireInterval: 0.1, damage: 36, inkPerShot: 0.95,
    projSpeed: 34, straightTime: 0.13, range: 12.5,
    spreadGround: 5.5, spreadAir: 11,   // degrees
    impactRadius: 0.85, trailRadius: 0.44, trailEvery: 1.05,
    moveSpeedFiring: 4.6,
    special: 'zooka', specialCost: 190, sub: 'bomb',
  },
  roller: {
    id: 'roller', name: '涌浪滚筒', kind: 'roller', class: '滚筒',
    blurb: '滚出宽阔的涂地带。挥击可砸出致命的墨花。',
    stats: { range: 0.35, damage: 0.95, rate: 0.3, mobility: 0.55, paint: 0.95 },
    rollSpeed: 4.4, rollWidth: 1.9, rollInkPerMeter: 1.1, rollDamage: 140,
    flickInterval: 0.62, flickWindup: 0.22, flickInk: 9, flickDrops: 9,
    flickDamageNear: 125, flickDamageFar: 30, flickSpeed: 17, flickSpreadDeg: 34,
    impactRadius: 1.0,
    moveSpeedFiring: 4.4,
    special: 'kraken', specialCost: 170, sub: 'sticky',
  },
  charger: {
    id: 'charger', name: '微光蓄力枪', kind: 'charger', class: '蓄力枪',
    blurb: '按住蓄力，松开射出贯穿长线。满蓄力一击击倒。',
    stats: { range: 1.0, damage: 1.0, rate: 0.25, mobility: 0.35, paint: 0.45 },
    chargeTime: 1.0, rangeMin: 11, rangeMax: 27, damageMin: 40, damageMax: 160,
    inkFull: 18, lineSplatEvery: 1.2, lineRadius: 0.55, impactRadius: 1.2,
    moveSpeedFiring: 1.8,
    special: 'sonar', specialCost: 180, sub: 'mine',
  },
  blaster: {
    id: 'blaster', name: '砰砰爆破枪', kind: 'blaster', class: '爆破枪',
    blurb: '弹速较慢、在空中炸开。直接命中可瞬间击倒。',
    stats: { range: 0.55, damage: 0.9, rate: 0.3, mobility: 0.6, paint: 0.5 },
    fireInterval: 0.78, directDamage: 125, splashDamageMax: 70, splashDamageMin: 30,
    splashRadius: 2.6, inkPerShot: 9, projSpeed: 23, range: 10.5,
    impactRadius: 1.5, burstRadius: 1.9,
    moveSpeedFiring: 4.0,
    special: 'jetpack', specialCost: 180, sub: 'burst',
  },
  // `anim` = the pose family the character animates with (kind otherwise)
  bucket: {
    id: 'bucket', name: '舱底水桶', kind: 'bucket', class: '泼桶', anim: 'blaster',
    blurb: '沿弧线泼出一大波墨汁：抬得越高泼得越远，可以越过掩体。任何距离都是全额伤害；两发击倒。',
    stats: { range: 0.5, damage: 0.8, rate: 0.35, mobility: 0.6, paint: 0.7 },
    fireInterval: 0.6, windup: 0.12, inkPerShot: 6,
    throwSpeed: 15.5, lob: 0.3, blobs: 5, gravity: 20, drag: 0.25, reach: 9.5,
    damage: 55, impactRadius: 1.05,       // no distance falloff; only targets below you take less (belowFalloff per m, capped)
    belowFalloff: 0.12, belowFalloffMax: 0.35,
    moveSpeedFiring: 4.2,
    special: 'blower', specialCost: 180, sub: 'sprinkler',
  },
  spinner: {
    id: 'spinner', name: '狂风旋转枪', kind: 'spinner', class: '旋转枪', anim: 'charger',
    blurb: '先旋转蓄力，再倾泻墨汁流。完全旋转后射程最远、射击时间最长。',
    stats: { range: 0.88, damage: 0.55, rate: 1.0, mobility: 0.4, paint: 0.7 },
    chargeTime: 1.0, inkFull: 24, burstMin: 0.35, burstMax: 1.8, fireInterval: 0.05,
    damage: 26, speedMin: 25, speedMax: 40, straightMin: 0.09, straightMax: 0.24, rangeMin: 10, rangeMax: 21,
    spreadGround: 2.8, spreadAir: 6, impactRadius: 0.72, trailRadius: 0.38, trailEvery: 1.25,
    moveSpeedCharging: 3.3, moveSpeedFiring: 3.0,
    special: 'crab', specialCost: 200, sub: 'curtain',
  },
  twins: {
    id: 'twins', name: '双焰手枪', kind: 'twins', class: '双枪', anim: 'shooter',
    blurb: '成对手枪。射击时按跳跃可翻滚闪避；翻滚后站定不动，可高速远距连射。一旦移动就恢复双持模式。',
    stats: { range: 0.4, damage: 0.4, rate: 0.95, mobility: 0.9, paint: 0.55 },
    fireInterval: 0.085, damage: 30, inkPerShot: 0.85, projSpeed: 31, straightTime: 0.11, range: 11,
    spreadGround: 6, spreadAir: 11, impactRadius: 0.78, trailRadius: 0.4, trailEvery: 1.1,
    moveSpeedFiring: 5.2,
    rollDist: 3.4, rollTime: 0.3, rollInk: 7, rollCharges: 2, rollLockout: 2.6, rollReset: 1.4,
    turretInterval: 0.058, turretSpread: 1.6, turretProjSpeed: 36, turretStraight: 0.16, turretRange: 13.5,
    special: 'bubbler', specialCost: 180, sub: 'seeker',
  },
  brush: {
    id: 'brush', name: '刷刷笔刷', kind: 'brush', class: '笔刷', anim: 'roller',
    blurb: '贴地疾行留下一道细窄墨痕，或左右挥动甩出一片细小墨滴。',
    stats: { range: 0.2, damage: 0.35, rate: 1.0, mobility: 1.0, paint: 0.5 },
    brushSpeed: 7.4, brushWidth: 0.95, brushInkPerMeter: 0.32, brushDamage: 30, brushHitCd: 0.35,
    swipeInterval: 0.16, swipeInk: 2.2, swipeDrops: 5, swipeSpeed: 12.5, swipeSpreadDeg: 40,
    swipeDamageNear: 26, swipeDamageFar: 12, impactRadius: 0.7,
    moveSpeedFiring: 5.8,
    special: 'stamp', specialCost: 170, sub: 'mist',
  },
  // ---- kit weapons: each kind lives in src/game/kits/<kind>.js (registered in kits/registry.js); the numbers here are its tuning
  brolly: {
    id: 'brolly', name: '华盖伞', kind: 'brolly', class: '伞', anim: 'shooter',
    blurb: '霰射一片墨珠。按住可撑开伞面：为你和队友充当护盾。继续按住可将伞面发射出去，化作一面滚动的墨墙。',
    stats: { range: 0.35, damage: 0.7, rate: 0.5, mobility: 0.6, paint: 0.55 },
    range: 7,
    // pellets: a narrow cone of `pellets` per shot; each does pelletDamage out to falloffStart (m), easing to
    // pelletDamageFar at falloffEnd — a near-full blast (10–11 pellets) is 80–88, so two shots splat up close
    fireInterval: 0.45, inkPerShot: 5.5, pellets: 11, pelletDamage: 8, pelletDamageFar: 2.5, falloffStart: 2.8, falloffEnd: 6.5,
    projSpeed: 25, straightTime: 0.1, pelletGrav: 30, pelletDrag: 2, pelletLife: 0.6, pelletSize: 0.1, pelletPaint: 0.5,
    spreadDeg: 8, spreadAir: 10,
    moveSpeedFiring: 4.6, moveSpeedShield: 3.1,
    // canopy (kits/brolly.js): hold after the shot to open it; kept open launchHold s it launches as a sliding wall.
    // It blocks enemy shots / beams / ink, soaks bomb blasts, breaks at 0 hp and regrows regrowTime s after a break
    // or a launch; a damaged canopy mends at canopyRegen hp/s once folded and untouched for canopyRegenDelay s
    canopyHp: 450, openDelay: 0.12, openTime: 0.14, closeTime: 0.1, launchHold: 0.9, regrowTime: 5,
    canopyRegen: 60, canopyRegenDelay: 2,
    launchSpeed: 2.6, launchLife: 6, launchPaint: 0.8,
    special: 'bubbler', specialCost: 180, sub: 'tracer',
  },
  bow: {
    id: 'bow', name: '潮线弓', kind: 'bow', class: '弓', anim: 'charger',
    blurb: '拉弓蓄满两道环，然后同时放出三支箭：贴地展开的扇形，以及立在空中的一支。蓄力超过第一道环后，箭会钉在落点并爆炸。',
    stats: { range: 0.85, damage: 0.6, rate: 0.45, mobility: 0.5, paint: 0.6 },
    // (kits/bow.js) draw time to full; ring 1 is this share of it. Charge < ring1 = a tap: short, weak, no lodge
    chargeTime: 1.0, ring1: 0.45,
    inkFull: 16, inkMin: 0.15,                              // ink per shot = inkFull × max(inkMin, charge)
    range: 25,                                              // full-draw reach where a level shot lands (aim assist, bots, reticle)
    flightTap: [5, 7.5], flightRing: [12.5, 16.5], flightFull: 21,   // straight flight per tier (m), then the arrow dives
    speedTap: 32, speedRing: [42, 48], speedFull: 58,       // arrow speed (m/s): fast, with a light arc
    straight: 0.05, grav: 6, diveGrav: 140, diveDrag: 6,    // past its flight an arrow noses down into the ground (~3-4 m)
    damageTap: [14, 20], damageRing: [30, 38], damageFull: 55,   // direct hit, centre arrow
    sideMul: 0.8, sideFull: 45,                             // side arrows (full draw: centre + side = a splat)
    fanTap: 8, fanRing: 6, fanFull: 4.5,                    // degrees between neighbouring arrows
    fuseRing: 0.7, fuseFull: 0.55,                          // lodged arrow → burst (s)
    burstRadius: [1.35, 1.8], burstInner: 0.6,              // [ring, full] (m); full damage inside burstInner
    burstDamage: [30, 45], burstEdge: [12, 15],
    paintTap: 0.55, paintStick: 0.42, burstPaint: [1.2, 1.55], trailEvery: 2.4, trailRadius: 0.32,
    cooldown: 0.22, moveSpeedDrawing: 2.6, moveSpeedFiring: 4.2,
    special: 'strike', specialCost: 190, sub: 'waddle',
  },
  blade: {
    id: 'blade', name: '盐雾弯刀', kind: 'blade', class: '弯刀', anim: 'blade',
    blurb: '轻点挥出快速斩击，甩出一弯墨刃。按住蓄力使出头顶重斩，放出一道长长的墨浪。刀刃本身伤害极高：蓄力斩一击即可击倒。',
    stats: { range: 0.35, damage: 0.85, rate: 0.75, mobility: 0.85, paint: 0.55 },
    // (kits/blade.js; pose family HOLD.blade in character.js) range = the quick cut's droplet reach (aim assist, bots)
    range: 6.5, projSpeed: 17,
    // quick cut: alternating horizontal slashes, a crescent of droplets (one hit per victim per cut) + the blade itself
    tapInterval: 0.27, tapInk: 3.2, tapDrops: 7, tapSpreadDeg: 66, tapSpeed: 17.5, tapStraight: 0.07,
    tapDamageNear: 40, tapDamageFar: 20, tapDropRadius: 0.64, tapMelee: 35,
    // charged cut: hold past the swing to charge; release at full → overhead cut + lunge + a straight ink wave
    chargeDelay: 0.14, chargeTime: 0.62, chargeStore: 1.0, heavyInk: 9, heavyInterval: 0.46,
    heavyMelee: 130, lungeDist: 1.05, lungeTime: 0.13, strokeRadius: 0.6,
    waveDamage: 70, waveDamageFar: 50, waveSpeed: 26, waveRange: 12, waveWidth: 0.7, waveHeight: 1.7,
    wavePaintEvery: 0.7, wavePaintRadius: 0.62, waveEndRadius: 1.05,
    // the blade's own hitbox: an arc in front of the kid, `reach` m (plus the victim's body radius)
    reach: 1.5, meleeArcDeg: 150, heavyArcDeg: 110,
    moveSpeedFiring: 5.6, moveSpeedCharging: 4.4,
    special: 'zipcaster', specialCost: 180, sub: 'shaker',
  },
  mitts: {
    id: 'mitts', name: '海绵拳套', kind: 'mitts', class: '拳套', anim: 'shooter',
    blurb: '打出会在前方数米爆开的墨汁拳——举拳迎敌时，海绵能吸收来自正面的部分伤害。按住射击并按跳跃可蓄力飞跃一大段，落地时溅开墨汁，还能吸附在墙上（持续抓墙会消耗墨汁）。',
    stats: { range: 0.3, damage: 0.75, rate: 0.9, mobility: 0.9, paint: 0.5 },
    range: 5.3,              // reach for bots / aim assist: the fist's flight + its burst
    // punches: alternating gloves; each throws an ink fist that flies fistRange and bursts (or bursts on what it hits)
    punchInterval: 0.12, inkPerPunch: 1.6, punchSpread: 2.5,   // three fists splat: ≈ 0.24 s + the flight
    fistSpeed: 28, fistRange: 4.6, fistSize: 0.2,
    // sponge guard: while punching (and a beat after), a hit from within guardArc° of where you face takes × guardArmor
    guardArmor: 0.5, guardArc: 70, guardAfter: 0.25,
    botApproach: 1,          // bots: swim / weave / punch their way in (kits/mitts.js botTactics); 0 = the plain melee walk (A/B tests)
    punchDamage: 38,         // direct: three fists splat
    splashRadius: 1.4, splashMax: 22, splashMin: 10, fistPaint: 0.95,
    moveSpeedFiring: 5.4,
    // charged leap: hold fire, press jump (hold to charge, release to leap along the aim; aim higher = higher arc)
    leapChargeTime: 0.45, leapInkMin: 9, leapInkMax: 15, moveSpeedCharging: 1.1,
    leapArmor: 0.35, leapArmorGrace: 0.15,  // damage taken × leapArmor while in the air on a leap (and for leapArmorGrace s after landing)
    leapSpeedMin: 10.9, leapSpeedMax: 18.6,   // launch speed at 0 / full charge (≈ 4.5 m / 13 m on flat ground)
    leapAngle: 40, leapAngleMin: 18, leapAngleMax: 60, leapPitchK: 0.55, leapVyMax: 13,
    landRadius: 2.8, landDamageMax: 100, landDamageMin: 35, landPaint: 2.5,   // a dead-centre landing splats
    landInvuln: 0.5,         // s untouchable after a leap lands (ground or wall): the spawn-protection flicker shows it
    gloveRadius: 1.1, gloveDamage: 40,   // the gloves themselves: anyone the kid lands on (within gloveRadius + their body) takes this on top of the splash
    // wall cling (a leap into a wall sticks there): drains ink; jump or an empty tank lets go
    clingDrain: 8,
    special: 'slam', specialCost: 180, sub: 'boomerang',
  },
  // ---- upstream's arsenal (retired from the roster — see WEAPON_ORDER; dualies ≈ twins, slosher ≈ bucket, splatling ≈ spinner)
  dualies: {
    id: 'dualies', name: '双鳍双枪', kind: 'dualies', class: '翻滚双枪', sub: 'bomb',
    blurb: '成对手枪轮流开火。射击时按跳跃翻滚闪避，随后站定倾泻火力。',
    stats: { range: 0.42, damage: 0.4, rate: 0.95, mobility: 0.95, paint: 0.55 },
    fireInterval: 0.083, damage: 30, inkPerShot: 0.85,        // hands alternate: 12 shots/s, 4 hits to splat
    projSpeed: 32, straightTime: 0.11, range: 11,
    spreadGround: 6.5, spreadAir: 12, spreadFirst: 0.5, bloomPerShot: 0.25, spreadLock: 2.2,
    impactRadius: 0.75, trailRadius: 0.38, trailEvery: 1.15,
    moveSpeedFiring: 5.0,
    rollInk: 7, rollTime: 0.3, rollDist: 2.8, rolls: 2, lockTime: 0.5, lockInterval: 0.07,   // dodge roll → locked turret
    special: 'slam', specialCost: 180,
  },
  slosher: {
    id: 'slosher', name: '潮桶泼筒', kind: 'slosher', class: '泼筒', sub: 'bomb',
    blurb: '沿弧线泼出一大波沉重的墨汁：越过掩体、抛上高台，在落点留下厚厚一条墨带。',
    stats: { range: 0.58, damage: 0.8, rate: 0.4, mobility: 0.6, paint: 0.78 },
    fireInterval: 0.62, windup: 0.13, inkPerShot: 7.5,
    projSpeed: 15, grav: 22, range: 9.5, drops: 8,
    damageHead: 70, damageTail: 34, splashRadius: 1.1, splashDamage: 26,
    impactRadius: 1.05, trailRadius: 0.5, trailEvery: 1.4,
    moveSpeedFiring: 4.2,
    special: 'slam', specialCost: 175,
  },
  splatling: {
    id: 'splatling', name: '漩涡蓄能枪', kind: 'splatling', class: '蓄能枪', sub: 'bomb',
    blurb: '按住旋转蓄力，松开倾泻高速墨汁流。蓄力越满，持续越久。',
    stats: { range: 0.78, damage: 0.55, rate: 1.0, mobility: 0.38, paint: 0.7 },
    chargeTime: 0.85, burstMin: 0.3, burstMax: 1.7, fireInterval: 0.066, damage: 28, inkPerShot: 0.6,
    projSpeed: 40, straightTime: 0.16, range: 15,
    spreadGround: 3.2, spreadAir: 7, spreadFirst: 0.6, bloomPerShot: 0.05,
    impactRadius: 0.8, trailRadius: 0.42, trailEvery: 1.2,
    moveSpeedCharging: 2.4, moveSpeedFiring: 3.4,
    special: 'storm', specialCost: 195,
  },
};
// the roster (upstream's dualies / splatling / slosher were A/B-tested against ours and retired: twins, spinner and
// bucket kept, wearing upstream's reticles + spin-up feedback — the defs above stay for old saves and the HUD kinds)
export const WEAPON_ORDER = ['shooter', 'twins', 'brolly', 'blaster', 'spinner', 'charger', 'bow', 'roller', 'brush', 'blade', 'mitts', 'bucket'];
// retired weapon → the one that replaced it (saved loadouts, links)
export const WEAPON_SUCCESSOR = { dualies: 'twins', splatling: 'spinner', slosher: 'bucket' };
// effective reach (m) for aim assist, the in-range reticle and bots
export function weaponRange(w) {
  switch (w.kind) {
    case 'charger': case 'spinner': return w.rangeMax;
    case 'roller': return 6;
    case 'brush': return 5;
    case 'bucket': return w.reach;
    default: return w.range || 12;
  }
}

// Sub weapons. Each weapon has a default (`sub` on the weapon); the loadout can swap it for any of these.
export const SUBS = {
  bomb: {
    id: 'bomb', name: '墨汁炸弹', kind: 'bomb', blurb: '弹跳落地后进入待发状态，随后爆炸。击倒附近的所有人。',
    inkCost: 70, throwSpeed: 13.5, fuse: 0.95, radius: 3.1, damageMax: 180, damageMin: 35, paintRadius: 2.7,
  },
  sticky: {
    id: 'sticky', name: '黏着炸药', kind: 'sticky', blurb: '粘住所碰到的一切（地面、墙壁、天花板），稍后以大范围爆炸引爆。',
    inkCost: 70, throwSpeed: 13.5, fuse: 2.4, radius: 4.0, damageMax: 180, damageMin: 35, paintRadius: 3.3,
  },
  burst: {
    id: 'burst', name: '爆裂弹', kind: 'burst', blurb: '触物即爆。消耗低到可以连扔两颗：两发直击或三次近失即可击倒。',
    inkCost: 40, throwSpeed: 16, radius: 2.1, directDamage: 60, splashDamage: 35, paintRadius: 1.8,
  },
  seeker: {
    id: 'seeker', name: '疾走炸弹', kind: 'seeker', blurb: '疾走追击最近的敌人，沿途留下可供游动的墨迹，追上后爆炸。它转弯半径很大：贴近时再侧身闪避。',
    // turnRate: rad/s (1.75 ≈ 100°/s: a ~3.6 m turning circle at full speed; was 5); commitDist: dashes straight (no
    // steering) once this close and lined up; creep: how much it slows turning onto a slow / standing target.
    // speed 6.3 (was 7): only just faster than a run (6), so a foe who sidesteps and keeps running gets away instead
    // of being run down from behind; one who stands, walks or shoots while strafing is still caught
    inkCost: 65, throwSpeed: 9, speed: 6.3, seekRange: 15, life: 4.5, trailRadius: 0.6, triggerDist: 1.2, turnRate: 1.75, commitDist: 2.5, creep: 0.6,
    radius: 2.8, damageMax: 180, damageMin: 35, paintRadius: 2.4,
  },
  scan: {
    id: 'scan', name: '回声球', kind: 'scan', blurb: '爆开成一片感应云。被触碰到的敌人会为全队持续标记。无伤害。',
    inkCost: 55, throwSpeed: 14, fuse: 1.1, radius: 4.2, cloudTime: 0.9, trackTime: 8,
  },
  curtain: {
    id: 'curtain', name: '墨水帘幕', kind: 'curtain', blurb: '放下一面墨水帘，阻挡敌方玩家与子弹。会随时间消散，被射击时消散得更快。',
    inkCost: 55, throwSpeed: 9, width: 3.4, height: 2.7, hp: 170, decay: 19, shotMul: 0.5,
  },
  sprinkler: {
    id: 'sprinkler', name: '旋转洒墨器', kind: 'sprinkler', blurb: '粘附于任意表面，一波一波向外喷洒墨汁，直到被击毁或你被击倒。',
    inkCost: 60, throwSpeed: 12, hp: 70, pulse: 0.3, drops: 6, sprayRadius: 3.2, sprayFade: 12, dropDamage: 8,
  },
  mine: {
    id: 'mine', name: '潜伏地雷', kind: 'mine', blurb: '埋设在你脚下，隐藏于己方墨汁中。靠近的敌人会受到伤害并被标记。最多同时放置两枚。',
    inkCost: 55, placed: true, max: 2, triggerRadius: 2.1, armTime: 0.9, delay: 0.35, radius: 2.6, damage: 45, trackTime: 8, paintRadius: 2.0,
  },
  beacon: {
    id: 'beacon', name: '跳跃信标', kind: 'beacon', blurb: '供全队使用的超级跳跃点。最多放置三个；每个可用两次。',
    inkCost: 70, placed: true, max: 3, uses: 2, hp: 50,
  },
  mist: {
    id: 'mist', name: '毒雾弹', kind: 'mist', blurb: '释放毒雾，减缓敌人速度并消耗其墨汁。被直接命中的敌人会持续中毒，直到毒雾散去。',
    inkCost: 60, throwSpeed: 13.5, fuse: 1.0, radius: 3.3, mistTime: 4.5, slow: 0.55, inkDrain: 12,
  },
  // ---- kit subs: each kind lives in src/game/kits/<kind>.js
  shaker: {
    id: 'shaker', name: '摇爆炸弹', kind: 'shaker', blurb: '按住把它摇起来（连打跳跃、保持移动）：最多三次爆炸，每次都把它向前弹一段。',
    inkCost: 60, throwSpeed: 13,
    // charge (0..1; 2 blasts at ½, 3 at full): plain holding fills it in chargeTime; running adds up to moveBoost × that
    // rate; each jump press adds jumpBoost, each stick / mouse waggle shakeBoost; never faster than maxRate per second
    chargeTime: 2.7, moveBoost: 0.9, jumpBoost: 0.075, shakeBoost: 0.05, maxRate: 1.6,
    fuse: 0.5, gap: 0.42, hopSpeed: 4.2, hopUp: 4.6,          // first landing → first blast, blast → blast, each blast's hop
    radius: 2.3, damageMax: 110, damageMin: 30, paintRadius: 2.0, // per blast: a smaller Splat Bomb
    trailEvery: 0.38, trailRadius: 0.3,                       // thin ink trail sprayed while it travels
  },
  waddle: {
    id: 'waddle', name: '摇摆炸弹', kind: 'waddle', blurb: '摇摇摆摆地追击落点附近感知到的敌人，动静很大。若附近无人，就在原地爆炸。',
    inkCost: 65, throwSpeed: 12,
    senseRadius: 7.5, senseUp: 4, fuse: 1.1,                  // sensing circle on landing; nobody inside → blows after fuse
    speed: 4.0, turnRate: 8, life: 9, maxTravel: 26, triggerDist: 1.2,   // tracks its foe (nav paths, hops up steps)
    radius: 3.0, damageMax: 180, damageMin: 35, paintRadius: 2.6, hp: 30,  // Splat Bomb blast; shoot-able (30 hp)
  },
  torpedo: {
    id: 'torpedo', name: '潮汐鱼雷', kind: 'torpedo', blurb: '在空中锁定敌人，随后急速冲向目标并炸成一片墨滴。同时只能存在一枚。',
    inkCost: 65, throwSpeed: 13.5, feetPaint: 1.25,
    // flight → lock (a foe within lockRange, in sight, after armTime) → unfold (hovers) → launch (swims at them, homing)
    armTime: 0.12, lockRange: 6.5, flyLife: 2.5, unfoldTime: 0.5, launchSpeed0: 2.2, launchSpeed: 9.5, launchAccel: 8, turnRate: 1.9, launchLife: 2.8,
    hp: 20,                                                        // shot down by 20 damage (any form)
    radius: 2.4, coreRadius: 1.2, damageMax: 60, damageMin: 35,     // the burst (both forms): 60 up close, 35 at the rim
    paintRadius: 3.6, fallbackPaint: 1.5,                           // locked burst paints a bit more than a Cling Charge (3.3)
    drops: 10, dropDamage: 12, dropHits: 3, dropPaint: 0.65,        // locked burst only: 60 + 3 × 12 = 96 max
  },
  tracer: {
    id: 'tracer', name: '曳光弹', kind: 'tracer', blurb: '略微压低射出的快速弹丸，贴地弹跳，每次弹跳都留下一滩墨汁。命中与弹痕都会为全队标记敌人。',
    inkCost: 40, speed: 40, range: 32, pitchDown: 9, floorExit: 0.3, maxBounces: 12, size: 0.16,
    puddleRadius: 1.35, directDamage: 35, directMark: 9, trailLife: 1.0, trailRadius: 0.42, trailDamage: 22, trailMark: 3,
  },
  boomerang: {
    id: 'boomerang', name: '回旋镖', kind: 'boomerang', blurb: '旋转飞出，悬停绞削，绕你回旋一圈后爆炸。命中敌人时会像墨汁炸弹一样在其身上爆开。同时只能存在一枚。',
    inkCost: 60, throwSpeed: 16,           // throwSpeed: only the bots' lob maths read it (the throw itself is flat)
    range: 9, outTime: 0.6,                // flat along the aim, easing to a stop ~9 m out (stops early at a wall)
    hover: 1.75, hoverRadius: 1.35, tickRate: 8, tickDamage: 9, hoverPaint: 1.0,   // shreds ≈ 72 dmg/s around it
    returnSpeed: 17, orbit: 2.5, orbitRadius: 1.5, orbitSpin: 7, orbitDamage: 6, orbitHitCd: 0.3,
    radius: 2.4, damageMax: 100, damageMin: 30, paintRadius: 2.2,                 // the burst beside you at the end
    contact: 0.3, hitFuse: 0.6, hitRadius: 3.1, hitDamageMax: 180, hitDamageMin: 35, hitPaintRadius: 2.7,   // hit a foe in flight: Splat Bomb
  },
};
export const SUB_ORDER = ['bomb', 'sticky', 'burst', 'shaker', 'seeker', 'waddle', 'torpedo', 'tracer', 'boomerang', 'scan', 'curtain', 'sprinkler', 'mine', 'beacon', 'mist'];
export const SUB = SUBS; // older code reads SUB.bomb

// Specials. Every special refills your ink tank when it starts. `duration` = how long a timed special lasts (s).
export const SPECIALS = {
  slam: { id: 'slam', name: '潮击重踏', blurb: '跃至高空，重重砸下，掀起巨大的墨汁冲击波。', rise: 0.55, hang: 0.25, radius: 5.2, killRadius: 3.2, damageMax: 180, damageMin: 55 },
  storm: { id: 'storm', name: '墨水风暴', blurb: '掷出一朵雨云，浇透下方的地面。', duration: 6.5, radius: 3.4, dps: 34, throwSpeed: 16, driftSpeed: 1.1 },
  // Bomb Barrages: throw one kind of bomb as fast as you like (no ink) while the main weapon still works. Each variant
  // is its own special (kind 'barrage'); `gap` = the shortest time between throws.
  barrage: { id: 'barrage', kind: 'barrage', bomb: 'bomb', name: '墨汁炸弹连爆', blurb: '在几秒内随心连扔墨汁炸弹——无需墨汁。主武器仍可正常使用。', duration: 6.5, gap: 0.3 },
  barrage_sticky: { id: 'barrage_sticky', kind: 'barrage', bomb: 'sticky', name: '黏着炸药连爆', blurb: '把黏着炸药粘满眼前的每一面墙——无需墨汁。主武器仍可正常使用。', duration: 6.5, gap: 0.4 },
  barrage_burst: { id: 'barrage_burst', kind: 'barrage', bomb: 'burst', name: '爆裂弹连爆', blurb: '用速射爆裂弹痛击敌人——无需墨汁。主武器仍可正常使用。', duration: 6.5, gap: 0.2 },
  barrage_seeker: { id: 'barrage_seeker', kind: 'barrage', bomb: 'seeker', name: '疾走炸弹连爆', blurb: '放出一群疾走炸弹追击敌人，各自留下墨迹——无需墨汁。主武器仍可正常使用。', duration: 6.5, gap: 0.5 },
  barrage_mist: { id: 'barrage_mist', kind: 'barrage', bomb: 'mist', name: '毒雾弹连爆', blurb: '用毒雾弹的毒雾笼罩一片区域——无需墨汁。主武器仍可正常使用。', duration: 6.5, gap: 0.45 },
  // force field: hits become knockback (reduced); touching teammates shares it
  bubbler: { id: 'bubbler', name: '泡泡护罩', blurb: '一面力场，把每一次受击都化为推撞而非伤害。触碰队友可与其共享。',
    duration: 6.5, radius: 1.3, knockPerDamage: 0.045, knockMax: 6.5, shareRange: 1.5 },
  // reveals every enemy to your team (screen + map); they are slowed and burn ink faster
  sonar: { id: 'sonar', name: '深海声呐', blurb: '在屏幕和地图上为全队揭示所有敌人。被揭示的敌人移速变慢，墨汁消耗更快。',
    duration: 8, slow: 0.8, inkMul: 1.4, cast: 0.6 },
  // pick a spot on the map; a missile lands there as a swirling ink vortex
  strike: { id: 'strike', name: '漩涡空袭', blurb: '在地图上选定一处并发射导弹。它将化作巨大的墨汁漩涡落下。',
    aimTime: 7, flight: 2.2, radius: 5.5, duration: 4.5, dps: 62, pull: 1.6 },
  // bazooka: tall narrow twisters in quick succession, long range, one-shot splats
  zooka: { id: 'zooka', name: '龙卷火箭炮', blurb: '一门能连续射出高大墨汁龙卷的火箭炮——可远距离击倒敌人。',
    duration: 6, interval: 1.0, speed: 34, range: 44, damage: 180, height: 2.8, radius: 0.55, paintEvery: 0.7, paintRadius: 0.95 },
  // speaker: after a short charge, a sound wave in the aimed direction through walls; splats anything in it
  wail: { id: 'wail', name: '咆哮音箱', blurb: '举起巨大的音箱，瞄准后按下：爆发出穿透墙壁的声波，击倒路径上的一切。',
    charge: 1.3, blast: 3.2, radius: 1.5, range: 72, dps: 260, holdTime: 6, holdSpeed: 3.2 },
  // invincible kraken: fast through any ink, splats with a jump attack
  kraken: { id: 'kraken', name: '海妖', blurb: '化身无敌海妖。在任意墨汁中疾驰（包括敌方墨汁），用跳跃攻击击倒敌人。',
    duration: 7, speed: 7.2, hopVel: 10.5, attackVel: 8.5, attackFwd: 6.5, radius: 2.3, damage: 200, knockPerDamage: 0.02, cooldown: 0.65, paintRadius: 1.15 },
  // up to three giant bubbles: they wall off an area and burst into a deadly blast when your team shoots them
  blower: { id: 'blower', name: '泡泡机', blurb: '吹出最多三个巨型泡泡，封锁一片区域。射击泡泡（你或你的队友）可引发巨大的墨汁爆炸。',
    duration: 9, max: 3, inflate: 1.0, rMin: 0.9, rMax: 2.1, drift: 1.4, life: 9, popDamage: 55, blastMul: 1.9, damageMax: 180, damageMin: 45 },
  // jetpack: hover and fire blaster-like shots; super jump back to the take-off point when it runs out
  jetpack: { id: 'jetpack', name: '墨水喷射', blurb: '悬浮在场地上空发射强力爆弹——按跳跃可向上助推。特殊武器结束后，你会超级跳跃回到起飞点（所有人都能看到的标记）。',
    duration: 7, height: 3.8, speed: 5.5, accel: 11, boost: 9, boostGap: 0.9, interval: 0.55, projSpeed: 30, range: 34, directDamage: 125, splashMax: 70, splashMin: 30, splashRadius: 2.4, paintRadius: 1.5 },
  // giant stamp: slam repeatedly while advancing, jump attack, or throw it (ends the special)
  stamp: { id: 'stamp', name: '巨型印章', blurb: '举着巨型印章向前冲锋猛砸：每次挥击都能弹开正面的攻击，并在炸弹引爆前将其砸毁，但转向缓慢，侧面和背后破绽大开。在空中挥击可翻转一圈，够得更远，也能打到身后。用副武器键把它掷出，化作远程爆炸——这会结束特殊武器。',
    duration: 7.5, interval: 0.42, reach: 1.6, radius: 1.55, damage: 200, lunge: 2.6, moveSpeed: 7.2, throwSpeed: 25, throwRadius: 3.2, throwDamageMax: 200, throwDamageMin: 60,
    // the body turns slowly while charging (quicker once stopped); sideways steps are short — charge, stop, turn, charge
    turnRate: 1.7, turnRateStill: 6.0, strafe: 0.35,
    // each swing guards the front: attacks from within deflectArc° of the facing do nothing, shots are knocked away and
    // bombs (thrown or planted) within bombClearR in front are smashed before they go off
    guardTime: 0.45, deflectArc: 70, deflectR: 2.6, bombClearR: 3.2,
    // swing in the air: one flip — hits behind you as the stamp goes over, then a longer-reaching smash in front
    flipTime: 0.5, flipReach: 2.7, flipRadius: 1.9, flipBackReach: 1.2, flipBackRadius: 1.6 },
  // a ball of ink held overhead charges over time (faster with "Yeah!" cheers); throw it once full for a huge blast
  booyah: { id: 'booyah', name: '欢呼球', blurb: '举着一颗随时间充能的墨汁球，扔出后引发巨大爆炸。队友的“好耶！”欢呼（C 键）能加快充能，并为自己积攒特殊武器。',
    charge: 4.5, cheer: 0.12, cheerSpecial: 12, autoThrow: 2.5, moveSpeed: 1.8, throwSpeed: 19.6, fuse: 1.5, radius: 8.4, killRadius: 4.6, damageMax: 220, damageMin: 60 },
  // grapple: the sub button fires a tether to latch onto surfaces and zip over; super jump back when it ends
  zipcaster: { id: 'zipcaster', name: '飞索', blurb: '周身笼罩神秘光晕，副武器变为钩索：远距离钉住墙壁并飞身过去，主武器仍在手。结束后你会超级跳跃回到出发点（所有人都能看到的标记）。',
    duration: 8.5, range: 21, speed: 22, hang: 1.4, cooldown: 0.35,
    // body impact at the end of every zip (or on an enemy met mid-zip): a mini explosion
    impactDirect: 100, impactSplash: 30, impactDirectR: 1.0, impactRadius: 2.4 },
  // ride a crab tank: gatling (main), mortar (sub), roll into an armoured ball (swim); the tank has HP, the rider is
  // exposed from above and behind
  crab: { id: 'crab', name: '螃蟹战车', blurb: '驾驶螃蟹坦克：射击键机炮扫射，副武器键发射迫击炮，游泳键蜷成装甲球滚动。坦克可能被击毁，你的上方和背后暴露在外。',
    duration: 9, hp: 460, speed: 3.0, rollSpeed: 9.5, turnRate: 1.5, gunInterval: 0.075, gunDamage: 18, gunSpeed: 36, gunRange: 22, gunSpread: 3.5,
    cannonGap: 1.15, cannonSpeed: 17, cannonRadius: 3.0, cannonDamageMax: 150, cannonDamageMin: 40, rollArmor: 0.35 },
};
export const SPECIAL_ORDER = ['slam', 'storm', 'barrage', 'barrage_sticky', 'barrage_burst', 'barrage_seeker', 'barrage_mist', 'bubbler', 'sonar', 'strike', 'zooka', 'wail', 'kraken', 'blower', 'jetpack', 'stamp', 'booyah', 'zipcaster', 'crab'];

// ---- Match ----
export const MATCH = {
  durations: [90, 180],     // seconds
  defaultDuration: 180,
  maxDuration: 180,          // hard cap (3 min): the final-minute song expects rounds of at most this length
  finalCountdown: 10,
  teamSize: 4,
  pointsPerM2: 1.0,          // turf points per square metre newly inked
  // death markers: a squid-skull in the victim's ink where anyone was splatted (world view, minimap, TAB map)
  deathMarkLife: 5,          // seconds on screen
  deathMarkFade: 1.3,        // … the last of which fade out
};

// ---- Zone Control (src/game/zones.js): the rules' numbers
export const ZONES = {
  duration: 300,              // 5 minutes (+ overtime)
  count: 100,                 // each team's countdown
  rotateMin: 30, rotateMax: 60,   // the operational objective swaps between the centre and a side zone this often (s)
  finalCentre: 30,            // from this many seconds left (and all through overtime) only the centre is live
  warn: 0.30,                 // the other team's share of a held zone that sounds the "about to flip" warning
  control: 0.80, contest: 0.40,   // ink share to take a zone / to neutralise the other team's
  rateCenter: 1,              // points / s holding the centre
  rateHome: 0.5,              // … holding the side zone on your own half (closer to your spawn)
  rateAway: 2,                // … holding the side zone on the other team's half
  penaltyK: 0.75,             // penalty = ROUND(0.75 × (start − end)) (+1 if start was 100)
  gaugeHeld: 4.5,             // special points / s for the team NOT holding the objective
  gaugeNeutral: 1.5,          // … for the team behind while nobody holds it
  overtimeGrace: 10,          // s off the objective before overtime ends against the team behind
  overtimeMax: 300,           // overtime cap (s)
  sampleHz: 5,                // coverage checks per second
};

export const DIFFICULTY = {
  // aimOmega / aimTurn: bot aim spring stiffness (rad/s) and turn-rate cap (rad/s) — see bots.js
  easy:   { id: 'easy',   name: '简单',  reaction: 0.55, aimError: 0.11, fireDiscipline: 0.55, awareness: 16, aimOmega: 9,  aimTurn: 7 },
  normal: { id: 'normal', name: '普通',  reaction: 0.32, aimError: 0.06, fireDiscipline: 0.8,  awareness: 21, aimOmega: 13, aimTurn: 10 },
  hard:   { id: 'hard',   name: '困难', reaction: 0.17, aimError: 0.03, fireDiscipline: 0.95, awareness: 26, aimOmega: 18, aimTurn: 14 },
};

// Every stage can be played by day or at dusk: `times` maps the time of day to an environment theme (`theme` is the
// stage's day look, kept for older callers). Pick with mapTheme(map, time).
export const TIMES = ['day', 'dusk'];
export const mapTheme = (map, time = 'day') => (map && map.times && map.times[time]) || (map && map.theme) || 'day';

export const MAPS = [
  { id: 'tidewater', name: '潮水广场', blurb: '维多利亚风格的海滨广场：在朱比利钟塔周围、柱廊之下与海滨长廊上一决高下。', theme: 'day', times: { day: 'day', dusk: 'sunset' } },
  { id: 'kelpline', name: '海带线码头', blurb: '换班时分的集装箱码头：一座龙门吊横跨码头，两侧停泊着货轮。当心落水。', theme: 'day', times: { day: 'day', dusk: 'sunset' } },
  { id: 'halyard', name: '帆索游艇港', blurb: '漂浮的码头、架上支架的拖船，还有一艘汽车渡轮停在场地中央。当心落水。', theme: 'golden', times: { day: 'golden', dusk: 'sunset' } },
  { id: 'saltpan', name: '盐田湾', blurb: '开阔的晒盐场：下沉的盐池与木板道环绕着一座风车泵，棚屋顶和盐堆是制高点。', theme: 'day', times: { day: 'day', dusk: 'sunset' } },
  { id: 'crossmarket', name: '十字路口集市', blurb: '狭窄的店铺街与铁艺连廊环抱着玻璃市场大厅，3 号电车在时钟下静候。', theme: 'golden', times: { day: 'golden', dusk: 'sunset' } },
  { id: 'lockgate', name: '闸门运河', blurb: '砖砌仓库区中放空水位的船闸：运河把地图一分为二，务必守住桥与闸门。', theme: 'day', times: { day: 'day', dusk: 'sunset' } },
  { id: 'terraces', name: '台地高地', blurb: '白墙的山腰村落：守住台地，争夺阶梯，空降到小广场上。', theme: 'golden', times: { day: 'golden', dusk: 'sunset' } },
  // (src/world/stages/cargo, ported from PR #8's rebuilt Kelpline) — online only, humans only, never a Boss Battle
  { id: 'cargo', name: '集装箱码头', blurb: '换班时分的集装箱码头：一座龙门吊横跨码头，两侧停泊着集装箱货轮。', theme: 'day', times: { day: 'day', dusk: 'sunset' }, onlineOnly: true, noBots: true, noBoss: true },
];
// Stage rules (a MAPS entry's flags), enforced by the lobby host (net/session.js, net/mock.js), the menus and main.js:
//   onlineOnly  only in the online lobby's stage picker — never the offline Play flow (Turf War or Boss Battle)
//   noBots      humans only: "fill with bots" is forced off, a match needs 2+ players with one on each side, and a player
//               who leaves mid-match is removed instead of handed to a bot; the menu backdrop runs without bots too
//   noBoss      never a Boss Battle stage (a boss room switches away from it)
export const mapById = (id) => MAPS.find((m) => m.id === id) || null;
export const mapNoBots = (id) => !!mapById(id)?.noBots;
export const mapBossOk = (id) => !!mapById(id) && !mapById(id).noBoss;
export const mapOfflineOk = (id) => !!mapById(id) && !mapById(id).onlineOnly;
export const OFFLINE_MAPS = MAPS.filter((m) => !m.onlineOnly);
// a boss-eligible stage to fall back to (the preferred one if it qualifies)
export const bossFallbackMap = (prefer) => (mapBossOk(prefer) ? prefer : (MAPS.find((m) => !m.noBoss && !m.onlineOnly) || MAPS[0]).id);
// Why a humans-only room can't start yet (null when it can, or when the stage allows bots): lobby = { map, players }
export function noBotsStartBlock(lobby) {
  if (!lobby || !mapNoBots(lobby.map)) return null;
  const ps = lobby.players || [];
  if (ps.length < 2) return '此场地没有机器人，至少需要 2 名玩家';
  if (!ps.some((p) => p.team === 0) || !ps.some((p) => p.team === 1)) return '双方队伍都需要至少 1 名玩家';
  return null;
}

export const BOT_NAMES = [
  '咸鱼一条', '墨渍渍', '浪里条', '墨汁拌饭', '小墨点', '珊瑚糖', '离岸流', '海苔卷', '寿喜烧', '柠檬皮',
  '海带结', '滴答墨', '章鱼烧', '糖粒粒', '泡泡浴', '混世蘑', '小朱诺', '芥末墩', '气泡水', '绕圈圈',
];

// ---- Progression ----
export const PROGRESSION = {
  xpForLevel: (lvl) => 800 + lvl * 350,
  xpWin: 1200, xpLose: 500, xpPerTurfPoint: 1.0, xpPerSplat: 40,
  // Zone Control (5 min, so more turf gets inked than in a 3 min Turf War): turf counts for less, ink laid on the live
  // zone counts extra, and a knockout win pays a flat bonus — a typical match lands close to a Turf War's XP
  zones: { turfScale: 0.6, xpPerZoneTurfPoint: 1.0, xpKnockout: 300 },
};

// ---- On-screen touch controls (src/core/touch.js) ----
export const TOUCH = {
  // Button cluster geometry, in multiples of the step unit `u`. `u` follows the short screen edge so the cluster keeps
  // its proportions in landscape; it is NOT the UI's --u, which collapses to under half its design size on a phone and
  // would leave the buttons too small to hit.
  stepFrac: 0.062,          // u = min(viewport w, h) * stepFrac, clamped to the two values below
  minStep: 22,              // never smaller (the fire button is ~3 steps across ⇒ a ~44dp+ target)
  maxStep: 42,
  edgeSteps: 1.4,           // keep this far (in steps) off the screen edge …
  edgeMin: 34,              // … but never closer than this in px: Android's back gesture owns the edge and cancels touches
  stickR: 4.6,              // movement stick radius, in steps
  topGuard: 0.16,           // the stick never starts above this fraction of the screen height
  // Camera gain for touch look. The mouse path is calibrated for pointer-lock counts, which are unbounded; a drag is
  // bounded by the screen, so a full-width swipe has to be able to turn you around. Scaled by settings.touchSensitivity.
  lookSens: 0.0052,         // radians per CSS pixel (~2.5x the mouse's 0.0021)
  // Floors for the RENDERER's image settings on a touch device (see rendererQuality). A 3x phone screen shows the
  // tier's desktop-calibrated 0.75 pixel ratio and zero anti-aliasing as heavy jaggies; these raise only those two.
  minPixelRatio: 1.5,
  minMsaa: 2,
  // GPU memory is the binding constraint on a phone, not frame time: Chromium evicts its own compositor shared
  // images when the GPU process runs short, which shows up as DOM tiles failing to rasterise (the loading screen
  // turns to noise) long before the WebGL context itself is lost.
};

// ---- Settings defaults (persisted in localStorage 'inkwave.settings') ----
export const DEFAULT_SETTINGS = {
  sensitivity: 1.0,         // mouse multiplier 0.2..3
  padSensitivity: 1.0,
  invertY: false,
  fov: 82,                  // horizontal FOV at 16:9, 65..100
  quality: 'high',          // 'low' | 'medium' | 'high' | 'ultra'
  qualityChosen: false,     // set when the player picks a tier in the settings; the touch default only applies while false
  shadowsChosen: false,     // …and the same for shadows, which the touch default also overrides — tracked separately
                            // so that picking a quality does not drag the shadow setting along with it
  shadows: true,
  bloom: true,
  cameraShake: 1.0,         // 0..1
  showFps: false,
  fpsCap: 0,                // frame rate limit: 0 = match the display (120 on ProMotion Macs), else 60 / 30
  master: 0.8, music: 0.6, sfx: 0.85,
  colorblind: false,
  minimap: true,
  matchLength: 180,
  lastMode: 'turf',         // battle mode last picked on the stage select: 'turf' | 'zones'
  difficulty: 'normal',
  rumble: 1.0,              // gamepad vibration 0..1 (only while the pad is the last-used device)
  aimAssist: 1.0,           // gamepad aim assist 0..1
  aimAssistMouse: false,    // optional aim assist for mouse
  touchControls: 'auto',    // on-screen controls: 'auto' (decide by device) | 'on' | 'off'
  touchSensitivity: 1.0,    // touch look multiplier 0.2..3
  touchInvertY: false,      // kept separate from invertY: the natural touch mapping is usually the opposite of the mouse's
};

// The renderer's view of the quality tier. Touch devices default to `low` for its MEMORY footprint (small atlas,
// small shadow map) — that part is load-bearing on a phone — but its image settings are calibrated for a desktop
// monitor: pixelRatio 0.75 and msaa 0 together render the scene at three-quarters of CSS resolution with no
// anti-aliasing at all, which on a 3x phone screen is a field of jaggies. Sharpen those two knobs only; the
// storage-related fields (paintAtlas, shadowSize, particles) stay exactly as the tier defines them.
export function rendererQuality(settings, touch) {
  const q = QUALITY[settings?.quality] || QUALITY.high;
  if (!touch) return q;
  return { ...q, pixelRatio: Math.max(q.pixelRatio, TOUCH.minPixelRatio), msaa: Math.max(q.msaa, TOUCH.minMsaa) };
}

// Quality presets consumed by the renderer + fx.
export const QUALITY = {
  // pixelRatio = cap on devicePixelRatio (Retina screens render at up to this density)
  low:    { pixelRatio: 0.75, shadowSize: 1024, msaa: 0, bloom: false, ao: false, paintAtlas: 2048, particles: 0.4 },
  medium: { pixelRatio: 1.0,  shadowSize: 2048, msaa: 2, bloom: true,  ao: false, paintAtlas: 2048, particles: 0.7 },
  high:   { pixelRatio: 1.5,  shadowSize: 4096, msaa: 4, bloom: true,  ao: true,  paintAtlas: 4096, particles: 1.0 },
  ultra:  { pixelRatio: 2.0,  shadowSize: 4096, msaa: 4, bloom: true,  ao: true,  paintAtlas: 4096, particles: 1.0 },
};
