// « Notre Père dans ma chambre » — test 40 s, Mid-century Cartoon.
// Une pièce en aplats, une enfant dont le corps est un dessin tenu (yeux et mains jouent), la caméra sur son pied.
// Tout est dessiné en coordonnées monde 1920×1080 puis cadré par la caméra ; les cels sont décalés et re-tirés sur deux.
import { PAL, setClock, shape, ink, plane, ellipse, rrect, rect, spline, xform, move, text, fit, measure, star, sparkle, starPts, dashed, paperFinish, reg, path, clamp, lerp, seg, ss, eo, eio, back, twos, TAU, hash } from './engine/toon.js';

export const W = 1920, H = 1080, DUR = 40;
export const COL = {
  paper: '#f3e8d4', ink: '#2a221e', inkSoft: '#4a3f38',
  wallDay: '#ebbfc3', floorDay: '#c98f92', wallNight: '#d19ea8', floorNight: '#9d6a74',
  bed: '#f6efe2', bedD: '#e4d6bd', pillow: '#fbf6ea', quilt: '#b9a7da', quiltD: '#9a87c0',
  door: '#a7714a', doorD: '#7e5234', wood: '#b07a52', woodD: '#8a5a3a',
  moon: '#f7eccf', moonD: '#e2cf9c', sky: '#3e4b7c', skyD: '#33406c',
  rabbit: '#a9c49a', rabbitD: '#86a378', tomato: '#d6604a',
  skin: '#5b3a2c', skinD: '#45291e', iris: '#6b3b22', cheek: '#d98a8a', hair: '#231614',
  bow: '#f2c33c', bowD: '#c9961e', pyj: '#f6dc85', pyjD: '#dcbf64',
  gold: '#f0b43a', goldL: '#f7d27a', papaShirt: '#8a5a3a', papaPants: '#7d7f88', silhouette: '#2e221c',
  accent: '#e0a52d',
};
let CUES = [], EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(4), type, ...o });
export function setup(cues) { CUES = cues.map(c => ({ ...c, t1: Math.min(DUR, c.t1 + 0.3) })); buildEvents(); }
export const events = () => EVS;
export const srtCues = () => CUES.map(c => ({ t0: c.t0, t1: c.t1, text: c.text }));

// ------------------------------------------------------------------ outils
const pop = (t, t0, d = 0.26) => back(seg(t, t0, t0 + d), 1.9);
function cam(ctx, c) { ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy); }
const w2s = (x, y, c) => [W / 2 + c.z * (x - c.cx), H / 2 + c.z * (y - c.cy)];
const mixc = (c, k) => { const [a, b] = [c[0], c[1]]; return { cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k) }; };
const scalePts = (pts, k, cx, cy) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
const center = pts => { let sx = 0, sy = 0; for (const p of pts) { sx += p[0]; sy += p[1]; } return [sx / pts.length, sy / pts.length]; };
// un cel qui se pose : l'aplat « pop » (back-ease), le trait s'écrit 0,2 s plus tard
function cel(ctx, pts, o, t, t0) {
  const k = pop(t, t0); if (k <= 0) return false;
  const [cx, cy] = center(pts);
  const P = k === 1 ? pts : scalePts(pts, k, cx, cy);
  if (o.fill) shape(ctx, P, { ...o, line: 0 });
  if (o.line) { const u = seg(t, t0 + 0.2, t0 + 0.6); if (u >= 1) ink(ctx, pts, o.line, { closed: true, breaks: o.breaks ?? 0.18, seed: o.seed ?? 1, color: o.lineColor }); else if (u > 0) ink(ctx, [...pts, pts[0]], o.line, { closed: false, upto: u, breaks: o.breaks ?? 0.18, seed: o.seed ?? 1, taper: false, color: o.lineColor }); }
  return true;
}
function clipScreenRect(ctx, x, y, w, h) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.restore(); ctx.clip(); }

// ------------------------------------------------------------------ caméra (le pied)
const WIDE = { cx: 960, cy: 540, z: 1 }, MED1 = { cx: 1400, cy: 600, z: 1.4 }, MED2 = { cx: 1420, cy: 560, z: 1.6 }, WIN = { cx: 940, cy: 400, z: 1.9 }, MED3 = { cx: 1400, cy: 560, z: 1.5 };
export function camera(t) {
  if (t < 6) return WIDE;
  if (t < 12.8) return mixc([WIDE, MED1], ss(seg(t, 6, 12.8)));
  if (t < 24.1) return MED1;
  if (t < 30.1) return MED2;
  if (t < 31.6) return mixc([MED2, WIDE], eio(seg(t, 30.1, 31.6)));
  if (t < 32.7) return WIDE;
  if (t < 34.8) return mixc([WIDE, WIN], eio(seg(t, 32.7, 34.2)));
  if (t < 36.3) return MED3;
  return mixc([MED3, WIDE], eio(seg(t, 36.3, 36.8)));
}

// ------------------------------------------------------------------ le ciel de la fenêtre ronde (coordonnées locales au cercle)
export function sky(ctx, t, sc = 1, o = {}) {
  ctx.save(); ctx.scale(sc, sc);
  plane(ctx, rect(-900, -900, 1800, 1800), COL.sky, { grain: 0.2 });
  // polka dots (étoiles lointaines) et étoiles papier
  const R = 300;
  for (let i = 0; i < 14; i++) { const a = hash(i, 3) * TAU, r = 60 + hash(i, 4) * (R - 60); const x = Math.cos(a) * r, y = Math.sin(a) * r; if (Math.hypot(x - 40, y + 30) < 95) continue; shape(ctx, ellipse(x, y, 4, 4, 8), { fill: COL.paper, line: 0, grain: 0, off: [0, 0], alpha: 0.8 }); }
  const stars = [[-120, -110, 16, 3.7], [110, 95, 13, 4.2], [-60, 120, 11, 4.7], [150, -140, 10, 4.5]];
  stars.forEach(([x, y, r, t0], i) => { const k = o.born ? pop(t, t0) : 1; if (k > 0) star(ctx, x, y, r * k, { n: 5, inner: 0.5, fill: COL.paper, off: [0, 0], rot: 0.3 * i, seed: 300 + i }); });
  // la lune : un aplat crème, une seule ombre plate clipée dedans
  const km = o.born ? pop(t, 3.1) : 1;
  if (km > 0) shape(ctx, ellipse(40, -30, 62 * km, 62 * km, 48), { fill: COL.moon, line: 0, grain: 0.25, seed: 310, shade: [{ pts: ellipse(144, -30, 62, 62, 40), color: COL.moonD, alpha: 0.85 }] });
  // deux étincelles atomiques, l'une tourne quand on le lui demande
  const rot = o.spin ? o.spin : 0;
  sparkle(ctx, -150, 40, 20, { fill: COL.paper, rot: rot });
  sparkle(ctx, 125, -40, 12, { fill: COL.paper, rot: 0.6 - rot * 0.5, alpha: 0.9 });
  ctx.restore();
}
const WINC = [880, 410], WINR = 190;
function drawWindow(ctx, t, o = {}) {
  const k = pop(t, 2.6); if (k <= 0) return;
  const r = WINR * k, [cx, cy] = WINC;
  shape(ctx, ellipse(cx, cy, r + 26, r + 26, 72), { fill: COL.paper, line: 4.5, seed: 320, grain: 0.15, breaks: 0.08 });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.translate(cx, cy); sky(ctx, t, k, { born: true, spin: o.spin }); ctx.restore();
  ink(ctx, ellipse(cx, cy, r, r, 72), 4.5, { closed: true, seed: 321, breaks: 0.12 });
}

// ------------------------------------------------------------------ la chambre
const FLOOR = 760;
function drawRoom(ctx, t, c, S) {
  const night = ss(seg(t, 12.8, 13.8));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
  // mur et sol : un plan par scène ; la nuit arrive par essuyage haut → bas (en écran)
  plane(ctx, rect(-3000, -3000, 8000, 3000 + FLOOR), t < 0.5 ? COL.paper : COL.wallDay, { grain: 0.22 });
  if (t >= 0.5) {
    const kw = pop(t, 0.5); if (kw < 1) { ctx.save(); ctx.fillStyle = COL.paper; ctx.fillRect(-3000, -3000, 8000, 3000 + FLOOR); ctx.globalAlpha = clamp(kw); ctx.restore(); }
  }
  if (t >= 1.0) { const kf = pop(t, 1.0); plane(ctx, rect(-3000, FLOOR + (1 - clamp(kf)) * 400, 8000, 3000), COL.floorDay, { grain: 0.25 }); }
  if (night > 0) {
    ctx.save(); clipScreenRect(ctx, 0, 0, W, H * night);
    plane(ctx, rect(-3000, -3000, 8000, 3000 + FLOOR), COL.wallNight, { grain: 0.22 });
    plane(ctx, rect(-3000, FLOOR, 8000, 3000), COL.floorNight, { grain: 0.25 });
    ctx.restore();
    if (night < 1) ink(ctx, [[-3000, c.cy + (H * night - H / 2) / c.z], [5000, c.cy + (H * night - H / 2) / c.z]], 5 / c.z, { seed: 330, breaks: 0.1 });
  }
  // la ligne d'horizon, avec ses trous
  if (t >= 0.8) ink(ctx, [[-200, FLOOR], [2200, FLOOR]], 4.5, { seed: 331, breaks: 0.42, upto: seg(t, 0.8, 1.6), taper: false });
  // la bande de lumière dorée (le plan signature : un essuyage de couleur sur le sol)
  if (S.band > 0) {
    const k = S.band, P = [[172, FLOOR + 2], [392, FLOOR + 2], [392 + k * 760, FLOOR + 2 + k * 62], [172 + k * 900, FLOOR + 2 + k * 330]];
    plane(ctx, P, COL.goldL, { grain: 0.2, alpha: 0.92 });
  }
  drawDoor(ctx, t, S);
  // la guirlande d'étoiles
  if (t >= 5.2) {
    const line = spline([[430, 88], [700, 132], [960, 144], [1220, 132], [1500, 92]], false, 10);
    ink(ctx, line, 3, { seed: 340, breaks: 0.15, upto: seg(t, 5.2, 5.9) });
    [0.1, 0.26, 0.42, 0.58, 0.74, 0.9].forEach((u, i) => {
      const k = pop(t, 5.35 + i * 0.1); if (k <= 0) return;
      const i0 = Math.min(line.length - 1, Math.round(u * (line.length - 1))), [x, y] = line[i0];
      ink(ctx, [[x, y], [x, y + 22]], 2.2, { seed: 341 + i, taper: false });
      star(ctx, x, y + 38, 17 * k, { n: 5, inner: 0.5, fill: COL.bow, line: 2.6, seed: 350 + i, rot: 0.2 * i });
    });
  }
  drawWindow(ctx, t, { spin: S.spin });
  // la table de nuit et la veilleuse lune
  cel(ctx, rect(1790, 640, 112, 160), { fill: COL.wood, line: 4, seed: 360, grain: 0.3, shade: [{ pts: rect(1870, 630, 60, 180), color: COL.woodD, alpha: 0.6 }] }, t, 8.4);
  if (t >= 8.6) ink(ctx, [[1808, 700], [1884, 700]], 3, { seed: 361, breaks: 0.2 });
  if (t >= 8.9) {
    const kl = pop(t, 8.9);
    if (S.lamp > 0) plane(ctx, ellipse(1846, 590, 86 * S.lamp, 86 * S.lamp, 40), COL.goldL, { grain: 0.1, alpha: 0.75 });
    shape(ctx, rrect(1828, 622, 36, 18, 5), { fill: COL.woodD, line: 3, seed: 362, grain: 0.2 });
    const moon = spline([[1846 - 38, 592], [1846 - 20, 560], [1846 + 14, 550], [1846 + 36, 566], [1846 + 20, 576], [1846 + 10, 598], [1846 + 20, 622], [1846 - 10, 626]], true, 6);
    shape(ctx, scalePts(moon, kl, 1846, 592), { fill: COL.moon, line: 3.5, seed: 363, grain: 0.2, breaks: 0.15 });
  }
  // le lit : base, montants, oreiller
  cel(ctx, rect(1120, 640, 640, 160), { fill: COL.bed, line: 4.2, seed: 370, grain: 0.3, shade: [{ pts: rect(1100, 740, 700, 80), color: COL.bedD, alpha: 0.8 }] }, t, 6.3);
  if (t >= 6.3) { [1140, 1720].forEach((x, i) => shape(ctx, rect(x, 798, 26, 24), { fill: COL.woodD, line: 3, seed: 372 + i, grain: 0.2 })); }
  cel(ctx, [...spline([[1716, 640], [1716, 500], [1730, 470], [1770, 470], [1784, 500], [1784, 640]], false, 6)], { fill: COL.bedD, line: 4, seed: 374, grain: 0.3 }, t, 6.45);
  cel(ctx, rrect(1548, 548, 176, 92, 30), { fill: COL.pillow, line: 3.8, seed: 376, grain: 0.2 }, t, 6.7);
  // le lapin en peluche, assis au pied du lit
  drawRabbit(ctx, t, 1188, 640);
}
function drawRabbit(ctx, t, x, y) {
  const k = pop(t, 9.4); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  [[-16, -112], [16, -112]].forEach(([ex, ey], i) => shape(ctx, ellipse(ex, ey, 11, 34, 20, 0, TAU, i ? 0.18 : -0.18), { fill: COL.rabbit, line: 3.2, seed: 380 + i, grain: 0.25, shade: [{ pts: ellipse(ex, ey, 5, 22, 14), color: COL.cheek, alpha: 0.55 }] }));
  shape(ctx, ellipse(0, -34, 32, 36, 30), { fill: COL.rabbit, line: 3.4, seed: 382, grain: 0.3, shade: [{ pts: rect(10, -80, 40, 60), color: COL.rabbitD, alpha: 0.5 }] });
  shape(ctx, ellipse(0, -78, 27, 25, 28), { fill: COL.rabbit, line: 3.4, seed: 383, grain: 0.25 });
  shape(ctx, ellipse(0, -72, 6, 4.5, 10), { fill: COL.tomato, line: 0, grain: 0, off: [0, 0] });
  [-11, 11].forEach((ex, i) => shape(ctx, ellipse(ex, -84, 3.2, 3.6, 8), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] }));
  ink(ctx, spline([[-8, -64], [0, -60], [8, -64]], false, 4), 2.4, { seed: 385 });
  ctx.restore();
}
// la porte en bois, à gauche ; elle s'ouvre sur deux en trois dessins ; Papa en silhouette dans l'embrasure
const DOOR = { x: 150, y: 300, w: 240, h: FLOOR - 300 };
function drawDoor(ctx, t, S) {
  const k = pop(t, 1.6); if (k <= 0) return;
  const d = DOOR, open = S.door; // 0 fermée, 1 entrouverte, 2 ouverte
  if (open > 0) {
    plane(ctx, scalePts(rect(d.x, d.y, d.w, d.h), k, d.x + d.w / 2, d.y + d.h / 2), COL.gold, { grain: 0.15 });
    drawPapa(ctx, t, S);
  }
  const pw = open === 0 ? d.w : open === 1 ? 150 : 62;
  const panel = rect(d.x, d.y, pw, d.h);
  cel(ctx, panel, { fill: open === 0 ? COL.door : COL.doorD, line: 4.5, seed: 390, grain: 0.3, breaks: 0.15, shade: open === 0 ? [{ pts: rect(d.x + d.w - 40, d.y, 40, d.h), color: COL.doorD, alpha: 0.7 }] : null }, t, 1.6);
  if (t >= 2.1 && open === 0) {
    ink(ctx, rrect(d.x + 34, d.y + 40, d.w - 68, 170, 10), 3, { closed: true, seed: 391, breaks: 0.25 });
    ink(ctx, rrect(d.x + 34, d.y + 240, d.w - 68, 180, 10), 3, { closed: true, seed: 392, breaks: 0.25 });
    shape(ctx, ellipse(d.x + d.w - 34, d.y + 236, 11, 11, 12), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] });
  } else if (open > 0) {
    shape(ctx, ellipse(d.x + pw - 14, d.y + 236, 9, 11, 12), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] });
  }
  // le chambranle
  if (t >= 2.3) ink(ctx, [[d.x - 10, FLOOR], [d.x - 10, d.y - 10], [d.x + d.w + 10, d.y - 10], [d.x + d.w + 10, FLOOR]], 4, { seed: 393, breaks: 0.2, upto: seg(t, 2.3, 2.9) });
}
// Papa : debout (planche) ou en silhouette dans la porte (film)
export function drawPapa(ctx, t, S, o = {}) {
  const k = o.k ?? pop(t, 37.6, 0.3); if (k <= 0) return;
  const x = o.x ?? 300, y = o.y ?? FLOOR, s = (o.s ?? 0.78) * k, sil = o.sil ?? true;
  const col = (c) => sil ? COL.silhouette : c;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const G = sil ? { line: 0, grain: 0.1, breaks: 0, alpha: 0.97 } : { line: 4.2, grain: 0.3, breaks: 0.15 };
  // jambes (pantalon gris)
  shape(ctx, [[-58, -240], [-6, -240], [-12, -8], [-52, -8]], { fill: col(COL.papaPants), seed: 400, ...G });
  shape(ctx, [[6, -240], [58, -240], [52, -8], [12, -8]], { fill: col(COL.papaPants), seed: 401, ...G });
  [-32, 32].forEach((fx, i) => shape(ctx, spline([[fx - 26, -10], [fx + 4, -14], [fx + 30, -4], [fx + 26, 2], [fx - 26, 2]], true, 4), { fill: col(COL.ink), line: 0, off: [0, 0], grain: 0 }));
  // chemise de travail brune, manches retroussées, bras : un sur le bord de la porte, l'autre le long du corps
  shape(ctx, spline([[-80, -400], [-62, -422], [62, -422], [80, -400], [68, -236], [-68, -236]], true, 6), { fill: col(COL.papaShirt), seed: 402, ...G, shade: sil ? null : [{ pts: rect(30, -430, 60, 200), color: COL.woodD, alpha: 0.5 }] });
  if (!sil) { ink(ctx, [[-10, -418], [0, -300]], 3, { seed: 403, breaks: 0.3 }); [[-336], [-360], [-384]].forEach(([yy], i) => shape(ctx, ellipse(2, yy, 4, 4, 8), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] })); }
  const sleeve = (sh, el, ha, seed) => { const P = spline([sh, el, ha], false, 6); ink(ctx, P, 30, { seed, taper: false, wob: 0.06, color: sil ? COL.silhouette : COL.ink, alpha: sil ? 0.97 : 1 }); if (!sil) { const r = reg(seed, 1); ink(ctx, move(subpathHalf(P), r[0] * .6, r[1] * .6), 20, { seed: seed + 1, taper: false, wob: .05, color: COL.papaShirt }); } ink(ctx, P.slice(Math.floor(P.length * 0.5)), 20, { seed: seed + 2, taper: false, wob: 0.05, color: col(COL.skin), alpha: sil ? 0.97 : 1 }); };
  sleeve([-70, -400], [-100, -320], [-92, -240], 410);
  sleeve([70, -400], [104, -330], [80, -262], 414);
  [[-92, -240, 1.3, -1], [80, -262, 1.1, 1]].forEach(([hx, hy, a, side], i) => drawHandA(ctx, hx, hy, a, 'open', side, 1.05, col(COL.skin), sil));
  // tête en œuf, barbe courte dans le contour, cheveux ras
  const head = spline([[-44, -470], [-34, -520], [0, -536], [34, -520], [44, -470], [40, -436], [20, -418], [-20, -418], [-40, -436]], true, 6);
  shape(ctx, head, { fill: col(COL.skin), seed: 420, ...G });
  shape(ctx, spline([[-42, -452], [-30, -424], [0, -414], [30, -424], [42, -452], [30, -446], [0, -440], [-30, -446]], true, 5), { fill: col(COL.hair), line: 0, seed: 421, grain: 0.2, alpha: sil ? 0.97 : 1 });
  shape(ctx, spline([[-44, -480], [-30, -530], [0, -542], [30, -530], [44, -480], [30, -500], [0, -506], [-30, -500]], true, 5), { fill: col(COL.hair), line: 0, seed: 422, grain: 0.2, alpha: sil ? 0.97 : 1 });
  if (!sil) {
    [-16, 16].forEach((ex, i) => { ink(ctx, [[ex - 9, -484], [ex + 9, -486]], 3.2, { seed: 430 + i }); shape(ctx, ellipse(ex, -474, 4.5, 5.5, 10), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] }); });
    ink(ctx, spline([[-10, -452], [0, -448], [10, -452]], false, 4), 3, { seed: 432 });
    ink(ctx, spline([[2, -472], [-5, -458], [4, -456]], false, 4), 3, { seed: 433 });
  }
  ctx.restore();
}
const subpathHalf = P => P;

// ------------------------------------------------------------------ Aliyah
// repère local : hanches en (0,0), « haut » = −y ; tête ≈ 2,5 têtes de haut (R = 76)
const R = 76, SH = [76, -150], UA = 84, FA = 74;
function ik(sh, target, side) {
  const dx = target[0] - sh[0], dy = target[1] - sh[1]; let d = Math.hypot(dx, dy); const maxd = UA + FA - 3; if (d > maxd) d = maxd; if (d < 20) d = 20;
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((UA * UA + d * d - FA * FA) / (2 * UA * d), -1, 1));
  // le coude va toujours vers l'extérieur du corps (side = +1 bras droit, −1 bras gauche)
  const cand = [a + b, a - b].map(a1 => [sh[0] + Math.cos(a1) * UA, sh[1] + Math.sin(a1) * UA]);
  const el = cand[0][0] * side >= cand[1][0] * side ? cand[0] : cand[1], ha = [sh[0] + Math.cos(a) * d, sh[1] + Math.sin(a) * d];
  return { sh, el, ha, a2: Math.atan2(ha[1] - el[1], ha[0] - el[0]) };
}
// gant cartoon à quatre doigts : tout est contourné d'abord, rempli ensuite (un seul contour autour de l'union)
export function drawHandA(ctx, x, y, a, kind = 'open', side = 1, k = 1, skin = COL.skin, sil = false) {
  const parts = [], seps = [];
  const E = (cx, cy, rx, ry, rot = 0) => parts.push(ellipse(cx, cy, rx, ry, 18, 0, TAU, rot));
  E(12, 0, 15, 13.5);
  if (kind === 'open') { [-0.62, 0, 0.62].forEach(r => E(12 + Math.cos(r) * 25, Math.sin(r) * 25, 12, 5, r)); E(4, -15 * side, 10, 5, -1.35 * side); }
  else if (kind === 'flat') { [-10, 0, 10].forEach((dy, i) => E(34 + (i === 1 ? 3 : 0), dy, 13, 4.8)); E(10, -15 * side, 9, 5, -0.9 * side); seps.push([[24, -5], [40, -5]], [[24, 5], [40, 5]]); }
  else if (kind === 'point') { E(38, -5 * side, 19, 4.8); E(25, 5 * side, 7, 6); E(20, 11 * side, 6, 5.5); E(8, -14 * side, 8.5, 5, -1.0 * side); }
  else { E(26, -8, 6.5, 6.5); E(28, 1, 6.5, 6.5); E(25, 10, 6, 6); E(12, -14 * side, 9, 5.5, -0.4 * side); seps.push([[22, -3.5], [30, -3.5]], [[22, 5.5], [29, 5.5]]); }
  const P = parts.map(p => xform(p, x, y, a, k));
  ctx.save();
  if (!sil) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 6 * k; ctx.lineJoin = 'round'; for (const p of P) { path(ctx, p); ctx.stroke(); } }
  const o = sil ? [0, 0] : reg(77, 0.6); ctx.fillStyle = skin; if (sil) ctx.globalAlpha *= 0.97;
  for (const p of P) { path(ctx, move(p, o[0] * 0.5, o[1] * 0.5)); ctx.fill(); }
  if (!sil) { ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round'; for (const s2 of seps) { const q = xform(s2, x, y, a, k); ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); } }
  ctx.restore();
}
function sleeveA(ctx, J, seed) {
  const P = spline([J.sh, [(J.sh[0] + J.el[0]) / 2, (J.sh[1] + J.el[1]) / 2], J.el, [(J.el[0] + J.ha[0]) / 2, (J.el[1] + J.ha[1]) / 2], J.ha], false, 6);
  ink(ctx, P, 26, { seed, taper: false, wob: 0.08 });
  const o = reg(seed, 1);
  ink(ctx, move(P, o[0] * 0.6, o[1] * 0.6), 17, { seed: seed + 1, taper: false, wob: 0.05, color: COL.pyj });
  const a = J.a2, cx = J.ha[0] - Math.cos(a) * 10, cy = J.ha[1] - Math.sin(a) * 10;
  ink(ctx, [[cx + Math.cos(a + 1.57) * 12, cy + Math.sin(a + 1.57) * 12], [cx - Math.cos(a + 1.57) * 12, cy - Math.sin(a + 1.57) * 12]], 3, { seed: seed + 2, taper: false, color: COL.pyjD });
}
// pose : { x, y, ang (rotation du corps : 0 debout, 1.35 couchée tête à droite), headTilt, eyes:'open'|'shut'|'squeeze'|'wink'|'blink',
//          look:[dx,dy], mouth:'small'|'o'|'smile'|'puff', faceDx, arms:{F:{t:[x,y],kind}, B:{...}} | null, view:'front'|'q'|'side'|'back', tension }
export function drawAliyah(ctx, P, parts = { torso: true, arms: true, head: true }) {
  ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(P.ang || 0);
  const s = P.s ?? 1; ctx.scale(s, s);
  const view = P.view || 'front';
  if (parts.torso) {
    // pyjama jaune pâle : un aplat, une ombre plate à droite, le col, l'étoile
    const torso = spline([[-96, 4], [-90, -120], [-76, -168], [76, -168], [90, -120], [96, 4]], true, 6);
    shape(ctx, torso, { fill: COL.pyj, line: 4.2, seed: 500, grain: 0.35, breaks: 0.2, shade: view === 'front' ? [{ pts: rect(40, -180, 70, 200), color: COL.pyjD, alpha: 0.45 }] : null });
    if (view !== 'back') {
      ink(ctx, [[-30, -168], [0, -140], [30, -168]], 3.2, { seed: 501, breaks: 0.1 });
      ink(ctx, [[0, -140], [0, -40]], 2.4, { seed: 502, breaks: 0.35 });
      [-110, -80].forEach((yy, i) => shape(ctx, ellipse(0, yy, 4, 4, 8), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] }));
      if (view === 'front') star(ctx, 46, -108, 20, { n: 5, inner: 0.5, fill: COL.paper, line: 2.6, seed: 503 });
    }
    // cou
    shape(ctx, rect(-20, -186, 40, 30), { fill: COL.skin, line: 0, seed: 504, grain: 0.1 });
  }
  if (parts.head) drawHeadA(ctx, P, view);
  if (parts.arms && P.arms) {
    for (const which of ['B', 'F']) {
      const A = P.arms[which]; if (!A) continue;
      const sideX = which === 'F' ? 1 : -1, sh = [SH[0] * sideX, SH[1]];
      const J = ik(sh, A.t, sideX);
      sleeveA(ctx, J, which === 'F' ? 510 : 520);
      drawHandA(ctx, J.ha[0], J.ha[1], A.a ?? J.a2, A.kind || 'open', which === 'F' ? -1 : 1, 1, COL.skin);
    }
  }
  ctx.restore();
}
function drawHeadA(ctx, P, view) {
  ctx.save(); ctx.translate(0, -170 - R + 8); ctx.rotate(P.headTilt || 0);
  const look = P.look || [0, 0], fdx = P.faceDx || 0;
  // puffs arrière (vue de dos / profil : derrière la tête)
  const puff = (cx, cy, r, seed) => { const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, rr = r * (1 + 0.1 * Math.sin(a * 9 + seed)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return spline(pts, true, 3); };
  const bow = (cx, cy, rot) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(0.85, 0.85); shape(ctx, [[0, 0], [-26, -16], [-26, 14]], { fill: COL.bow, line: 2.8, seed: 530, grain: 0.2, breaks: 0.1 }); shape(ctx, [[0, 0], [26, -14], [26, 16]], { fill: COL.bow, line: 2.8, seed: 531, grain: 0.2, breaks: 0.1 }); shape(ctx, ellipse(0, 0, 7, 7, 10), { fill: COL.bowD, line: 2.4, seed: 532, grain: 0 }); ctx.restore(); };
  const headPts = view === 'side'
    ? [...spline([[46, -10], [40, -54], [10, -76], [-30, -72], [-56, -40], [-60, 10], [-40, 56], [0, 74], [30, 66], [44, 44], [48, 20]], false, 6), [66, 12], [60, 26], [48, 30]]  // le nez dans le contour
    : view === 'q' ? [...spline([[54, -16], [44, -58], [8, -78], [-34, -70], [-62, -36], [-64, 12], [-46, 54], [-4, 74], [34, 64], [50, 40], [54, 20]], false, 6), [70, 14], [64, 28], [54, 32]]
      : spline([[-64, -30], [-44, -64], [0, -78], [44, -64], [64, -30], [62, 18], [42, 60], [0, 76], [-42, 60], [-62, 18]], true, 6);
  if (view === 'back') {
    shape(ctx, headPts, { fill: COL.hair, line: 4, seed: 540, grain: 0.25, breaks: 0.15 });
    shape(ctx, puff(-62, -52, 40, 1), { fill: COL.hair, line: 4, seed: 541, grain: 0.3, breaks: 0.15 }); shape(ctx, puff(62, -52, 40, 2), { fill: COL.hair, line: 4, seed: 542, grain: 0.3, breaks: 0.15 });
    bow(-46, -22, 0.4); bow(46, -22, -0.4);
    ctx.restore(); return;
  }
  // visage
  shape(ctx, headPts, { fill: COL.skin, line: 4, seed: 543, grain: 0.15, breaks: 0.15 });
  // calotte de cheveux : un aplat encre au sommet, bord bouclé
  const cap = view === 'side'
    ? spline([[-58, -30], [-50, -60], [-20, -80], [20, -78], [46, -60], [48, -44], [30, -52], [10, -46], [-10, -54], [-30, -46], [-48, -24]], true, 5)
    : view === 'q' ? spline([[-64, -26], [-54, -62], [-20, -82], [24, -80], [52, -60], [56, -44], [36, -56], [14, -48], [-10, -56], [-34, -48], [-56, -22]], true, 5)
      : spline([[-66, -22], [-58, -58], [-26, -82], [26, -82], [58, -58], [66, -22], [52, -40], [30, -52], [8, -44], [-16, -52], [-38, -42], [-54, -36]], true, 5);
  shape(ctx, cap, { fill: COL.hair, line: 0, seed: 544, grain: 0.25 });
  // les deux couettes afro bouclées, nœud jaune à la base
  const puffs = view === 'side' ? [[-70, -56, 44, 1, true], [10, -92, 30, 2, false]] : view === 'q' ? [[-74, -52, 42, 1, true], [48, -78, 34, 2, true]] : [[-72, -54, 42, 1, true], [72, -54, 42, 2, true]];
  puffs.forEach(([cx, cy, r, sd, withBow]) => { shape(ctx, puff(cx, cy, r, sd), { fill: COL.hair, line: 4, seed: 545 + sd, grain: 0.3, breaks: 0.18 }); if (withBow) bow(cx + (cx < 0 ? 20 : -20), cy + 12, cx < 0 ? 0.6 : -0.6); });
  // traits du visage (décalés quand la tête se tourne)
  ctx.save(); ctx.translate(fdx, 0);
  const eyesAt = view === 'side' ? [[22, 2, 0.8]] : view === 'q' ? [[-8, 4, 0.85], [36, 2, 1]] : [[-30, 4, 1], [30, 4, 1]];
  eyesAt.forEach(([ex, ey, sx], i) => eyeA(ctx, ex, ey, sx, P, i));
  // nez (vue de face : un petit crochet ; profil : il est dans le contour)
  if (view === 'front') ink(ctx, spline([[4, 16], [-5, 32], [6, 36]], false, 4), 3.2, { seed: 560 });
  else if (view === 'q') ink(ctx, spline([[46, 18], [40, 32]], false, 3), 2.6, { seed: 560 });
  mouthA(ctx, view === 'side' ? 30 : view === 'q' ? 14 : 0, 50, P.mouth || 'small');
  const ch = view === 'side' ? [[6, 32]] : view === 'q' ? [[-24, 32], [52, 30]] : [[-50, 30], [50, 30]];
  ch.forEach(([x, y], i) => shape(ctx, ellipse(x, y, 13, 8, 14), { fill: COL.cheek, line: 0, grain: 0, seed: 570 + i, alpha: P.mouth === 'puff' ? 0.75 : 0.5 }));
  ctx.restore();
  ctx.restore();
}
function eyeA(ctx, x, y, sx, P, i) {
  const e = P.eyes || 'open', look = P.look || [0, 0];
  if (e === 'shut' || e === 'blink' || (e === 'wink' && i === 1)) {
    ink(ctx, spline([[x - 16 * sx, y - 2], [x, y + 6], [x + 16 * sx, y - 2]], false, 4), 4, { seed: 580 + i, taper: true });
    ink(ctx, [[x - 18 * sx, y - 26], [x + 18 * sx, y - 28]], 3.4, { seed: 590 + i, taper: true });
    return;
  }
  if (e === 'squeeze') {
    const j = P.tension || 0;
    ink(ctx, spline([[x - 20 * sx, y - 6 + j], [x, y + 10], [x + 20 * sx, y - 6 - j]], false, 4), 6.5, { seed: 580 + i, taper: true, wob: 0.2 });
    ink(ctx, spline([[x - 20 * sx, y - 26 + j], [x, y - 14], [x + 20 * sx, y - 26 - j]], false, 4), 4.6, { seed: 590 + i, taper: true });
    [-1, 1].forEach(d => { ink(ctx, [[x + d * 24 * sx, y - 2 - j], [x + d * 34 * sx, y - 10]], 3, { seed: 600 + i + d, taper: true }); ink(ctx, [[x + d * 22 * sx, y + 10], [x + d * 32 * sx, y + 16 + j]], 3, { seed: 605 + i + d, taper: true }); });
    return;
  }
  // grands yeux marron : blanc papier, iris, pupille, reflet papier
  shape(ctx, ellipse(x, y, 20 * sx, 25, 20), { fill: COL.paper, line: 3.4, seed: 610 + i, grain: 0, breaks: 0.1 });
  const lx = x + look[0] * sx, ly = y + look[1];
  shape(ctx, ellipse(lx, ly, 13 * sx, 15, 16), { fill: COL.iris, line: 0, grain: 0, off: [1, 1] });
  shape(ctx, ellipse(lx, ly, 7.5 * sx, 8.5, 12), { fill: COL.ink, line: 0, grain: 0, off: [0, 0] });
  shape(ctx, ellipse(lx - 4 * sx, ly - 5, 3.2, 3.6, 8), { fill: COL.paper, line: 0, grain: 0, off: [0, 0] });
  const wide = P.wide ? 6 : 0;
  ink(ctx, spline([[x - 18 * sx, y - 30 - wide], [x, y - 36 - wide], [x + 18 * sx, y - 30 - wide]], false, 4), 3.4, { seed: 620 + i, taper: true });
}
function mouthA(ctx, x, y, m) {
  if (m === 'o') shape(ctx, ellipse(x, y + 2, 12, 15, 16), { fill: COL.skinD, line: 3.2, seed: 630, grain: 0, breaks: 0 });
  else if (m === 'smile') ink(ctx, spline([[x - 18, y - 6], [x - 4, y + 6], [x + 14, y - 8]], false, 5), 3.6, { seed: 631 });
  else if (m === 'puff') ink(ctx, spline([[x - 14, y], [x - 6, y - 4], [x + 2, y + 2], [x + 12, y - 2]], false, 5), 3.4, { seed: 632 });
  else ink(ctx, spline([[x - 10, y - 2], [x, y + 3], [x + 9, y - 2]], false, 5), 3.2, { seed: 633 });
}

// ------------------------------------------------------------------ la pose d'Aliyah au temps t (le jeu : yeux, mains, un intervalle par changement)
const HIPS = [1400, 630];
function blinkAt(t, ts) { return ts.some(b => t >= b && t < b + 0.13); }
function stepPose(t, t0, d = 0.2) { return twos(clamp((t - t0) / d)); }     // transition de pose quantifiée sur deux
const lerpT = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export function aliyahPose(t) {
  const tt = twos(t);
  const P = { x: HIPS[0], y: HIPS[1], ang: 0, headTilt: 0, eyes: 'open', look: [0, 0], mouth: 'small', faceDx: 0, arms: null, lying: false, wide: false };
  if (t < 24.0) {
    P.lying = true; P.ang = 1.35; P.headTilt = -0.55;
    const born = t >= 10.5;
    if (!born) return null;
    P.eyes = t < 12.0 ? 'shut' : 'open';
    if (blinkAt(tt, [15.4, 17.0])) P.eyes = 'blink';
    P.wide = t >= 12.0 && t < 18.8;
    // les pupilles : au plafond (haut de l'écran = côté −y monde, que la rotation de la tête ramène) puis vers la fenêtre (gauche)
    const up = [-2, -9], win = [-9, -4];
    const k = ss(seg(tt, 18.8, 19.1));
    P.look = t < 12.0 ? [0, 0] : lerpT(up, win, k);
    if (t >= 22.7) {
      // les mains sortent de la couette : haussement d'épaules
      const k2 = back(seg(tt, 22.7, 22.95), 1.6);
      P.handsOut = k2;
    }
    return P;
  }
  // assise
  P.ang = t < 24.083 ? 0.62 : 0;
  const rest = { F: { t: [58, -16], kind: 'open', a: -1.2 }, B: { t: [-58, -16], kind: 'open', a: -1.9 } };
  const mega = { F: { t: [84, -206], kind: 'flat', a: -1.75 }, B: { t: [-84, -206], kind: 'flat', a: -1.4 } };
  const fists = { F: { t: [64, -30], kind: 'grip', a: -1.3 }, B: { t: [-64, -30], kind: 'grip', a: -1.8 } };
  const point = { F: { t: [58, -16], kind: 'open', a: -1.2 }, B: { t: [-34, -270], kind: 'point', a: -2.2 } };
  const wave = { F: { t: [112, -250], kind: 'open', a: -1.6 }, B: { t: [-58, -16], kind: 'open', a: -1.9 } };
  const blend = (A, Bp, k) => ({ F: { t: lerpT(A.F.t, Bp.F.t, k), kind: k < 0.5 ? A.F.kind : Bp.F.kind, a: lerp(A.F.a, Bp.F.a, k) }, B: { t: lerpT(A.B.t, Bp.B.t, k), kind: k < 0.5 ? A.B.kind : Bp.B.kind, a: lerp(A.B.a, Bp.B.a, k) } });
  // anticipation : les mains descendent un peu avant de monter
  const anti = (A, t0) => { const k = seg(tt, t0 - 0.12, t0); return k > 0 && k < 1 ? blend(A, { F: { ...A.F, t: [A.F.t[0], A.F.t[1] + 18] }, B: { ...A.B, t: [A.B.t[0], A.B.t[1] + 18] } }, k) : A; };
  if (t < 24.3) { P.arms = anti(rest, 24.3); P.mouth = 'small'; P.wide = true; }
  else if (t < 26.6) { P.arms = blend(rest, mega, eo(stepPose(t, 24.3, 0.22))); P.mouth = 'o'; P.wide = true; P.look = [0, -4]; if (blinkAt(tt, [25.5])) P.eyes = 'blink'; }
  else if (t < 29.6) {
    P.arms = blend(mega, fists, eo(stepPose(t, 26.6, 0.22))); P.eyes = 'squeeze'; P.mouth = 'puff';
    // deux dessins clés qui alternent (tremblement)
    const alt = Math.floor((t - 26.6) * 6) % 2; P.tension = alt ? 3 : -2; P.armJit = alt ? 4 : -3;
  }
  else if (t < 30.1) { P.arms = fists; P.eyes = 'wink'; P.mouth = 'small'; P.look = [-6, -2]; }
  else if (t < 32.5) {
    P.arms = blend(fists, rest, eo(stepPose(t, 30.1, 0.22))); P.mouth = 'small';
    const turn = tt < 30.4 ? 0 : tt < 31.4 ? -1 : 1;
    P.faceDx = turn * 20; P.headTilt = turn * 0.08; P.look = [turn * 7, 0];
    if (blinkAt(tt, [31.0])) P.eyes = 'blink';
  }
  else if (t < 34.8) {
    const k = eo(stepPose(t, 32.5, 0.3));
    P.arms = blend(rest, point, k); P.mouth = 'small'; P.faceDx = -14; P.headTilt = -0.14; P.look = [-8, -7]; P.wide = true;
  }
  else if (t < 38.2) {
    P.arms = blend(point, rest, eo(stepPose(t, 34.8, 0.25))); P.mouth = 'small';
    P.faceDx = -18; P.headTilt = -0.05; P.look = [-9, 1];
    if (blinkAt(tt, [35.2])) P.eyes = 'blink';
    if (t >= 37.3) { P.mouth = 'smile'; P.wide = true; }
  }
  else {
    const k = eo(stepPose(t, 38.3, 0.22));
    P.arms = blend(anti(rest, 38.3), wave, k); P.mouth = 'smile'; P.faceDx = -18; P.headTilt = -0.05; P.look = [-9, 1]; P.wide = true;
    if (t >= 38.6) { P.arms = blend(wave, { F: { ...wave.F, t: [108, -242] }, B: wave.B }, 1); }
  }
  if (P.armJit && P.arms) P.arms = { F: { ...P.arms.F, t: [P.arms.F.t[0] + P.armJit, P.arms.F.t[1]] }, B: { ...P.arms.B, t: [P.arms.B.t[0] - P.armJit, P.arms.B.t[1]] } };
  return P;
}
// la couette lilas à petites étoiles ; son bord haut dépend de la pose
function drawQuilt(ctx, t, lying) {
  const k = pop(t, 7.3); if (k <= 0) return;
  const edge = lying ? [[1130, 606], [1250, 598], [1340, 580], [1400, 540], [1470, 512], [1540, 500], [1600, 508], [1660, 540], [1700, 600], [1740, 650]]
    : [[1130, 606], [1200, 598], [1290, 606], [1380, 598], [1470, 606], [1560, 598], [1640, 606], [1700, 600], [1740, 650]];
  const pts = [...spline(edge, false, 6), [1745, 760], [1130, 760]];
  const [cx, cy] = [1440, 680];
  const P = k < 1 ? scalePts(pts, k, cx, cy) : pts;
  shape(ctx, P, { fill: COL.quilt, line: 4.2, seed: 650, grain: 0.35, breaks: 0.18, shade: [{ pts: rect(1130, 700, 700, 80), color: COL.quiltD, alpha: 0.6 }] });
  if (k >= 1) for (let i = 0; i < 9; i++) { const x = 1170 + (i % 5) * 120 + (i >= 5 ? 60 : 0), y = 650 + (i >= 5 ? 60 : 0); if (lying && x > 1480 && y < 660) continue; star(ctx, x, y, 11, { n: 5, inner: 0.5, fill: COL.paper, off: [0, 0], rot: 0.3 * i, seed: 660 + i }); }
}
function drawAliyahInBed(ctx, t, S) {
  const P = aliyahPose(t);
  const lying = !P || P.lying;
  const hp = { x: P ? P.x : HIPS[0], y: P ? P.y : HIPS[1] };
  if (P) {
    // naissance en cels : tête 10,5 / couettes 10,8 / col 11,3 — on fait apparaître les parties par pop
    const kHead = pop(t, 10.5), kCol = pop(t, 11.3);
    if (lying) {
      if (kCol > 0) { ctx.save(); ctx.translate(hp.x, hp.y); ctx.scale(kCol, kCol); ctx.translate(-hp.x, -hp.y); drawAliyah(ctx, P, { torso: true, arms: false, head: false }); ctx.restore(); }
      drawQuilt(ctx, t, true);
      if (P.handsOut > 0) {
        // deux mains ouvertes qui sortent de la couette, paumes vers le ciel
        const k = P.handsOut;
        [[1488, 536, -1.9, 1], [1436, 606, -1.25, -1]].forEach(([x, y, a, side]) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); ink(ctx, [[x + 14, y + 30], [x, y]], 26, { seed: 670 + side, taper: false, wob: 0.06 }); ink(ctx, [[x + 12, y + 28], [x + 2, y + 4]], 17, { seed: 672 + side, taper: false, wob: 0.05, color: COL.pyj }); drawHandA(ctx, x, y, a, 'open', side, 1, COL.skin); ctx.restore(); });
      }
      if (kHead > 0) { const hc = headWorld(P); ctx.save(); ctx.translate(hc[0], hc[1]); ctx.scale(kHead, kHead); ctx.translate(-hc[0], -hc[1]); drawAliyah(ctx, P, { torso: false, arms: false, head: true }); ctx.restore(); }
    } else {
      if (S.burst > 0) { const hc = headWorld(P); star(ctx, hc[0], hc[1] - 10, 230 * S.burst, { n: 12, inner: 0.72, fill: COL.goldL, off: [0, 0], rot: twos(t) * 0.3, seed: 680, alpha: 0.9 }); }
      drawAliyah(ctx, P, { torso: true, arms: false, head: false });
      drawQuilt(ctx, t, false);
      drawAliyah(ctx, P, { torso: false, arms: true, head: true });
    }
  } else drawQuilt(ctx, t, true);
}
export function headWorld(P) { const a = P.ang || 0, s = P.s ?? 1, y = (-170 - R + 8) * s; return [P.x + Math.sin(a) * -y, P.y + Math.cos(a) * y]; }
function eyesWorld(P) { const hc = headWorld(P), a = (P.ang || 0) + (P.headTilt || 0); return [hc[0] + Math.sin(a) * 6, hc[1] - Math.cos(a) * 6]; }

// ------------------------------------------------------------------ cercle de rappel / iris (cercle vers cercle)
function calloutState(t) {
  if (t < 14.0 || t >= 22.8) return null;
  const P = aliyahPose(t), e = eyesWorld(P);
  const c0 = [1258, 376], r0 = 136;
  if (t < 19.3) return { cx: c0[0], cy: c0[1], r: r0 * back(seg(t, 14.0, 14.32), 1.5), content: 'eyes', leader: e, k: 1 };
  if (t < 20.4) { const k = eio(seg(t, 19.3, 20.4)); return { cx: lerp(c0[0], WINC[0], k), cy: lerp(c0[1], WINC[1], k), r: lerp(r0, WINR, k), content: 'sky', sc: 1, leader: k < 0.5 ? e : null, leaderA: 1 - k * 2 }; }
  if (t < 22.0) { const k = eio(seg(t, 20.4, 21.4)); return { cx: lerp(WINC[0], MED1.cx, k), cy: lerp(WINC[1], MED1.cy, k), r: lerp(WINR, 1000, k * k), content: 'sky', sc: lerp(1, 2.6, k), spin: seg(t, 21.0, 21.8) * TAU * 0.5 };
  }
  const k = 1 - eio(seg(t, 22.0, 22.8));
  return { cx: lerp(WINC[0], MED1.cx, k), cy: lerp(WINC[1], MED1.cy, k), r: lerp(WINR, 1000, k * k), content: 'sky', sc: lerp(1, 2.6, k), spin: TAU * 0.5 };
}
function drawCallout(ctx, t, st) {
  if (!st || st.r <= 0) return;
  const { cx, cy, r } = st;
  if (st.leader) { const a = Math.atan2(st.leader[1] - cy, st.leader[0] - cx); ctx.save(); ctx.globalAlpha = st.leaderA ?? 1; dashed(ctx, [[cx + Math.cos(a) * (r + 14), cy + Math.sin(a) * (r + 14)], st.leader], 4, 14, 10, -t * 40, COL.ink, 1); shape(ctx, ellipse(st.leader[0], st.leader[1], 8, 8, 12), { fill: COL.ink, line: 0, off: [0, 0], grain: 0 }); ctx.restore(); }
  if (r < 600) shape(ctx, ellipse(cx, cy, r + 18, r + 18, 72), { fill: COL.paper, line: 4.5, seed: 720, grain: 0.15, breaks: 0.05 });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.translate(cx, cy);
  if (st.content === 'eyes') {
    const P = aliyahPose(t); const sc = 2.2 * clamp(r / 136);
    ctx.fillStyle = COL.wallNight; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    ctx.scale(sc, sc); ctx.rotate(-0.18); ctx.translate(0, 6);
    // la tête seule, à l'échelle native du cercle
    const Q = { ...P, x: 0, y: 170 + R - 8, ang: 0, headTilt: 0 };
    drawAliyah(ctx, Q, { torso: false, arms: false, head: true });
  } else sky(ctx, t, st.sc || 1, { spin: st.spin || 0 });
  ctx.restore();
  ink(ctx, ellipse(cx, cy, r, r, 90), r > 600 ? 7 : 4.5, { closed: true, seed: 721, breaks: r > 600 ? 0 : 0.1 });
}

// ------------------------------------------------------------------ la carte de légende du style (sous-titres)
function caption(ctx, t) {
  const cue = CUES.find(c => t >= c.t0 && t < c.t1); if (!cue) return;
  const a = Math.min(ss(seg(t, cue.t0, cue.t0 + 0.16)), 1 - ss(seg(t, cue.t1 - 0.16, cue.t1)));
  const lines = cue.text.split('\n'), font = '500 40px Jost';
  const w = Math.max(...lines.map(l => measure(ctx, l, font))) + 150, h = 36 + lines.length * 48, x = W / 2 - w / 2, y = H - 48 - h;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 10);
  shape(ctx, rrect(x, y, w, h, 14), { fill: COL.paper, line: 3.2, seed: 901, grain: 0.15, breaks: 0.08, off: [5, 5] });
  star(ctx, x + 34, y + h / 2, 15, { n: 8, inner: 0.42, fill: COL.accent, off: [0, 0], rot: twos(t) * 0.9 });
  star(ctx, x + w - 34, y + h / 2, 15, { n: 8, inner: 0.42, fill: COL.accent, off: [0, 0], rot: -twos(t) * 0.9 });
  lines.forEach((l, i) => text(ctx, l, W / 2, y + 18 + 48 * (i + 1) - 10, { font, fill: COL.ink, align: 'center' }));
  ctx.restore();
}
export function texts(t) { return []; }   // aucun texte hors sous-titres (vérifiés par leur .srt)

// ------------------------------------------------------------------ état des accessoires au temps t
function state(t) {
  const tt = twos(t);
  return {
    lamp: pop(t, 13.3),
    spin: t >= 33.6 ? seg(t, 33.6, 34.6) * TAU * 0.5 : 0,
    burst: t >= 24.3 && t < 26.6 ? pop(t, 24.3) : t >= 26.6 && t < 26.8 ? 1 - seg(t, 26.6, 26.75) : 0,
    door: t < 36.7 ? 0 : tt < 37.0 ? 1 : 2,
    band: t < 37.3 ? 0 : eio(seg(t, 37.3, 38.6)),
  };
}

export function renderFilm(ctx, t, Q) {
  setClock(t);
  const c = camera(t), S = state(t);
  ctx.save(); cam(ctx, c);
  drawRoom(ctx, t, c, S);
  drawAliyahInBed(ctx, t, S);
  drawCallout(ctx, t, calloutState(t));
  ctx.restore();
  paperFinish(ctx, W, H, 1);
  if (Q && Q.get('poster')) posterTitle(ctx);
  else if (!(Q && Q.has('nosubs'))) caption(ctx, t);
}
function posterTitle(ctx) {
  // une plaque papier (la carte du style) sous le titre, pour qu'il ne se pose pas sur la guirlande
  shape(ctx, rrect(290, 44, 1340, 232, 24), { fill: COL.paper, line: 3.6, seed: 950, grain: 0.15, breaks: 0.08, off: [6, 6] });
  star(ctx, 336, 160, 22, { n: 8, inner: 0.42, fill: COL.accent, off: [0, 0] }); star(ctx, 1584, 160, 22, { n: 8, inner: 0.42, fill: COL.accent, off: [0, 0] });
  text(ctx, 'Aliyah chante', 960, 118, { font: '700 64px Oleo', fill: COL.tomato, align: 'center', plate: COL.bow, off: [3, 3] });
  text(ctx, 'Notre Père dans ma chambre', 960, 232, { font: '88px Slab', fill: COL.ink, align: 'center', plate: COL.bow, off: [7, 6] });
}

// ------------------------------------------------------------------ événements son (les mêmes temps que l'image)
function buildEvents() {
  EVS = [];
  // intro : les cels se posent (tampon), le trait s'écrit (plume)
  [[0.5, -0.1], [1.0, 0], [1.6, -0.5], [2.6, -0.1], [3.1, 0], [5.2, 0.2], [6.3, 0.4], [6.7, 0.5], [7.3, 0.4], [8.4, 0.6], [8.9, 0.6], [9.4, 0.3], [10.5, 0.4], [11.3, 0.4]].forEach(([t, pan]) => ev(t, 'stamp', { pan, gain: 0.8 }));
  [[0.8, 0.7], [1.8, 0.5], [2.8, 0.45], [5.2, 0.7], [6.5, 0.5], [7.5, 0.4], [8.6, 0.3], [12.3, 0.5]].forEach(([t, d]) => ev(t, 'pen', { dur: d, pan: -0.2 }));
  [3.7, 4.2, 4.7].forEach((t, i) => ev(t, 'tick', { gain: 0.5, pan: -0.1 + i * 0.1 }));
  [5.35, 5.45, 5.55, 5.65, 5.75, 5.85].forEach(t => ev(t, 'tick', { gain: 0.35 }));
  ev(10.8, 'pop', { gain: 0.5 }); ev(12.0, 'pop', { gain: 0.9, pan: 0.3 });
  // V1
  ev(12.8, 'swish', { dur: 0.9, gain: 0.8 }); ev(13.3, 'pop', { gain: 0.6, pan: 0.6 }); ev(14.0, 'iris', { dur: 0.35, gain: 0.7, pan: -0.2 });
  // V2
  ev(19.3, 'iris', { dur: 0.9, gain: 0.5, pan: -0.4 }); ev(20.4, 'iris', { dur: 1.0, gain: 0.9 }); ev(22.0, 'iris', { dur: 0.8, gain: 0.7 }); ev(22.7, 'cloth', { gain: 0.7, pan: 0.3 });
  // V3
  ev(24.0, 'cloth', { gain: 0.9, pan: 0.3 }); ev(24.3, 'pop', { gain: 0.9, pan: 0.2 }); ev(26.6, 'cloth', { gain: 0.6, pan: 0.2 });
  // V4
  ev(30.4, 'tick', { gain: 0.5, pan: -0.3 }); ev(31.4, 'tick', { gain: 0.5, pan: 0.3 }); ev(32.5, 'cloth', { gain: 0.6, pan: -0.2 }); ev(32.7, 'swish', { dur: 1.4, gain: 0.6, pan: -0.3 });
  // creux : rien de 34,8 à 36,6 (mix.py coupe tout)
  // V5
  ev(36.7, 'wood', { gain: 0.8, pan: -0.6 }); ev(37.0, 'wood', { gain: 0.5, pan: -0.6 }); ev(37.3, 'swish', { dur: 1.3, gain: 0.8, pan: -0.3, sweep: 1 }); ev(37.6, 'pop', { gain: 0.6, pan: -0.5 }); ev(38.3, 'cloth', { gain: 0.6, pan: 0.3 });
  EVS.sort((a, b) => a.t - b.t);
}
