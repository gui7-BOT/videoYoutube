// room.js — la chambre d'Aliyah (monde 1), le ciel dans la fenêtre ronde (monde 2), le couloir doré de Papa (monde 3)
// Coordonnées monde = écran au plan large (1920×1080, zoom 1).
import { clamp, lerp, seg, hash, back, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, screenRect, bands, tx, S } from './toon.js';
import { star5, papa, bunny, C } from './aliyah.js';

// —— palettes (une par monde) ——
export const DAY = { wall: '#e8b4c2', wallS: '#d59aae', floor: '#c69364', floorS: '#a87648', wood: '#8a5a3a', woodS: '#6d4229', bed: '#f6f1ea', bedS: '#d9d0cf', duvet: '#b8a0dc', duvetS: '#9a80c4', lamp: '#fbf6e4', lampS: '#e9dfc0', tag: '#e8b4c2' };
export const NIGHT = { wall: '#b98aa3', wallS: '#a0738d', floor: '#8f6a4a', floorS: '#735336', wood: '#6b4530', woodS: '#52331f', bed: '#d9d3d8', bedS: '#bcb3bd', duvet: '#8f7cb8', duvetS: '#75639f', lamp: '#fbf6e4', lampS: '#e9dfc0', tag: '#b98aa3' };
export const SKY = { b: ['#1f2a63', '#182052', '#141a45'], rim: '#3b4a9c', rimS: '#2d3a7e', moon: '#fbf6e4', moonS: '#e9dfc0', ring: 'rgba(251,246,228,.16)', tag: '#8fa0e8' };
export const GOLD = { g: '#f3b23a', amber: '#e08a2a', band: 'rgba(243,178,58,.55)', band2: 'rgba(243,178,58,.28)', wash: 'rgba(243,178,58,.13)', tag: '#f3b23a' };

// —— géométrie de la chambre ——
export const FLOOR = 820;
export const DOOR = { x: 150, w: 190, y: 290, h: FLOOR - 290 };
export const WIN = { cx: 1430, cy: 335, r: 180, rim: 26 };
export const BED = { x0: 700, x1: 1500, top: 660, bot: 760 };
export const PILLOW = { x: 1370, y: 705, rx: 118, ry: 46 };
export const TABLE = { x: 1560, w: 140, y: 650 };
export const LAMP = { x: 1630, y: 598 };
export const GARLAND = [[380, 150], [740, 240], [1090, 130]];
export const BUNNY_HOME = [840, 648];

// —— révélation (intro) : chaque élément a un instant où son trait se trace (0,4 s) puis où son aplat claque ——
export const REV = {
  floor: .3, wallBack: .8, door: 1.4, window: 2.4, sky: 3.0, moon: 3.3, stars: 3.5, garland: 4.4, wallFill: 4.9,
  bed: 5.8, duvet: 6.8, duvetStars: 7.6, table: 8.0, lamp: 8.6, bunny: 9.2, gstars: 9.8,
  head: 10.6, puffs: 10.9, bows: 11.2, pj: 11.5, star: 11.8, eyes: 12.0, brows: 12.3,
};
const STROKE_D = .4, FILL_LAG = .5;
let RT = 1e9;   // temps courant pour la révélation ; 1e9 = tout dessiné
export const setRevealTime = t => { RT = t; };
export const q12 = t => Math.floor(t * 12 + 1e-6) / 12;
// état d'un élément : u = avancement du trait 0..1, fill = aplat posé
export function rev(key) {
  const t0 = REV[key]; if (t0 == null || RT >= 12.8) return { u: 1, fill: true, on: true };
  if (RT < t0) return { u: 0, fill: false, on: false };
  return { u: clamp((RT - t0) / STROKE_D), fill: q12(RT) >= q12(t0 + FILL_LAG) + 1e-6 || RT >= t0 + FILL_LAG, on: true };
}
// densifie un polygone (pour tracer partiellement des rectangles)
export function dense(pts, step = 30) {
  const out = []; const n = pts.length;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], d = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(d / step)); for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
  return out;
}
// dessine une forme en tenant compte de sa révélation
export function el(key, pts, o = {}) {
  const r = rev(key); if (!r.on) return false;
  if (r.u < 1) { const n = Math.max(2, Math.ceil(pts.length * r.u)); stroke(pts.slice(0, n), o.lw ?? S.lw, { line: o.line }); return false; }
  if (!r.fill) { shape(pts, { ...o, fill: null, shade: null, closed: o.closed }); return false; }
  shape(pts, o); return true;
}
export const popScale = (key) => { const t0 = REV[key]; if (t0 == null || RT >= 12.8 || RT < t0 + FILL_LAG) return 1; return 1 + .06 * Math.max(0, 1 - (RT - t0 - FILL_LAG) / .17); };

// —— le ciel dans la fenêtre ronde (monde 2) ——
export function windowSky(t, { full = false, twinkle = true } = {}) {
  const { cx, cy, r } = WIN;
  const inner = ell(cx, cy, r, r, 48);
  const rs = rev('sky');
  if (!rs.on) return;
  const tq = q12(t);
  const P = shape(inner, { fill: rs.fill ? SKY.b[1] : null, lw: 0, stroke: false, boil: 0 });
  if (!rs.fill) return;
  g.save(); g.clip(P);
  push(); bands(SKY.b, cy - r - 10, cy + r + 10, cx - r - 20, cx + r + 20); pop();
  // lune pleine + un anneau translucide plat
  const rm = rev('moon');
  if (rm.on) {
    const mx = cx + 52, my = cy - 48, mr = 54;
    if (rm.fill) fillOnly(ell(mx, my, mr * 1.5, mr * 1.5, 30), SKY.ring, { boil: .4 });
    el('moon', ell(mx, my, mr, mr, 30), { fill: SKY.moon, lw: 6, shade: () => { fillOnly(ell(mx + 18, my + 10, 11, 9, 10), SKY.moonS, { boil: .3 }); fillOnly(ell(mx - 20, my - 16, 8, 7, 10), SKY.moonS, { boil: .3 }); fillOnly(ell(mx + 2, my + 30, 7, 6, 10), SKY.moonS, { boil: .3 }); } });
  }
  // étoiles : quatre branches, qui clignent sur deux images
  const rst = rev('stars');
  if (rst.on) {
    const stars = [[cx - 110, cy - 90, 14], [cx - 40, cy + 70, 11], [cx + 120, cy + 60, 12], [cx - 130, cy + 20, 8], [cx + 30, cy + 120, 8], [cx + 130, cy - 120, 9], [cx - 60, cy - 20, 6]];
    stars.forEach(([x, y, r0], i) => {
      if (RT < 12.8 && RT < REV.stars + i * .12) return;
      const tw = twinkle ? (.75 + .35 * Math.sin(tq * 5 + i * 1.9)) : 1, r1 = r0 * tw;
      shape([[x, y - r1], [x + r1 * .3, y - r1 * .3], [x + r1, y], [x + r1 * .3, y + r1 * .3], [x, y + r1], [x - r1 * .3, y + r1 * .3], [x - r1, y], [x - r1 * .3, y - r1 * .3]], { fill: '#fff', lw: 4 });
    });
  }
  g.restore();
}
// rebord de la fenêtre ronde (dessiné au-dessus du ciel)
export function windowRim() {
  const { cx, cy, r, rim } = WIN;
  const outer = ell(cx, cy, r + rim, r + rim, 56), inner = ell(cx, cy, r, r, 48);
  const rw = rev('window'); if (!rw.on) return;
  if (rw.u < 1 || !rw.fill) { el('window', outer, { fill: SKY.rim, lw: 6 }); if (rw.u >= 1) shape(inner, { fill: null, lw: 6 }); return; }
  // anneau plein : extérieur rempli, intérieur percé (par un tracé ring)
  const ring = [...outer, outer[0], ...inner.slice().reverse(), inner[inner.length - 1]];
  shape(ring, { fill: SKY.rim, lw: 0, stroke: false, boil: .5, shade: () => fillOnly(arc(cx, cy, r + rim * .5, r + rim * .5, Math.PI * .2, Math.PI * .95, 20).concat(arc(cx, cy, r + rim, r + rim, Math.PI * .95, Math.PI * .2, 20)), SKY.rimS, { boil: .3 }) });
  shape(outer, { fill: null, lw: 6 }); shape(inner, { fill: null, lw: 6 });
  // croisillon : une barre horizontale et une verticale, fines
  stroke([[cx - r, cy], [cx + r, cy]], 4); stroke([[cx, cy - r], [cx, cy + r]], 4);
}

// —— la chambre : fond (murs, sol, porte, fenêtre, guirlande, table, veilleuse) ——
// o : {door 0..1 ouverture, light 0..1 lueur dorée (avec dépassement), band 0..1 longueur de la bande au sol, papa 0..1 entrée de Papa, wave}
export function roomBack(t, pal, o = {}) {
  // sol
  el('floor', dense(rect(-400, FLOOR, 2800, 600), 60), { fill: pal.floor, lw: 5, shade: () => { for (let k = 0; k < 7; k++) fillOnly(rect(-400 + k * 420, FLOOR + 20 + (k % 2) * 60, 260, 26), pal.floorS, { boil: .3 }); } });
  // mur du fond : la plinthe se trace (wallBack), l'aplat rose claque plus tard (wallFill)
  const rw = rev('wallBack');
  if (rw.on) {
    const wf = rev('wallFill');
    if (wf.on && wf.fill) { shape(rect(-400, -400, 2800, FLOOR + 400), { fill: pal.wall, lw: 0, stroke: false, boil: 0, shade: () => fillOnly(rect(-400, FLOOR - 60, 2800, 60), pal.wallS, { boil: .4 }) }); if (rev('floor').fill) stroke([[-400, FLOOR], [2300, FLOOR]], 5); }
    stroke([[-400, FLOOR - 60], [lerp(-400, 2300, rw.u), FLOOR - 60]], 4);
  }
  // bande dorée au sol (monde 3), sous les meubles
  if (o.band > 0) {
    const L = o.band, x0 = DOOR.x + 10, x1 = DOOR.x + DOOR.w - 10, far = lerp(x1, BED.x0 + 60, L), farB = lerp(x1 + 40, BED.x0 + 240, L);
    fillOnly([[x0, FLOOR], [x1, FLOOR], [farB, FLOOR + 290], [x0 - 60, FLOOR + 290]], GOLD.band2, { boil: .4 });
    fillOnly([[x0 + 20, FLOOR], [x1 - 10, FLOOR], [far, FLOOR + 180], [x0 - 20, FLOOR + 180]], GOLD.band, { boil: .4 });
  }
  // deux anneaux translucides plats autour de l'embrasure : la seule lueur du film
  if (o.light > 0) {
    const { x, w, y, h } = DOOR, L = o.light;
    fillOnly(ell(x + w / 2, y + h / 2, (w / 2 + 150) * L, (h / 2 + 130) * L, 36), GOLD.band2, { boil: .5 });
    fillOnly(ell(x + w / 2, y + h / 2, (w / 2 + 70) * L, (h / 2 + 60) * L, 36), GOLD.band, { boil: .5 });
  }
  // porte en bois à gauche (cadre, battant qui pivote vers nous, poignée)
  const rd = rev('door');
  if (rd.on) {
    const { x, w, y, h } = DOOR;
    const frame = dense([[x - 16, y - 16], [x + w + 16, y - 16], [x + w + 16, FLOOR], [x - 16, FLOOR]], 40);
    el('door', frame, { fill: pal.woodS, lw: 5 });
    if (rd.fill) {
      // embrasure : dorée quand la porte est ouverte (monde 3), sinon bois sombre
      const op = clamp(o.door || 0);
      if (o.light > 0) {
        const P = shape(rect(x, y, w, h), { fill: GOLD.g, lw: 0, stroke: false, boil: 0 });
        g.save(); g.clip(P);
        push(); bands([GOLD.g, GOLD.amber, GOLD.g], y, y + h, x, x + w); pop();
        // Papa en silhouette dans la lumière, entre par la gauche
        if (o.papa > 0) { const u = o.papa; papa({ x: lerp(x - 90, x + w * .52, u), y: FLOOR, s: .76, sil: 1, wave: o.wave || 0, doorHand: 1 }); }
        g.restore();
        shape(rect(x, y, w, h), { fill: null, lw: 6 });
      } else shape(rect(x, y, w, h), { fill: pal.woodS, lw: 6, shade: () => fillOnly(rect(x, y, w, h), '#3a2420', { boil: 0 }) });
      // le battant : pivote sur la charnière gauche, vers la pièce (trapèze qui se rétrécit)
      const k = 1 - .86 * back(op, 1.2) * (op > 0 ? 1 : 0), ww = w * clamp(k, .1, 1), grow = (1 - k) * 60;
      const door = [[x, y - grow * .6], [x + ww, y - grow], [x + ww, FLOOR + grow], [x, FLOOR + grow * .6]];
      shape(door, { fill: pal.wood, lw: 6, shade: () => { fillOnly(rr(x + ww * .18, y + 40, ww * .64, 180, 10), pal.woodS, { boil: .3 }); fillOnly(rr(x + ww * .18, y + 270, ww * .64, 200, 10), pal.woodS, { boil: .3 }); } });
      shape(ell(x + ww * .84, y + h * .52, 11 * Math.max(.3, k), 11, 12), { fill: C.yel, lw: 4 });   // poignée
    }
  }
  // fenêtre ronde + ciel
  windowSky(t);
  windowRim();
  // guirlande d'étoiles : une ficelle qui pend, des étoiles jaunes
  const rg = rev('garland');
  if (rg.on) {
    const pts = quad(GARLAND[0], GARLAND[1], GARLAND[2], 30);
    stroke(pts.slice(0, Math.max(2, Math.ceil(pts.length * rg.u))), 4);
    const rs = rev('gstars');
    if (rs.on) for (let i = 0; i < 7; i++) {
      if (RT < 12.8 && RT < REV.gstars + i * .2) continue;
      const u = (i + 1) / 8, a = GARLAND[0], c = GARLAND[1], b = GARLAND[2], x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1];
      stroke([[x, y], [x, y + 22]], 3);
      star5(x, y + 44, 22, C.yel, 5);
    }
  }
  // table de nuit + veilleuse lune
  const { x: tx0, w: tw, y: ty } = TABLE;
  el('table', dense([[tx0, ty], [tx0 + tw, ty], [tx0 + tw, FLOOR], [tx0, FLOOR]], 40), { fill: pal.wood, lw: 6, shade: () => { fillOnly(rect(tx0 + tw * .7, ty, tw * .3, FLOOR - ty), pal.woodS, { boil: .3 }); fillOnly(rr(tx0 + 22, ty + 40, tw - 44, 50, 8), pal.woodS, { boil: .3 }); } });
  if (rev('table').fill) { stroke([[tx0 - 10, ty], [tx0 + tw + 10, ty]], 6); shape(ell(tx0 + tw / 2, ty + 65, 9, 9, 10), { fill: C.yel, lw: 4 }); }
  const rl = rev('lamp');
  if (rl.on) {
    const { x, y } = LAMP;
    el('lampBase', dense([[x - 34, ty], [x + 34, ty], [x + 26, ty - 18], [x - 26, ty - 18]], 20), { fill: pal.woodS, lw: 5 });
    if (rl.fill) fillOnly(ell(x, y, 62, 62, 30), SKY.ring, { boil: .4 });
    el('lamp', spline([...arc(x, y, 42, 42, -Math.PI * .5, Math.PI * .5, 16), ...arc(x - 14, y, 36, 36, Math.PI * .5, -Math.PI * .5, 14)]), { fill: pal.lamp, lw: 6, shade: () => fillOnly(ell(x + 30, y + 16, 7, 9, 10), pal.lampS, { boil: .3 }) });
    if (rl.fill) { stroke(arc(x + 26, y - 12, 6, 4, Math.PI * 1.1, Math.PI * 1.9, 8), 3); stroke(arc(x + 28, y + 8, 7, 5, .2, Math.PI - .2, 8), 3); }   // la lune dort et sourit
  }
}
REV.lampBase = REV.lamp;

// —— lit : cadre, matelas, oreiller (avant Aliyah) ——
export function bedBack(pal) {
  const { x0, x1, top, bot } = BED;
  const rb = rev('bed'); if (!rb.on) return;
  // pieds + tête de lit
  el('bed', dense([[x1 - 40, 560], [x1 + 10, 560], [x1 + 10, FLOOR], [x1 - 40, FLOOR]], 40), { fill: pal.bed, lw: 6, shade: () => fillOnly(rect(x1 - 10, 560, 20, FLOOR - 560), pal.bedS, { boil: .3 }) });
  if (rb.fill) {
    shape(dense([[x0 - 10, 620], [x0 + 30, 620], [x0 + 30, FLOOR], [x0 - 10, FLOOR]], 40), { fill: pal.bed, lw: 6, shade: () => fillOnly(rect(x0 + 16, 620, 14, FLOOR - 620), pal.bedS, { boil: .3 }) });
    // matelas (bas, blanc) avec ombre dure sous le bord
    shape(rr(x0 + 10, top, x1 - x0 - 50, bot - top, 22), { fill: pal.bed, lw: 7, shade: () => fillOnly(rect(x0, top + (bot - top) * .62, x1 - x0, 60), pal.bedS, { boil: .3 }) });
    // oreiller
    shape(ell(PILLOW.x, PILLOW.y, PILLOW.rx, PILLOW.ry, 30), { fill: pal.bed, lw: 6, shade: () => fillOnly(ell(PILLOW.x + 30, PILLOW.y + 16, PILLOW.rx * .6, PILLOW.ry * .5, 16), pal.bedS, { boil: .3 }) });
  } else if (rb.u >= 1) {
    shape(rr(x0 + 10, top, x1 - x0 - 50, bot - top, 22), { fill: null, lw: 7 });
    shape(ell(PILLOW.x, PILLOW.y, PILLOW.rx, PILLOW.ry, 30), { fill: null, lw: 6 });
  }
}
// —— couette lilas à petites étoiles ; up : 0 Aliyah couchée → 1 assise (le bord supérieur change)
export function duvet(pal, up = 0) {
  const rd = rev('duvet'); if (!rd.on) return;
  const ly = [[715, 668], [900, 652], [1050, 668], [1180, 704], [1300, 742], [1430, 762]];
  const si = [[715, 668], [900, 652], [1050, 668], [1130, 690], [1250, 696], [1430, 724]];
  const edge = ly.map((p, i) => [lerp(p[0], si[i][0], up), lerp(p[1], si[i][1], up)]);
  const pts = spline([...edge, [1440, 790], [1300, 798], [1000, 804], [730, 792]]);
  const ok = el('duvet', pts, { fill: pal.duvet, lw: 7, shade: () => { fillOnly(spline([[1130, 690 + 50 * (1 - up)], [1440, 740], [1470, 820], [1100, 820]]), pal.duvetS, { boil: .4 }); fillOnly(rect(700, 775, 800, 60), pal.duvetS, { boil: .3 }); } });
  if (ok) {
    const rs = rev('duvetStars');
    if (rs.on) for (let i = 0; i < 9; i++) {
      if (RT < 12.8 && RT < REV.duvetStars + i * .07) continue;
      const x = 760 + (i % 5) * 120 + (i > 4 ? 60 : 0), y = 712 + Math.floor(i / 5) * 48 + (i % 2) * 10;
      if (x > 1150 && y < 720 + 30 * (1 - up)) continue;
      star5(x, y, 9, '#f6f1ea', 3);
    }
  }
}
export const bunnyHome = (t, held) => { if (held) return; const r = rev('bunny'); if (!r.on) return; if (!r.fill) { stroke(ell(BUNNY_HOME[0], BUNNY_HOME[1] - 60, 50, 80, 24).slice(0, Math.ceil(25 * r.u) + 1), 6); return; } bunny(BUNNY_HOME[0], BUNNY_HOME[1], .62, { tilt: -.1 }); };
