// « Notre Père dans ma chambre » — test 40 s, style Sci-Fi Sitcom Toon adapté aux enfants
// La timeline (plans, poses, étiquettes, sous-titres, événements son) est ici, en un seul endroit.
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, S, reset } from './toon.js';
import { aliyah, headAliyah, papa, bunny, star5, C } from './aliyah.js';
import * as R from './room.js';

init(document.getElementById('c'));
const Q = new URLSearchParams(location.search);
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const CUES = (await J('cues.json')) || [];
export const DUR = 40;
const q = R.q12;                              // personnages sur deux images (12 fps)
const pal = t => t < 12.8 ? R.DAY : R.NIGHT;

// —— temps clés ——
const T = {
  night: 12.8, blinks: [15.2, 19.9, 23.0, 31.0, 33.3, 35.6, 39.4],
  lookUp: [13.0, 13.6], lookWin: [18.9, 19.6], skyA: [20.6, 22.4], react1: 22.4,
  antic: 23.95, sit: 24.1, shake: 24.3, cry: [24.1, 26.2], squeeze: [26.6, 29.5], peek: 29.5,
  whip: [30.1, 30.4], turnL: 30.6, turnR: 31.2, grab: 31.45, insert: [31.6, 32.7], skyB: [32.7, 34.0], react2: [34.0, 34.8],
  pause: [34.8, 36.3], pan: [36.3, 37.3], door: [36.9, 37.7], light: 37.1, band: [37.3, 39.2], papa: [37.6, 38.5], tagPapa: 38.0, wave: 38.6,
};
// plans [début, fin, nom]
const SHOTS = [[0, 5.5, 'wide'], [5.5, 12.8, 'push'], [12.8, 18.8, 'cuCeil'], [18.8, 20.6, 'medWin'], [20.6, 22.4, 'sky'], [22.4, 24.1, 'cuReact1'],
  [24.1, 30.1, 'sit'], [30.1, 31.6, 'wideLook'], [31.6, 32.7, 'insert'], [32.7, 34.0, 'sky'], [34.0, 34.8, 'cuReact2'], [34.8, 36.3, 'pause'], [36.3, 40, 'door']];
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
// étiquettes monde [début, fin, texte, couleur]
const TAGS = [[1.0, 20.6, 'MA CHAMBRE', R.DAY.tag], [20.6, 22.4, 'LE CIEL', R.SKY.tag], [22.4, 32.7, 'MA CHAMBRE', R.NIGHT.tag], [32.7, 34.8, 'LE CIEL', R.SKY.tag], [34.8, 38.0, 'MA CHAMBRE', R.NIGHT.tag], [38.0, 40.5, 'PAPA', R.GOLD.tag]];

// —— caméra (sur une image) ——
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const LY_HEAD = [1366, 712], SIT_HEAD = [1180, 502];   // centre de la tête d'Aliyah couchée / assise (monde)
function camera(t) {
  const [a, b, name] = shotAt(t);
  switch (name) {
    case 'wide': return cam(960, 540, 1);
    case 'push': { const u = ss(seg(t, 5.5, 12.8)); return cam(lerp(960, 1230, u), lerp(540, 600, u), lerp(1, 1.6, u)); }
    case 'cuCeil': return cam(LY_HEAD[0], LY_HEAD[1] - 16, 2.8);
    case 'medWin': return cam(1300, 540, 1.2);
    case 'sky': return cam(R.WIN.cx, R.WIN.cy, 2.6);
    case 'cuReact1': return cam(LY_HEAD[0], LY_HEAD[1] - 22, 2.8);
    case 'sit': { const sh = t >= T.shake && t < T.shake + .17 ? 7 : 0; return cam(1200, 548, 1.7, sh, t); }
    case 'wideLook': { const u = eo(seg(t, T.whip[0], T.whip[1])); return cam(lerp(1200, 960, u), lerp(548, 540, u), lerp(1.7, 1, u)); }
    case 'insert': return cam(1180, 622, 3.2);
    case 'cuReact2': return cam(SIT_HEAD[0], SIT_HEAD[1] - 2, 2.4);
    case 'pause': { const u = seg(t, T.pause[0], T.pause[1]); return cam(1000, 560, lerp(1.3, 1.35, u)); }
    case 'door': { const u = ss(seg(t, T.pan[0], T.pan[1])); return cam(lerp(1000, 920, u), lerp(560, 570, u), lerp(1.35, 1.2, u)); }
  }
}

// —— le jeu d'Aliyah : une seule fonction du temps, continue à travers les coupes ——
const blink = t => T.blinks.some(b => t >= b && t < b + .12);
const lk = (t, a, b, from, to) => { const u = ss(seg(t, a, b)); return [lerp(from[0], to[0], u), lerp(from[1], to[1], u)]; };
function A(t) {
  const tq = q(t);
  const P = { x: 1180, y: 690, s: .7, t: tq, look: [0, 0], brow: 0, worry: 0, mouth: { o: 0, sm: .2 }, blink: blink(tq), sq: 1 + .01 * Math.sin(tq * 2.2) };
  // couchée → assise (anticipation : la tête s'enfonce, puis elle se redresse en 0,25 s)
  const up = eo(seg(tq, T.sit, T.sit + .25));
  P.up = up; P.headRot = lerp(-.22, 0, up);
  if (tq >= T.antic && tq < T.sit) P.headSq = -.07;
  if (tq >= T.sit && tq < T.sit + .3) P.sq = 1 + .05 * Math.sin(seg(tq, T.sit, T.sit + .3) * Math.PI);
  // bras : couchée, mains posées sur la couette ; assise, mains sur la couette, poings serrés ou le lapin
  const armsLy = { L: { h: [46, 118], bend: -14 }, R: { h: [-20, 160], bend: 6 } };
  let armsSit = { L: { h: [-30, 150], bend: -22 }, R: { h: [30, 150], bend: 22 } };
  if (tq >= T.cry[0] + .15 && tq < T.squeeze[1] + .3) armsSit = { L: { h: [-58, 4], bend: -40, fist: true }, R: { h: [58, 4], bend: 40, fist: true } };   // poings serrés contre les joues
  if (tq >= T.grab) armsSit = { L: { h: [-18, 104], bend: -26 }, R: { h: [18, 104], bend: 26 } };
  const mixArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
  P.armL = mixArm(armsLy.L, armsSit.L, up); P.armR = mixArm(armsLy.R, armsSit.R, up);
  if (tq >= T.grab && tq < T.pause[0] + .3) { P.hold = 'bunny'; P.bunnyP = { look: [0, -.6] }; }
  // regard et sourcils
  if (tq < T.night) P.look = [0, 0];
  else if (tq < T.lookWin[0]) P.look = lk(tq, T.lookUp[0], T.lookUp[1], [.3, .25], [0, -.08]);
  else if (tq < T.react1) P.look = lk(tq, T.lookWin[0], T.lookWin[1], [0, -.08], [.78, -.62]);
  else if (tq < T.sit) { P.look = lk(tq, T.react1, T.react1 + .3, [.78, -.62], [.15, -.15]); P.worry = .8; P.brow = .4; P.mouth = { o: 0, sm: -.15, skew: .5, w: .7 }; }
  else if (tq < T.cry[1]) { P.look = [0, -.1]; P.brow = .9; P.mouth = { o: .95, w: 1.2, sm: -.1, big: 1.7 }; }
  else if (tq < T.squeeze[0]) { P.look = [0, 0]; P.brow = .3; P.mouth = { o: .3 * (1 - seg(tq, T.cry[1], T.squeeze[0])), w: 1, sm: 0 }; }
  else if (tq < T.peek) { P.squeeze = 1; P.cheeks = 1; P.brow = -.5; P.mouth = { o: 0, sm: -.3, w: .6 }; P.jitter = 2.5; if (tq > 27.8 && tq < 29.4) P.sweat = tq * 1.1; }
  else if (tq < T.whip[0]) { P.squeeze = 1; P.peek = 1; P.cheeks = .4; P.look = [-.5, .3]; P.brow = -.2; P.mouth = { o: 0, sm: -.1, w: .7 }; }
  else if (tq < T.turnR) { P.look = lk(tq, T.turnL, T.turnL + .2, [-.3, .2], [-.85, .1]); P.headRot = -.14 * ss(seg(tq, T.turnL, T.turnL + .2)); P.brow = .3; P.mouth = { o: 0, sm: .05, w: .8 }; }
  else if (tq < T.grab) { P.look = lk(tq, T.turnR, T.turnR + .2, [-.85, .1], [.85, .1]); P.headRot = lerp(-.14, .14, ss(seg(tq, T.turnR, T.turnR + .2))); P.brow = .3; P.mouth = { o: 0, sm: .05, w: .8 }; }
  else if (tq < T.skyB[0]) { P.look = lk(tq, T.grab, T.grab + .25, [.85, .1], [0, .75]); P.headRot = lerp(.14, .05, ss(seg(tq, T.grab, T.grab + .25))); P.brow = .2; P.mouth = { o: .15, sm: .1, w: .8 }; }
  else if (tq < T.react2[0]) { P.look = lk(tq, T.skyB[0], T.skyB[0] + .3, [0, .75], [.78, -.62]); P.headRot = .05; P.brow = .4; P.mouth = { o: 0, sm: .1, w: .8 }; }
  else if (tq < T.pause[0]) { P.look = [.1, -.2]; P.eyeJit = 2.2; P.worry = .9; P.brow = .6; P.mouth = { o: .1, sm: -.2, w: .6 }; }
  else if (tq < T.door[0]) { P.look = lk(tq, T.pause[0], T.pause[0] + .4, [.1, -.2], [-.72, .12]); P.headRot = -.1 * ss(seg(tq, T.pause[0], T.pause[0] + .4)); P.brow = .1; P.mouth = { o: 0, sm: .05, w: .75 }; }
  else {
    const op = ss(seg(tq, T.door[0] + .1, T.door[0] + .5)), sm = ss(seg(tq, 38.1, 38.5));
    P.look = [-.72 + .1 * op, .12 - .1 * op]; P.headRot = -.1 - .06 * op; P.brow = .9 * op * (1 - sm * .4); P.worry = -.3 * sm;
    P.mouth = { o: lerp(0, .5, op) * (1 - sm) + sm * .25, w: lerp(.75, 1, op), sm: lerp(.05, .95, sm) };
    // petit signe de la main droite : anticipation (la main descend), levée, deux balancements, tenue
    const dip = Math.sin(seg(tq, T.wave - .15, T.wave) * Math.PI), rise = ss(seg(tq, T.wave, T.wave + .3)), wig = tq >= T.wave + .3 && tq < T.wave + 1.1 ? Math.sin((tq - T.wave - .3) * TAU * 1.6) : 0;
    P.armL = { h: [lerp(-30, -118, rise) - wig * 10, lerp(150 + dip * 10, -16, rise)], bend: lerp(-22, 10, rise), rot: -wig * .25 };
  }
  if (tq < 12.8) P.rv = { head: R.rev('head'), puffs: R.rev('puffs'), bows: R.rev('bows'), pj: R.rev('pj'), star: R.rev('star'), eyes: R.rev('eyes'), brows: R.rev('brows') };
  return P;
}

// —— la scène complète (chambre + Aliyah + porte), vue par la caméra courante ——
function scene(t) {
  R.setRevealTime(t);
  const p = pal(t);
  const op = ss(seg(t, T.door[0], T.door[1]));
  const light = t < T.light ? 0 : back(clamp((t - T.light) / .3), 1.7);
  const band = t < T.band[0] ? 0 : back(seg(t, T.band[0], T.band[1]), 1.7);
  const pp = ss(seg(t, T.papa[0], T.papa[1]));
  const P = A(t);
  R.roomBack(t, p, { door: op, light, band, papa: pp });
  R.bedBack(p);
  aliyah(P, 'body');
  R.duvet(p, P.up);
  R.bunnyHome(t, P.hold === 'bunny' || t >= T.grab);
  aliyah(P, 'front');
  if (light > 0) screenRect(R.GOLD.wash, clamp(light));   // lavis doré sur toute la chambre tant que la porte est ouverte
}

// —— étiquette monde : terminal rétro tapé lettre à lettre, dans la couleur du monde ——
function tag(t) {
  for (const [a, b, s, col] of TAGS) {
    if (t < a || t >= b) continue;
    const n = Math.min(s.length, Math.floor((t - a) * 40)), s1 = s.slice(0, n);
    const pop_ = back(seg(q(t), a, a + .17), 2);
    reset(); push(); translate(64, 56); scale(pop_);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '400 46px VT323'; const w = g.measureText('▶ ' + s).width + 44;
    shape(rr(0, 0, w, 72, 10), { fill: '#2a1a2e', lw: 6 });
    text('▶ ' + s1 + (n < s.length && Math.floor(t * 6) % 2 ? '█' : ''), 22, 38, { font: '400 46px VT323', fill: col, align: 'left' });
    pop();
  }
}
// —— sous-titres : Baloo 2 ExtraBold blanc à contour noir, pastille « Aliyah » jaune ——
const SUBS = CUES.map((c, i) => ({ id: 's' + i, t0: c.t0, t1: c.t1, who: 'Aliyah', lines: c.text.split('\n') }));
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const pop_ = back(seg(q(t), s.t0, s.t0 + .12), 2);
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 50px "Baloo 2"';
  const tw = Math.max(...s.lines.map(l => g.measureText(l).width)); g.font = '800 26px "Baloo 2"'; const nw = g.measureText(s.who).width + 34;
  const total = nw + 22 + tw, x0 = (W - total) / 2, y0 = H - 92 - (s.lines.length - 1) * 64;
  reset(); push(); translate(x0 + nw / 2, y0 - 4); scale(pop_); translate(-nw / 2, 0);
  shape(rr(0, -22, nw, 44, 14), { fill: C.yel, lw: 5 });
  text(s.who, nw / 2, 2, { font: '800 26px "Baloo 2"', fill: INK });
  pop();
  reset(); push(); translate(x0 + nw + 22, y0); scale(1, pop_);
  s.lines.forEach((l, k) => text(l, 0, k * 64, { font: '800 50px "Baloo 2"', fill: '#fff', align: 'left', outlineW: 11 }));
  pop();
}

// —— planche-modèle (?sheet=1) ——
function label(s, x, y, size = 26) { reset(); text(s, x, y, { font: `700 ${size}px "Baloo 2"`, fill: INK }); }
function sheet(t) {
  frame(t, { amp: 1.4 }); screenRect('#f6f1ea');
  label('ALIYAH · planche-modèle · « Notre Père dans ma chambre »', 960, 44, 40);
  // 1. turnaround (bustes)
  const views = ['face', 'trois quarts', 'profil', 'dos'];
  views.forEach((v, i) => { reset(); translate(170 + i * 230, 330); aliyah({ x: 0, y: 0, s: .55, up: 1, view: i, look: [0, 0], armL: { h: [-24, 150], bend: -16 }, armR: { h: [24, 150], bend: 16 } }); label(v, 170 + i * 230, 372); });
  label('Turnaround', 500, 100, 28);
  // 2. expressions
  const EX = [['yeux grands ouverts', { look: [0, -.08], brow: .2 }], ['yeux serrés fort', { squeeze: 1, cheeks: 1, brow: -.5, mouth: { o: 0, sm: -.3, w: .6 } }],
    ['« crier ? »', { look: [0, -.1], brow: .9, mouth: { o: .95, w: 1.2, sm: -.1, big: 1.7 } }], ['sourire (la porte)', { look: [-.6, .1], mouth: { o: .25, sm: .95 }, brow: .3 }], ['« je sais pas... »', { look: [.15, -.15], worry: .8, brow: .4, mouth: { o: 0, sm: -.15, skew: .5, w: .7 } }]];
  EX.forEach(([n, p], i) => { reset(); translate(1090 + i * 185, 250); scale(.5); headAliyah(p); label(n, 1090 + i * 185, 340, 19); });
  label('Expressions', 1440, 100, 28);
  // 3. poses
  label('Poses', 560, 440, 28);
  // couchée, un morceau de couette
  reset(); translate(140, 560); scale(.8);
  shape(ell(240, 60, 120, 40, 30), { fill: '#f6f1ea', lw: 6 });
  aliyah({ x: 50, y: 40, s: .7, up: 0, headRot: -.22, look: [0, -.08], armL: { h: [46, 118], bend: -14 } }, 'body');
  shape(spline([[-120, 20], [40, 10], [160, 60], [300, 70], [330, 130], [-130, 130]]), { fill: R.NIGHT.duvet, lw: 7, shade: () => fillOnly(rect(-140, 100, 500, 40), R.NIGHT.duvetS, { boil: .3 }) });
  aliyah({ x: 50, y: 40, s: .7, up: 0, headRot: -.22, look: [0, -.08], armL: { h: [46, 118], bend: -14 } }, 'front');
  label('couchée, les yeux ouverts', 300, 700, 22);
  reset(); translate(640, 700); aliyah({ x: 0, y: 0, s: .62, up: 1, squeeze: 1, cheeks: 1, brow: -.5, mouth: { o: 0, sm: -.3, w: .6 }, armL: { h: [-58, 4], bend: -40, fist: true }, armR: { h: [58, 4], bend: 40, fist: true } });
  label('assise, poings serrés', 640, 740, 22);
  reset(); translate(900, 700); aliyah({ x: 0, y: 0, s: .62, up: 1, look: [0, .75], headRot: .05, mouth: { o: .15, sm: .1, w: .8 }, hold: 'bunny', bunnyP: { look: [0, -.6] }, armL: { h: [-18, 104], bend: -26 }, armR: { h: [18, 104], bend: 26 } });
  label('assise, avec le lapin', 900, 740, 22);
  // 4. Papa : en couleurs et en silhouette dans la porte
  label('Papa', 1420, 440, 28);
  reset(); translate(1240, 1000); papa({ x: 0, y: 0, s: .62, sil: 0, look: [-.2, .2] });
  reset(); translate(1500, 1000);
  shape(rect(-110, -520, 220, 520), { fill: R.GOLD.g, lw: 6 });
  papa({ x: 0, y: 0, s: .62, sil: 1 });
  label('à contre-jour (fin)', 1500, 1030, 20); label('chemise de travail, barbe courte', 1240, 1030, 20);
  // 5. palettes
  label('Palettes (une par monde)', 1720, 440, 24);
  const sw = [['chambre', [R.DAY.wall, R.DAY.duvet, R.DAY.bed, R.DAY.wood, C.yel]], ['chambre, nuit', [R.NIGHT.wall, R.NIGHT.duvet, R.NIGHT.bed, R.NIGHT.wood, C.yel]], ['ciel', [R.SKY.b[0], R.SKY.b[2], R.SKY.rim, R.SKY.moon, '#ffffff']], ['couloir de Papa', [R.GOLD.g, R.GOLD.amber, C.sil, INK, '#ffffff']], ['Aliyah', [C.skin, C.hair, C.pj, C.yel, C.iris]]];
  sw.forEach(([n, cols], r) => { reset(); cols.forEach((c, i) => shape(rr(1640 + i * 46, 470 + r * 90, 40, 40, 8), { fill: c, lw: 4 })); label(n, 1750, 540 + r * 90, 18); });
  reset(); text('trait #1a1022 · 7 px personnages, 5 px décor · boil 3 dessins à 12 fps', 560, 1040, { font: '700 18px "Baloo 2"', fill: INK });
}

// —— rendu ——
function poster() {   // affiche : la fin, cadrée plus serré, sans sous-titre, avec le titre
  frame(39.3); screenRect('#f6f1ea'); cam(920, 600, 1.25); scene(39.3); reset();
  text('Notre Père dans ma chambre', 960, 120, { font: '800 96px "Baloo 2"', fill: '#fff', outlineW: 18 });
  text('une chanson pour les enfants', 960, 200, { font: '800 40px "Baloo 2"', fill: C.yel, outlineW: 10 });
}
function render(t) {
  if (Q.get('sheet')) return sheet(t);
  if (Q.get('poster')) return poster();
  frame(t);
  screenRect('#f6f1ea');
  camera(t);
  scene(t);
  tag(t);
  subs(t);
}

// —— événements son (events.json → mix.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const k of ['floor', 'door', 'window', 'sky', 'moon', 'garland', 'wallFill', 'bed', 'duvet', 'table', 'lamp', 'bunny', 'head', 'puffs', 'bows', 'pj', 'star']) add('pop', q(R.REV[k] + .5), { v: .6 });
  for (let i = 0; i < 7; i++) add('pop', q(R.REV.gstars + i * .2), { v: .35 });
  add('blip', 12.0); add('blip', 12.3, { v: .6 });
  for (const [a, , s] of TAGS) for (let i = 0; i < s.length; i++) if (s[i] !== ' ') add('key', a + i / 40, { v: .5 });
  add('night', T.night);
  T.blinks.forEach(b => add('blip', b, { v: .5 }));
  add('whoosh', T.skyA[0]); add('whoosh', T.react1, { v: .6 }); add('whoosh', T.skyB[0]); add('whoosh', T.react2[0], { v: .6 });
  add('fwump', T.sit); add('squeak', T.shake, { v: .6 }); add('pop', T.squeeze[0], { v: .5 }); add('blip', T.peek, { v: .6 });
  add('whoosh', T.whip[0], { v: 1.1 }); add('toy', T.grab + .1); add('toy', T.insert[0] + .5, { v: .7 });
  add('creak', T.door[0]); add('glow', T.light); add('wave', T.wave);
  for (const c of CUES) add('subpop', c.t0, { v: .3 });
  return ev.sort((a, b) => a.t - b.t);
}
window.TEXTS = t => { const out = []; for (const [a, b, s] of TAGS) if (t >= a + s.length / 40 && t < b) out.push({ id: 'tag' + a, text: s, x0: 64, y0: 56, x1: 64 + 300, y1: 128 }); return out; };
window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 50px "Baloo 2"', '700 26px "Baloo 2"', '400 46px VT323']) await document.fonts.load(f);
render(parseFloat(Q.get('t') ?? '20'));
window.READY = true;
