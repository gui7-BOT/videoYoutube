// La chambre d'Aliyah : une page de 3200×1800 (page entière = CAM.s 0.6). Tout en coordonnées monde.
import { line, fill, dab, ellipse, handCircle, smooth, CAM, W, H } from './crayon.js';
import { part } from './rig.js';
import { star5 } from './aliyah.js';
import { PAL } from './pal.js';
import { hash, clamp, lerp, mulberry } from '/core/lib.js';
const K = PAL.crayon;
export const pr = (t, a, b) => clamp((t - a) / (b - a));
export const FLOOR = 1500;
export const DOOR = { x0: 330, x1: 650, y0: 740 };
export const WIN = { x: 2350, y: 600, R: 300 };
export const MOON = { x: 2440, y: 545, R: 110 };
export const BED = { x0: 1250, x1: 2250, top: 1180, bot: 1420 };
export const PILLOW = { x: 2040, y: 1222 };
export const TABLE = { x0: 2330, x1: 2560, y0: 1270 };
export const BUNNY = { x: 1120, y: 1440 };
const BO = 0.6;   // bouillonnement des lignes de fond

// étoiles à la cire blanche dans la fenêtre (invisibles avant le lavis)
const RNG = mulberry(77);
export const STARS = [];
for (let n = 0; STARS.length < 16 && n < 2000; n++) {
  const a = RNG() * 6.28, r = Math.sqrt(RNG()) * (WIN.R - 40);
  const x = WIN.x + Math.cos(a) * r, y = WIN.y + Math.sin(a) * r;
  if (Math.hypot(x - MOON.x, y - MOON.y) < MOON.R + 50) continue;
  if (STARS.some(s => Math.hypot(s.x - x, s.y - y) < 70)) continue;
  STARS.push({ x, y, big: RNG() < 0.5, r: 9 + RNG() * 12, rot: RNG(), seed: 600 + n });
}
export const GARLAND = []; for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7; GARLAND.push([lerp(1150, 2160, u), lerp(820, 760, u) + 110 * Math.sin(u * Math.PI) + 18]); }

// p : progression de chaque élément (0..1). doorOpen, doorway (lumière dans l'embrasure), light (bande de lumière au sol)
export function drawRoom(RM, p) {
  const F = RM.f, L = RM.l;
  // mur rose (pression ≥ 0,8 : il passe sous le lavis sans tourner à la boue)
  fill(F, [[-80, -80], [3280, -80], [3280, FLOOR], [-80, FLOOR]], { col: K.pink, p: 0.82, gap: 14, w: 15, ang: 0.55, seed: 11, draw: p.wall, boil: 0, over: 6, cross: true, crossP: 0.4, crossAng: 1.1 });
  // sol : ligne mur/sol, puis quelques lames
  line(L, [[-40, FLOOR], [3240, FLOOR + 6]], { w: 8, col: K.wood, seed: 12, draw: p.floor, boil: BO, p: 0.9 });
  for (let i = 0; i < 7; i++) { const x = 60 + i * 520; line(L, [[x, FLOOR + 10], [x + 90 + i * 20, 1790]], { w: 4.5, col: K.wood, p: 0.45, seed: 20 + i, draw: pr(p.planks, i / 8, i / 8 + 0.3), boil: BO }); }
  line(L, [[-40, 1650], [3240, 1640]], { w: 4, col: K.wood, p: 0.35, seed: 29, draw: p.planks, boil: BO });
  // ——— porte en bois, à gauche ———
  const D = DOOR; const frame = [[D.x0 - 22, FLOOR], [D.x0 - 22, D.y0 - 22], [D.x1 + 22, D.y0 - 22], [D.x1 + 22, FLOOR]];
  part(RM, frame, { col: K.wood, p: 0.85, gap: 9, w: 10, ang: 1.5, seed: 30, draw: p.doorF, boil: 0 }, { w: 8, seed: 31, draw: p.doorL, boil: BO }, { kn: p.doorL > 0 });
  const open = p.doorOpen || 0;
  if (p.doorway > 0) {   // l'embrasure : la lumière du couloir, coloriée en doré
    part(RM, [[D.x0, FLOOR], [D.x0, D.y0], [D.x1, D.y0], [D.x1, FLOOR]], { col: K.gold, p: 0.9, gap: 10, w: 12, ang: 1.5, seed: 36, draw: p.doorway, boil: 0, over: 2, cross: true, crossP: 0.5 }, null, { kn: true });
  } else if (p.doorL > 0) part(RM, [[D.x0, FLOOR], [D.x0, D.y0], [D.x1, D.y0], [D.x1, FLOOR]], null, null, { kn: true });
  // le battant : fermé = rectangle ; ouvert = pivote vers nous (charnière à gauche)
  const u = open; const rx = lerp(D.x1, D.x0 + 200, u), ty = lerp(D.y0, D.y0 + 70, u), by = lerp(FLOOR, FLOOR + 80, u);
  const panel = [[D.x0, FLOOR], [D.x0, D.y0], [rx, ty], [rx, by]];
  part(RM, panel, { col: K.wood, p: 0.86, gap: 11, w: 12, ang: 1.5 - 0.3 * u, seed: 32, draw: p.doorF, boil: 0, over: 3 }, { w: 8, seed: 33, draw: p.doorL, boil: BO }, { kn: p.doorL > 0 });
  // panneaux et poignée
  const inset = (a, b, c, d) => [[lerp(D.x0, rx, a), lerp(lerp(D.y0, ty, a), lerp(FLOOR, by, a), b)], [lerp(D.x0, rx, c), lerp(lerp(D.y0, ty, c), lerp(FLOOR, by, c), b)], [lerp(D.x0, rx, c), lerp(lerp(D.y0, ty, c), lerp(FLOOR, by, c), d)], [lerp(D.x0, rx, a), lerp(lerp(D.y0, ty, a), lerp(FLOOR, by, a), d)]];
  line(L, [...inset(0.18, 0.08, 0.82, 0.42), inset(0.18, 0.08, 0.82, 0.42)[0]], { w: 4.5, seed: 34, draw: pr(p.doorL, 0.6, 1), boil: BO, p: 0.7 });
  line(L, [...inset(0.18, 0.52, 0.82, 0.92), inset(0.18, 0.52, 0.82, 0.92)[0]], { w: 4.5, seed: 35, draw: pr(p.doorL, 0.7, 1), boil: BO, p: 0.7 });
  if (p.doorL > 0.9) { const kn = inset(0.84, 0.5, 0.84, 0.5)[0]; dab(L, kn[0], kn[1], 11, { col: K.yellow, p: 1, seed: 37, boil: BO }); }
  // la bande de lumière au sol, coloriée de la porte jusqu'au lit
  if (p.light > 0) {
    const wedge = [[D.x0 + 10, FLOOR + 2], [D.x1 + 40, FLOOR + 2], [1180, FLOOR + 24], [1560, 1600], [1700, 1730], [1250, 1790], [600, 1790], [D.x0 - 60, 1690]];
    fill(F, wedge, { col: K.gold, p: 0.82, gap: 13, w: 14, ang: -Math.PI / 2 + 0.12, seed: 38, draw: p.light, boil: 0, over: 8 });
    // elle grimpe un peu sur le pied du lit
    fill(F, [[BED.x0 + 4, 1240], [BED.x0 + 40, 1250], [BED.x0 + 40, BED.bot], [BED.x0 + 4, BED.bot]], { col: K.gold, p: 0.7, gap: 9, w: 10, ang: 1.5, seed: 39, draw: pr(p.light, 0.7, 1), boil: 0, over: 2 });
  }
  // ——— fenêtre ronde ———
  const circ = handCircle(WIN.x, WIN.y, WIN.R, 40, 0, 72);
  if (p.winL > 0) part(RM, circ, null, null, { kn: true });                              // le ciel est du papier nu, jusqu'au lavis
  for (const s of STARS) { if (s.big) star5(RM, [s.x, s.y], s.r, s.seed, s.rot, K.white, null, p.winL); else if (p.winL > 0.5) dab(RM.f, s.x, s.y, s.r * 0.5, { col: K.white, p: 1, seed: s.seed, gap: 2.5, w: 4, over: 0.4, boil: 0.25 }); }
  // la pleine lune
  part(RM, handCircle(MOON.x, MOON.y, MOON.R, 41, 0.08), { col: K.yellow, p: 0.88, gap: 10, w: 12, ang: 0.5, seed: 42, draw: p.moonF, boil: 0, cross: true, crossP: 0.45, over: 3 }, { w: 7, seed: 43, draw: p.moonL, boil: BO }, { kn: p.moonL > 0 });
  if (p.moonF > 0.8) [[-30, -20, 18], [22, 30, 13], [34, -40, 10]].forEach(([dx, dy, r], i) => dab(RM.f, MOON.x + dx, MOON.y + dy, r, { col: K.night, p: 0.35, seed: 44 + i, boil: 0 }));
  // halo de cire blanche autour de la lune (révélé par le lavis)
  if (p.moonF > 0.5) line(RM.f, handCircle(MOON.x, MOON.y, MOON.R + 26, 45, 0, 60), { w: 16, col: K.white, p: 0.9, seed: 46, boil: 0.2, closed: true });
  // cadre + croisillon + appui
  line(L, circ, { w: 11, col: K.night, seed: 47, draw: p.winL, boil: BO, p: 0.95 });
  line(L, [[WIN.x - WIN.R - 10, WIN.y + 4], [WIN.x + WIN.R + 10, WIN.y]], { w: 6, col: K.night, seed: 48, draw: pr(p.winL, 0.5, 1), boil: BO, p: 0.8 });
  line(L, [[WIN.x - 4, WIN.y - WIN.R - 8], [WIN.x, WIN.y + WIN.R + 8]], { w: 6, col: K.night, seed: 49, draw: pr(p.winL, 0.6, 1), boil: BO, p: 0.8 });
  part(RM, [[WIN.x - WIN.R - 60, WIN.y + WIN.R + 10], [WIN.x + WIN.R + 60, WIN.y + WIN.R + 6], [WIN.x + WIN.R + 60, WIN.y + WIN.R + 46], [WIN.x - WIN.R - 60, WIN.y + WIN.R + 50]], { col: K.night, p: 0.8, gap: 8, w: 9, ang: 0.1, seed: 50, draw: pr(p.winL, 0.7, 1), boil: 0 }, { w: 6, seed: 51, draw: pr(p.winL, 0.7, 1), boil: BO }, { kn: p.winL > 0.7 });
  // ——— guirlande d'étoiles ———
  if (p.garland > 0) {
    const str = []; for (let i = 0; i <= 24; i++) { const u = i / 24; str.push([lerp(1120, 2190, u), lerp(822, 758, u) + 110 * Math.sin(u * Math.PI)]); }
    line(L, str, { w: 4, seed: 60, draw: pr(p.garland, 0, 0.35), boil: BO, p: 0.8 });
    GARLAND.forEach(([x, y], i) => { const d = pr(p.garland, 0.3 + i * 0.09, 0.42 + i * 0.09); if (d > 0) { line(L, [[x, y - 18], [x, y + 2]], { w: 3.5, seed: 61 + i, draw: d, boil: BO, p: 0.7 }); star5(RM, [x, y + 24], 22, 70 + i * 3, 0.2 * i, K.yellow, K.ink, d); } });
  }
  // ——— lit blanc bas ———
  const B = BED;
  const mat = [[B.x0, B.top], [B.x1, B.top - 6], [B.x1 + 6, B.bot], [B.x0 - 6, B.bot + 4]];
  part(RM, mat, { col: K.white, p: 0.65, gap: 14, w: 12, ang: 0.15, seed: 80, draw: p.bedF, boil: 0, over: 2 }, { w: 8, seed: 81, draw: p.bedL, boil: BO }, { kn: p.bedL > 0.3 });
  line(L, [[B.x0 + 10, B.top + 70], [B.x1 - 10, B.top + 64]], { w: 4.5, seed: 82, draw: pr(p.bedL, 0.5, 1), boil: BO, p: 0.6 });
  [[B.x0 + 30, 0], [B.x1 - 30, 1]].forEach(([x, i]) => part(RM, [[x - 18, B.bot], [x + 18, B.bot], [x + 14, FLOOR - 4], [x - 14, FLOOR - 4]], { col: K.wood, p: 0.85, gap: 7, w: 9, ang: 1.5, seed: 84 + i, draw: pr(p.bedL, 0.6, 1), boil: 0 }, { w: 6, seed: 86 + i, draw: pr(p.bedL, 0.6, 1), boil: BO }, { kn: p.bedL > 0.6 }));
  // tête de lit (à droite), arrondie
  const hb = smooth([[2200, B.top + 40], [2200, 1010], [2235, 980], [2270, 1010], [2270, B.bot]], 4);
  part(RM, [...hb, [2200, B.bot]], { col: K.white, p: 0.7, gap: 12, w: 11, ang: 1.4, seed: 88, draw: pr(p.bedF, 0.3, 1), boil: 0 }, { w: 8, seed: 89, draw: pr(p.bedL, 0.2, 0.8), boil: BO }, { kn: p.bedL > 0.4 });
  // oreiller
  const pil = ellipse(PILLOW.x, PILLOW.y, 165, 62, 36);
  part(RM, pil, { col: K.white, p: 0.75, gap: 10, w: 11, ang: 0.2, seed: 90, draw: pr(p.bedF, 0.5, 1), boil: 0, over: 2 }, { w: 7, seed: 91, draw: pr(p.bedL, 0.7, 1), boil: BO }, { kn: p.bedL > 0.75 });
  // ——— table de nuit + veilleuse lune ———
  const T = TABLE;
  if (p.tableF > 0.3) dab(RM.f, 2445, 1205, 80, { col: K.yellow, p: 0.28, seed: 95, gap: 7, w: 9, boil: 0 });   // halo de la veilleuse (pression légère = lueur)
  part(RM, [[T.x0, FLOOR], [T.x0, T.y0], [T.x1, T.y0 - 4], [T.x1 + 4, FLOOR]], { col: K.wood, p: 0.85, gap: 9, w: 10, ang: 1.5, seed: 100, draw: p.tableF, boil: 0, over: 3 }, { w: 8, seed: 101, draw: p.tableL, boil: BO }, { kn: p.tableL > 0.2 });
  line(L, [[T.x0 + 24, T.y0 + 50], [T.x1 - 24, T.y0 + 48], [T.x1 - 24, T.y0 + 130], [T.x0 + 24, T.y0 + 132], [T.x0 + 24, T.y0 + 50]], { w: 4.5, seed: 102, draw: pr(p.tableL, 0.5, 1), boil: BO, p: 0.7 });
  if (p.tableL > 0.9) dab(L, (T.x0 + T.x1) / 2, T.y0 + 90, 8, { col: K.yellow, p: 1, seed: 103, boil: BO });
  // socle et croissant
  part(RM, [[2415, T.y0], [2475, T.y0], [2470, T.y0 - 22], [2420, T.y0 - 22]], { col: K.wood, p: 0.85, gap: 6, w: 8, seed: 104, draw: pr(p.tableF, 0.6, 1), boil: 0 }, { w: 5, seed: 105, draw: pr(p.tableL, 0.6, 1), boil: BO }, { kn: p.tableF > 0.6 });
  const cres = []; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + i / 30 * Math.PI; cres.push([2440 + Math.cos(a) * 54, 1192 + Math.sin(a) * 56]); } for (let i = 30; i >= 0; i--) { const a = -Math.PI / 2 + i / 30 * Math.PI; cres.push([2454 + Math.cos(a) * 40, 1192 + Math.sin(a) * 44]); }
  part(RM, cres, { col: K.yellow, p: 0.95, gap: 4, w: 6, seed: 106, over: 1, draw: pr(p.tableF, 0.6, 1), boil: 0 }, { w: 5.5, seed: 107, draw: pr(p.tableL, 0.7, 1), boil: BO }, { kn: p.tableF > 0.6 });
  // ——— le lapin en peluche, au pied du lit ———
  if (p.bunny > 0) {
    const bx = BUNNY.x, by = BUNNY.y, d = p.bunny;
    const mintF = { col: K.mint, p: 0.85, gap: 7, w: 9, ang: 0.7, seed: 110, over: 2, draw: d, boil: 0 };
    [[-26, -86, -0.25], [12, -90, 0.2]].forEach(([ex, ey, rot], i) => part(RM, ellipse(bx + ex, by + ey - 40, 13, 42, 16, 0, 6.3, rot), { ...mintF, seed: 111 + i }, { w: 5.5, seed: 113 + i, draw: d, boil: BO }));
    [[-26, -86, -0.25], [12, -90, 0.2]].forEach(([ex, ey, rot], i) => part(RM, ellipse(bx + ex, by + ey - 40, 6, 28, 12, 0, 6.3, rot), { col: K.pink, p: 0.7, gap: 4, w: 6, seed: 115 + i, draw: d, boil: 0 }, null, { kn: false }));
    part(RM, ellipse(bx, by, 48, 56, 24), mintF, { w: 6.5, seed: 118, draw: d, boil: BO });
    part(RM, ellipse(bx - 6, by - 66, 40, 36, 24), { ...mintF, seed: 119 }, { w: 6.5, seed: 120, draw: d, boil: BO });
    [[-18, -70], [6, -70]].forEach(([ex, ey], i) => dab(RM.l, bx + ex, by + ey, 4.5, { col: K.ink, p: 1, seed: 121 + i, gap: 2.5, w: 4 }));
    dab(RM.f, bx - 6, by - 56, 6, { col: K.pink, p: 0.9, seed: 123, gap: 3, w: 5 });
    line(RM.l, [[bx - 14, by - 48], [bx - 6, by - 52], [bx + 2, by - 48]], { w: 3.5, seed: 124, draw: d, boil: BO, p: 0.8 });
    part(RM, ellipse(bx + 34, by + 36, 18, 12, 14), { ...mintF, seed: 125 }, { w: 5, seed: 126, draw: d, boil: BO });
    part(RM, ellipse(bx - 40, by + 38, 18, 12, 14), { ...mintF, seed: 127 }, { w: 5, seed: 128, draw: d, boil: BO });
  }
}

// La couette lilas (dessinée dans le groupe du personnage, entre le corps et les bras) : mode 'lie' | 'sit'
export function duvet(C, mode, d = 1) {
  const B = BED;
  const top = [], xa = B.x0 + 16, xb = mode === 'lie' ? 1900 : 2010;
  for (let i = 0; i <= 14; i++) { const u = i / 14; top.push([lerp(xa, xb, u), (mode === 'lie' ? 1152 : 1172) + 10 * Math.sin(u * 19) + 6 * hash(i)]); }
  const poly = [...top, [xb + 18, 1200], [xb + 10, 1330], [xb - 10, B.bot + 26], [B.x0 - 10, B.bot + 40], [B.x0 + 4, 1240]];
  part(C, poly, { col: K.lilac, p: 0.86, gap: 12, w: 13, ang: 0.3, seed: 130, draw: d, boil: 0, over: 5, cross: true, crossP: 0.4 }, { w: 7.5, seed: 131, draw: d, boil: 0.6 });
  // l'ourlet replié
  line(C.l, [[xa + 10, top[0][1] + 48], [xb - 20, top[top.length - 1][1] + 42]], { w: 5, seed: 132, draw: pr(d, 0.6, 1), boil: 0.6, p: 0.7 });
  // petites étoiles
  if (d > 0.7) [[1380, 1280], [1540, 1370], [1690, 1265], [1820, 1360], [1470, 1225], [1620, 1310], [1760, 1215], [1340, 1385]].forEach(([x, y], i) => {
    if (mode === 'sit' && x > 1760 && y < 1300) return;
    if (i % 2) star5(C, [x, y], 13, 140 + i, 0.3 * i, K.yellow, null); else dab(C.f, x, y, 5, { col: K.white, p: 1, seed: 150 + i, gap: 2.5, w: 4, boil: 0.3 });
  });
}

// Lavis outremer : la nuit tombe par la fenêtre (12,8 → 14,8). Densité forte dans la fenêtre, légère sur le haut du mur.
export const WASH = { t0: 12.8, t1: 14.9, y0: -200, y1: 1070 };
export function washFront(t) { const u = pr(t, WASH.t0, WASH.t1); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; return lerp(-300, 3500, 0.15 * u + 0.85 * e); }
export function drawWash(LW, t) {
  if (t < WASH.t0) return;
  const g = LW.g; g.save();
  g.setTransform(CAM.s, 0, 0, CAM.s, W / 2 - CAM.x * CAM.s, H / 2 - CAM.y * CAM.s);
  const f = washFront(t), moving = t < WASH.t1;
  const frontX = y => f + 60 * Math.sin(pr(y, WASH.y0, WASH.y1) * Math.PI) + 10 * Math.sin(y * 0.05);
  g.beginPath(); g.moveTo(-400, WASH.y0 - 300); for (let y = WASH.y0 - 300; y <= WASH.y1 + 300; y += 20) g.lineTo(frontX(y), y); g.lineTo(-400, WASH.y1 + 300); g.closePath(); g.clip();
  // la bande : bord inférieur ondulé, densité qui s'éclaircit vers le bas
  const bot = []; for (let x = -400; x <= 3600; x += 40) bot.push([x, WASH.y1 + 16 * (Math.sin(x * 0.005 + 1) + 0.6 * Math.sin(x * 0.019)) + 14 * hash(x * 0.7)]);
  const shape = new Path2D(); shape.moveTo(-400, WASH.y0 - 300); shape.lineTo(3600, WASH.y0 - 300); for (let i = bot.length - 1; i >= 0; i--) shape.lineTo(bot[i][0], bot[i][1]); shape.closePath();
  const gr = g.createLinearGradient(0, 0, 0, WASH.y1); gr.addColorStop(0, 'rgba(0,0,0,0.44)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.30)'); gr.addColorStop(0.82, 'rgba(0,0,0,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0.0)');
  g.fillStyle = gr; g.fill(shape);
  // la fenêtre : nuit pleine
  g.fillStyle = '#000'; g.globalAlpha = 0.92; g.beginPath(); g.arc(WIN.x, WIN.y, WIN.R + 6, 0, 7); g.fill();
  // stries de poils
  g.save(); g.clip(shape); const R = mulberry(5);
  for (let i = 0; i < 22; i++) {
    const yy = lerp(WASH.y0, WASH.y1, R()), wdt = 6 + R() * 26, dark = R() < 0.55;
    g.beginPath(); for (let x = -400; x <= 3600; x += 60) { const y = yy + 14 * Math.sin(x * 0.002 + i) + 6 * Math.sin(x * 0.01 + i * 2); x === -400 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.lineWidth = dark ? wdt : wdt * 0.5; g.globalCompositeOperation = dark ? 'source-over' : 'destination-out'; g.globalAlpha = dark ? 0.05 + R() * 0.06 : 0.02 + R() * 0.03; g.strokeStyle = '#000'; g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  // le front mouillé : le pigment s'accumule au bord
  g.beginPath(); for (let y = WASH.y0 - 80; y <= WASH.y1 + 80; y += 16) { const x = frontX(y) - 14; y === WASH.y0 - 80 ? g.moveTo(x, y) : g.lineTo(x, y); }
  g.lineWidth = moving ? 34 : 22; g.globalAlpha = moving ? 0.28 : 0.12; g.stroke();
  g.restore(); g.restore();
}
