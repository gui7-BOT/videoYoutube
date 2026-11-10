// « Notre Père dans ma chambre » : 40 s, une seule page, une caméra continue. La chanson commande ; les sous-titres sont cues.json.
import { layer, clear, line, fill, dab, text, CAM, BOIL, W, H, sx, sy } from './crayon.js';
import { group, clearGroup, part } from './rig.js';
import { aliyah, papa } from './aliyah.js';
import { drawRoom, duvet, drawWash, WASH, PILLOW, DOOR, FLOOR, pr } from './room.js';
import { PAL } from './pal.js';
import { clamp, lerp, hash, track, ss, eo } from '/core/lib.js';
const K = PAL.crayon;
export const DUR = 40;
export let SUBS = [];
export function setCues(c) { SUBS = c.map(q => ({ t0: q.t0, t1: Math.min(q.t1 + 0.3, DUR), text: q.text })); }

// ——— caméra : centre (x, y) en coordonnées page + zoom ———
const SIT = [1900, 1080, 1.3];
const camT = track([
  [0, [1600, 900, 0.6]], [5.5, [1600, 900, 0.6]],
  [12.8, [2050, 980, 1.0]], [18.8, [2050, 980, 1.0]],          // poussée pendant l'intro, verrouillée sur le vers 1
  [19.3, [2060, 970, 1.02]], [21.2, [2350, 640, 1.35]], [22.0, [2350, 640, 1.35]],   // tilt le long du regard : la lune
  [23.6, SIT], [30.1, SIT],                                        // retour sur elle ; assise : plan verrouillé
  [32.4, [1600, 900, 0.62]], [32.7, [1600, 900, 0.62]],            // « dans ma chambre ? » : toute la page
  [34.2, [2300, 700, 1.1]], [34.5, [2300, 700, 1.1]],            // « dehors ? » : poussée vers la fenêtre
  [35.5, SIT], [36.3, SIT],                                        // respiration, sur elle
  [37.5, [1260, 1060, 0.78]], [40, [1260, 1060, 0.78]],            // pano vers la porte, tenue
]);

// ——— événements son (exportés vers mix.py) ———
export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
// l'intro : chaque trait et chaque coloriage
[[0.4, 0.8, -0.1], [1.0, 1.1, -0.7], [1.4, 0.6, -0.6], [3.2, 1.2, 0.5], [3.9, 0.9, 0.55], [5.8, 1.0, 0.0], [6.3, 0.6, 0.3], [8.0, 0.7, 0.6], [9.0, 0.7, -0.4], [9.8, 1.0, 0.0], [10.8, 1.4, 0.2], [12.1, 0.5, 0.2]].forEach(([t, d, pan]) => ev(t, 'scratch', { dur: d, pan }));
[[2.0, 2.6, -0.2], [2.3, 1.1, -0.7], [3.8, 1.0, 0.55], [6.8, 1.4, 0.0], [8.3, 0.7, 0.6], [12.3, 0.5, 0.2]].forEach(([t, d, pan]) => ev(t, 'scribble', { dur: d, pan }));
ev(0, 'paper');
ev(WASH.t0, 'brush', { dur: WASH.t1 - WASH.t0 });
[[24.1, 0.0], [26.6, 0.0], [29.6, 0.1]].forEach(([t, pan]) => ev(t, 'pop', { pan }));
ev(36.9, 'scratch', { dur: 0.8, pan: -0.6 });          // la porte pivote
ev(37.1, 'scribble', { dur: 0.8, pan: -0.6 });         // l'embrasure dorée
ev(37.6, 'scratch', { dur: 0.9, pan: -0.5 });          // Papa
ev(37.5, 'scribble', { dur: 1.8, pan: -0.3, long: true });   // la lumière sur le sol
ev(38.6, 'scratch', { dur: 0.3, pan: 0.3 });           // le petit signe

// ——— calques ———
const RM = group(), GL = group(), PA = group(), WASHL = layer(), SUBK = layer(), SUBT = layer(), FX = layer();

// progression du dessin de la page (intro instrumentale)
function progress(t) {
  return {
    floor: pr(t, 0.4, 1.1), planks: pr(t, 1.0, 1.9), wall: pr(t, 2.0, 4.6),
    doorL: pr(t, 1.0, 2.1), doorF: pr(t, 2.3, 3.4),
    winL: pr(t, 3.2, 4.4), moonL: pr(t, 3.9, 4.4), moonF: pr(t, 4.0, 4.9),
    bedL: pr(t, 5.8, 6.8), bedF: pr(t, 6.3, 7.2),
    tableL: pr(t, 8.0, 8.7), tableF: pr(t, 8.3, 9.0),
    bunny: pr(t, 9.0, 9.8), garland: pr(t, 9.8, 10.9),
    doorOpen: ss(pr(t, 36.9, 37.7)), doorway: pr(t, 37.1, 37.9), light: pr(t, 37.5, 39.3),
  };
}

// ——— Aliyah : état par instant (substitution sur le temps) ———
function aliyahState(t) {
  const S = 1.45, base = { s: S, seed: 3000 };
  if (t < 10.8) return null;
  if (t < 24.1) {
    // couchée, tête sur l'oreiller (crown à droite). Regard : plafond puis lune.
    let look = [-0.85, 0];                                   // vers le haut de l'écran (repère tête tourné de 90°)
    let expr = 'wide', r = 0;
    const blink = [15.6, 17.4, 21.0].some(b => t >= b && t < b + 0.13);
    if (t >= 18.8) { look = [-0.7, -0.7]; r = -0.12; }       // vers la fenêtre, en haut à droite
    if (t >= 18.8 && t < 19.0) look = [-0.8, -0.35];
    if (blink) expr = 'blink';
    const duv = P => duvet(GL, 'lie', pr(t, 6.8, 8.2));
    return { ...base, x: PILLOW.x + 8, y: PILLOW.y - 10, r, pose: 'lie', expr, look, arms: 'rest', duvet: duv, headDraw: pr(t, 10.8, 12.1), bodyDraw: pr(t, 12.0, 12.7) };
  }
  // assise dans le lit
  const duv = P => duvet(GL, 'sit', 1);
  const o = { ...base, x: 1900, y: 1250, pose: 'sit', duvet: duv, expr: 'wide', arms: 'rest', look: [0, -0.2], headTilt: 0 };
  if (t < 26.6) { o.expr = 'o'; o.arms = 'open'; o.look = [0, -0.4]; o.headTilt = 0.04; }
  else if (t < 29.6) { const k = Math.floor(t * 4) % 2; o.expr = 'shut'; o.arms = 'fists'; o.headTilt = k ? 0.07 : -0.07; o.seed = 3000 + k * 50; }
  else if (t < 30.1) { o.expr = 'peek'; o.arms = 'fists'; o.look = [0.6, -0.2]; o.headTilt = -0.06; }
  else if (t < 31.4) { o.look = [-0.9, 0.15]; o.headTilt = -0.1; }
  else if (t < 32.7) { o.look = [0.9, 0.15]; o.headTilt = 0.1; }
  else if (t < 34.8) { o.look = [0.7, -0.85]; o.headTilt = 0.08; }
  else if (t < 37.9) { o.look = [-0.9, 0.15]; o.headTilt = -0.08; }
  else { o.expr = 'soft'; o.look = [-0.9, 0.1]; o.headTilt = -0.1; if (t >= 38.6) o.arms = 'wave'; }
  return o;
}

// ——— une image ———
export function frame(comp, t, Q) {
  const cam = camT(t); [CAM.x, CAM.y, CAM.s] = cam;
  BOIL.amp = (t > 34.8 && t < 36.5) || t > 39.0 ? 0.5 : 1;
  clearGroup(RM); clearGroup(GL); clearGroup(PA); [WASHL, SUBK, SUBT, FX].forEach(clear);
  const p = progress(t);
  drawRoom(RM, p);
  const a = aliyahState(t);
  if (a) aliyah(GL, a);
  if (t >= 37.6) papa(PA, { x: (DOOR.x0 + DOOR.x1) / 2 + 10, y: FLOOR - 4, s: 1.0, seed: 3900, draw: pr(t, 37.6, 38.5) });
  if (t > 6.8 && t < 10.8) duvet(GL, 'lie', pr(t, 6.8, 8.2));
  drawWash(WASHL, t);
  const poster = Q && Q.get('poster') === '1';
  if (!poster) subTo(SUBK, SUBT, t);
  else {   // l'affiche : le titre lettré à la main sur le mur, au-dessus de la guirlande
    text(FX, 'Notre Père', 1010, 190, { size: 132, font: 'Gaegu', weight: 700, col: K.ink, p: 1, stroke: 2.5, seed: 5 });
    text(FX, 'dans ma chambre', 1010, 312, { size: 112, font: 'Gaegu', weight: 700, col: K.ink, p: 1, stroke: 2.5, seed: 6 });
  }
  // composition : le papier est ancré à la page
  comp.paperCam(CAM.x * 0.6, CAM.y * 0.6, CAM.s / 0.6);
  comp.begin(PAL.paper);
  const go = [hash(BOIL.step) * 300, hash(BOIL.step + 7) * 300];
  comp.group(RM, { goff: [0, 0] });
  if (t >= WASH.t0) comp.wash(WASHL.c, { color: PAL.wash });
  comp.group(GL, { goff: go });          // Aliyah après le lavis : son visage reste lisible
  if (t >= 37.6) comp.group(PA, { goff: go });
  comp.crayon(FX.c, { goff: go });
  comp.knock(SUBK.c, PAL.paper); comp.crayon(SUBT.c);
  comp.finish({ vig: 0.3 });
}

// ——— sous-titres : les mots imprimés sur la page (Patrick Hand, prune, sur un patch de papier nu) ———
const SUB_SIZE = 50, SUB_Y = 965, LINE_H = 58;
function subBox(S) {
  const lines = S.text.split('\n');
  const g = SUBK.g; g.save(); g.font = `400 ${SUB_SIZE}px "Patrick Hand"`; const tw = Math.max(...lines.map(l => g.measureText(l).width)); g.restore();
  const hh = lines.length * LINE_H / 2 + 22;
  return { lines, cx: 960, cy: SUB_Y + (lines.length - 1) * LINE_H / 2 - 16, hw: tw / 2 + 44, hh };
}
export function subTo(SUBK, SUBT, t) {
  const S = SUBS.find(s => t >= s.t0 && t < s.t1); if (!S) return;
  const { lines, cx, cy, hw, hh } = subBox(S);
  const g = SUBK.g; g.save(); g.fillStyle = '#000'; g.beginPath();
  for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2; const px = Math.cos(a), py = Math.sin(a); const sq = Math.pow(Math.abs(px), 0.3) * Math.sign(px); const n = 1 + 0.05 * Math.sin(a * 7 + 1.3) + 0.03 * Math.sin(a * 17); const X = cx + sq * hw * n, Y = cy + py * hh * n; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath(); g.fill(); g.restore();
  lines.forEach((l, i) => text(SUBT, l, 960, SUB_Y + i * LINE_H, { size: SUB_SIZE, col: K.ink, reveal: pr(t, S.t0 + i * 0.3, S.t0 + 0.35 + i * 0.3), seed: 11 + S.t0 * 3 + i, p: 1, stroke: 1.1 }));
}
export function TEXTS(t) {
  const S = SUBS.find(s => t >= s.t0 && t < s.t1); if (!S) return [];
  const { cx, cy, hw, hh } = subBox(S);
  return [{ id: 'sub' + S.t0, text: S.text.replace('\n', ' '), x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh }];
}
