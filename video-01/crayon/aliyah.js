// Aliyah (4 ans) et Papa : rigs paramétriques dessinés "comme un adulte qui imite un enfant".
// Tête : origine = centre du visage, rayon ≈ 62 (× o.s). Corps : voir chaque pose.
import { line, fill, dab, ellipse, handCircle, xf, smooth } from './crayon.js';
import { part, tube, curve } from './rig.js';
import { PAL } from './pal.js';
import { hash, clamp, lerp } from '/core/lib.js';
const K = PAL.crayon;
const LW = 7;
function T0(o) { const k = o.flip ? -1 : 1; return pts => xf(pts, { x: o.x || 0, y: o.y || 0, s: o.s || 1, r: o.r || 0, sx: k }); }
const lo = (seed, extra = {}) => ({ w: LW, seed, ...extra });
const pr = (t, a, b) => clamp((t - a) / (b - a));

// contour festonné (masse de cheveux afro) : cercle à petites bosses
function puffPoly(cx, cy, r, seed, n = 14) {
  const out = []; const a0 = hash(seed) * 6.28;
  for (let i = 0; i <= n * 4; i++) { const a = a0 + i / (n * 4) * Math.PI * 2; const b = Math.abs(Math.sin(a * n / 2)); out.push([cx + Math.cos(a) * r * (1 + 0.09 * b), cy + Math.sin(a) * r * (1 + 0.09 * b)]); }
  return out;
}
// nœud jaune : deux boucles + un centre
function bow(C, P, x, y, s, seed, d = 1, rot = 0) {
  const R = pts => P(xf(pts, { x, y, r: rot }));
  const l1 = smooth([[0, 0], [-14, -12], [-24, -4], [-20, 8], [-6, 6]], 3), l2 = smooth([[0, 0], [14, -12], [24, -4], [20, 8], [6, 6]], 3);
  [l1, l2].forEach((L, i) => part(C, R(L), { col: K.yellow, p: 0.95, gap: 3.5, w: 5, over: 1, seed: seed + i, draw: d }, lo(seed + 2 + i, { w: 4, draw: d }), { kn: d > 0 }));
  part(C, R(ellipse(0, 0, 5, 5, 10)), { col: K.yellow, p: 1, gap: 2.5, w: 4, over: 0.5, seed: seed + 5, draw: d }, lo(seed + 6, { w: 3.5, draw: d }), { kn: d > 0 });
}
export function star5(C, c, r, seed, rot = 0, col = K.yellow, lineCol = K.ink, draw = 1) {
  const pts = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + rot + k * Math.PI / 5; const rr = k % 2 ? r * 0.48 : r; pts.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
  part(C, pts, { col, p: 0.95, gap: 3.5, w: 5, over: 1, seed, draw }, lineCol ? { w: 3.5, seed: seed + 1, col: lineCol, p: 0.8, draw } : null, { occ: false, kn: draw > 0 });
}

// ———————————————— la tête d'Aliyah ————————————————
// o: x y s r flip view(front|q|side|back) expr(wide|shut|o|soft|blink|peek) look [lx,ly] (-1..1, repère de la tête) draw(0..1) seed
export function head(C, o) {
  const T = T0(o), view = o.view || 'front', ex = o.expr || 'wide', sd = o.seed || 100, d = o.draw ?? 1;
  const P = pts => T(pts);
  const turn = { front: 0, q: 1, side: 2, back: 3 }[view];
  const look = o.look || [0, 0];
  const hairF = { col: K.hair, p: 0.92, gap: 6, w: 9, ang: 1.1, seed: sd + 1, over: 2 };
  const skinF = { col: K.skin, p: 0.88, gap: 7, w: 10, ang: 0.5, seed: sd + 2, over: 3, cross: true, crossP: 0.5 };
  const dHair = pr(d, 0, 0.35), dFace = pr(d, 0.1, 0.45), dPuff = pr(d, 0.35, 0.6), dFeat = pr(d, 0.6, 0.85), dBow = pr(d, 0.82, 1);
  // couettes : positions selon la vue
  const puffs = turn === 0 ? [[-70, -54, 34], [70, -54, 34]] : turn === 1 ? [[-46, -62, 30], [78, -50, 36]] : turn === 2 ? [[-52, -62, 36], [-84, -24, 28]] : [[-66, -54, 34], [66, -54, 34]];
  const far = turn === 1 ? [puffs[0]] : turn === 2 ? [puffs[1]] : [];
  const near = puffs.filter(p => !far.includes(p));
  const puff = (p, i, dd) => { const poly = P(puffPoly(p[0], p[1], p[2], sd + 11 + i)); part(C, poly, { ...hairF, seed: sd + 12 + i, draw: dd }, null, { kn: dd > 0 }); line(C.l, [...poly, poly[1]], lo(sd + 14 + i, { draw: dd })); };
  far.forEach((p, i) => puff(p, i + 2, dPuff));
  // calotte afro (masse arrière)
  const cap = puffPoly(0, -8, 72, sd + 3, 16).filter(q => q[1] < 10);
  cap.push([72, 10], [-72, 10]);
  part(C, P(cap), { ...hairF, draw: dHair }, null, { kn: dHair > 0 });
  line(C.l, P(cap.slice(0, cap.length - 2)), lo(sd + 4, { draw: dHair }));
  if (turn === 3) { near.forEach((p, i) => puff(p, i, dPuff)); [[-46, -36], [46, -36]].forEach(([x, y], i) => bow(C, P, x, y, 1, sd + 40 + i, dBow)); return; }
  // visage
  let face;
  if (turn < 2) face = ellipse(0, 2, 62, 60, 44);
  else face = smooth([[0, -58], [36, -50], [56, -24], [64, -2], [72, 8], [64, 16], [60, 30], [42, 52], [14, 60], [-24, 56], [-50, 32], [-60, 0], [-50, -34], [-28, -54]], 6);
  part(C, P(face), { ...skinF, draw: dFace }, null, { kn: dFace > 0 });
  if (turn < 2) line(C.l, P(ellipse(0, 2, 62, 60, 36, -0.1, Math.PI + 0.1)), lo(sd + 7, { draw: dFace }));
  else line(C.l, P(face.slice(Math.floor(face.length * 2 / 14), Math.floor(face.length * 11 / 14))), lo(sd + 7, { draw: dFace }));
  // lisière des cheveux : festons sur le haut du visage
  const hx = turn === 0 ? 0 : turn === 1 ? -10 : -22;
  const fringe = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; const bump = (i % 2) ? 8 : 0; fringe.push([Math.cos(a) * (62 + 2) + hx * 0.3, 2 + Math.sin(a) * (60 - bump) - 4]); }
  const hairTop = [...fringe, [66, -40], [60, -72], [0, -84], [-60, -72], [-66, -40]];
  part(C, P(smooth(hairTop, 3)), { ...hairF, seed: sd + 8, draw: dHair }, null, { kn: dHair > 0 });
  line(C.l, P(smooth(fringe, 3, false)), lo(sd + 9, { w: 5, draw: dHair, p: 0.8 }));
  near.forEach((p, i) => puff(p, i, dPuff));
  // nœuds
  const bows = turn === 0 ? [[-48, -42, 0.5], [48, -42, -0.5]] : turn === 1 ? [[54, -40, -0.5]] : turn === 2 ? [[-30, -48, 0.6]] : [];
  bows.forEach(([x, y, rot], i) => bow(C, P, x, y, 1, sd + 40 + i * 8, dBow, rot));
  // yeux
  const eyeX = turn === 0 ? [-24, 24] : turn === 1 ? [-6, 32] : [40];
  const eyeY = 4, k = turn === 1 ? [0.8, 1] : [1, 1];
  eyeX.forEach((x, i) => eye(C, P, x, eyeY, ex, sd + 20 + i * 4, o, k[i] ?? 1, turn, look, i, dFeat));
  // joues
  const ck = turn === 0 ? [[-40, 26], [40, 26]] : turn === 1 ? [[-24, 28], [48, 24]] : [[30, 26]];
  const puffed = ex === 'shut';
  ck.forEach(([x, y], i) => dab(C.f, ...P([[x, y]])[0], (puffed ? 14 : 10) * (o.s || 1), { col: K.pink, p: puffed ? 0.8 : 0.55, seed: sd + 30 + i, sq: 0.75 }));
  // nez : un petit trait
  const nx = turn === 0 ? 0 : turn === 1 ? 14 : 58;
  if (turn < 2) line(C.l, P([[nx - 5, 14], [nx + 1, 20], [nx + 6, 15]]), lo(sd + 35, { w: 4, p: 0.8, draw: dFeat }));
  // bouche
  mouth(C, P, turn === 0 ? 0 : turn === 1 ? 14 : 40, 36, ex, sd + 50, turn, dFeat);
  // sourcils
  brows(C, P, eyeX, ex, sd + 60, turn, dFeat);
}
function eye(C, P, x, y, ex, sd, o, k, turn, look, i, d) {
  const s = o.s || 1;
  const squeezed = ex === 'shut' || (ex === 'peek' && i === 0);
  if (ex === 'blink') { line(C.l, P([[x - 11 * k, y + 1], [x - 4 * k, y + 5], [x + 4 * k, y + 5], [x + 11 * k, y + 1]]), lo(sd, { w: 5, taper: 0.3, draw: d })); return; }
  if (squeezed) {   // œil serré très fort : chevron vers le nez + petites pattes d'oie
    const dir = x < 0 ? 1 : -1;   // pointe vers le centre du visage
    line(C.l, P([[x - 12 * dir, y - 8], [x + 4 * dir, y], [x - 12 * dir, y + 8]]), lo(sd, { w: 5.5, draw: d }));
    for (let j = -1; j <= 1; j++) line(C.l, P([[x - 15 * dir, y + j * 9], [x - 24 * dir, y + j * 13]]), lo(sd + 1 + j, { w: 3.5, p: 0.7, taper: 0.4, draw: d }));
    return;
  }
  const big = ex === 'o' || ex === 'wide' || ex === 'peek';
  const rx = (big ? 15 : 13) * k, ry = big ? 13 : 11;
  const sc = ellipse(x, y, rx, ry, 20);
  part(C, P(sc), { col: K.white, p: 1, gap: 3, w: 5, over: 0.5, seed: sd, draw: d }, lo(sd + 1, { w: 4, draw: d }), { occ: true, kn: false });
  const pr_ = ex === 'o' ? 6.5 : 8;
  const px = x + look[0] * (rx - pr_ * 0.8) * 0.9, py = y + look[1] * (ry - pr_) * 0.9;
  part(C, P(ellipse(px, py, pr_ * k, pr_ * 1.05, 16)), { col: K.hair, p: 1, gap: 3, w: 5, over: 0.4, seed: sd + 2, ang: 1.3, draw: d }, lo(sd + 3, { w: 3.5, draw: d }), { occ: false, kn: false });
  dab(C.l, ...P([[px + 2.6 * k, py - 3]])[0], 2.6 * s, { col: K.white, p: 1, seed: sd + 4, gap: 2, w: 3 });
  if (ex === 'soft') {   // paupière à demi baissée
    const lid = [[x - rx - 3, y - ry - 4], [x + rx + 3, y - ry - 4], [x + rx + 3, y - 2], [x - rx - 3, y - 2]];
    part(C, P(lid), { col: K.skin, p: 0.9, gap: 4, w: 6, over: 1, seed: sd + 5, draw: d }, null, { occ: true, kn: false });
    line(C.l, P([[x - rx - 2, y - 2], [x + rx + 2, y - 2]]), lo(sd + 6, { w: 4.5, draw: d }));
  }
}
function mouth(C, P, x, y, ex, sd, turn, d) {
  const k = turn === 2 ? 0.6 : 1;
  if (ex === 'o') { const m = ellipse(x, y + 2, 9 * k, 11, 20); part(C, P(m), { col: K.pink, p: 0.9, gap: 3, w: 4, over: 0.5, seed: sd, draw: d }, lo(sd + 1, { w: 4.5, draw: d }), { occ: false, kn: d > 0 }); return; }
  if (ex === 'shut') { line(C.l, P([[x - 8 * k, y + 2], [x, y + 4], [x + 8 * k, y + 2]]), lo(sd, { w: 5, draw: d })); return; }
  if (ex === 'soft') { line(C.l, P([[x - 12 * k, y - 4], [x - 5 * k, y + 4], [x + 5 * k, y + 4], [x + 12 * k, y - 4]]), lo(sd, { w: 4.5, draw: d })); return; }
  if (ex === 'peek') { line(C.l, P([[x - 7 * k, y + 2], [x + 2 * k, y + 5], [x + 9 * k, y]]), lo(sd, { w: 4.5, draw: d })); return; }
  line(C.l, P([[x - 7 * k, y - 1], [x, y + 3], [x + 7 * k, y - 1]]), lo(sd, { w: 4.5, draw: d }));
}
function brows(C, P, eyeX, ex, sd, turn, d) {
  eyeX.forEach((x, i) => {
    const inner = x < 0 ? 1 : -1;   // +1 si le côté intérieur est à droite
    let a = [x - 11, -18], b = [x + 11, -18];
    if (ex === 'o') { a = [x - 12, -26]; b = [x + 12, -26]; line(C.l, P([a, [x, -31], b]), lo(sd + i, { w: 4, p: 0.9, draw: d })); return; }
    if (ex === 'shut' || (ex === 'peek' && i === 0)) { a = [x - 12 * inner, -14]; b = [x + 10 * inner, -8]; }   // pressés vers le bas, côté nez
    else if (ex === 'wide') { a = [x - 11, -20]; b = [x + 11, -22]; }
    else if (ex === 'soft') { a = [x - 11, -18]; b = [x + 11, -20]; }
    line(C.l, P([a, b]), lo(sd + i, { w: 4, p: 0.85, draw: d, taper: 0.3 }));
  });
}

// ———————————————— le corps d'Aliyah ————————————————
// pose: stand (origine entre les pieds, ~340 de haut) | lie (origine = centre de la tête, couchée, tête à droite) | sit (origine = hanches)
// o.duvet(P) : rappel pour dessiner la couette entre le corps et les bras ; o.arms: 'rest' | 'fists' | 'wave' | 'hold'
export function aliyah(C, o) {
  const T = T0(o), pose = o.pose || 'stand', sd = o.seed || 200, view = o.view || 'front';
  const P = pts => T(pts);
  const bd = o.bodyDraw ?? 1;
  const pjF = { col: K.yellow, p: 0.8, gap: 9, w: 11, ang: 0.4, seed: sd + 1, over: 3, draw: bd };
  const skinF = { col: K.skin, p: 0.88, gap: 6, w: 9, ang: 0.6, seed: sd + 2, over: 2, cross: true, crossP: 0.5 };
  const limb = (pts, w, f, s) => part(C, P(tube(curve(pts, 5), w)), f, lo(s, { draw: bd }), { kn: bd > 0 });
  const hand = (c, s, fist = false) => {
    part(C, P(handCircle(c[0], c[1], fist ? 13 : 11, s, 0, 18)), { ...skinF, draw: bd }, lo(s, { w: 5.5, draw: bd }), { kn: bd > 0 });
    if (fist) line(C.l, P([[c[0] - 8, c[1] + 2], [c[0] - 2, c[1] + 6], [c[0] + 4, c[1] + 5], [c[0] + 9, c[1] + 1]]), lo(s + 1, { w: 3.5, p: 0.7 }));
  };
  const starOn = c => star5(C, P([c])[0], 11 * (o.s || 1), sd + 9, (o.r || 0) * 0, K.white, K.ink);
  const legW = 24, armW = 20;
  let headC, headR = 0;
  if (pose === 'stand') {
    headC = [0, -262];
    const side = view === 'side', q = view === 'q';
    const wide = side ? 0.7 : q ? 0.9 : 1;
    const legs = side ? [[[6, -100], [8, -56], [4, -12]], [[-6, -100], [-8, -56], [-12, -12]]] : [[[-22 * wide, -100], [-24 * wide, -56], [-26 * wide, -12]], [[22 * wide, -100], [24 * wide, -56], [26 * wide, -12]]];
    legs.forEach((lg, i) => { limb(lg, legW, pjF, sd + 40 + i * 5); const f = lg[2]; part(C, P(ellipse(f[0] + (side ? 10 : 0), f[1] + 4, side ? 20 : 15, 10, 18)), pjF, lo(sd + 43 + i * 5)); });
    const torso = smooth([[-40 * wide, -210], [40 * wide, -210], [52 * wide, -190], [56 * wide, -100], [-56 * wide, -100], [-52 * wide, -190]], 3);
    const farArm = q ? [[-36 * wide, -195], [-58 * wide, -150], [-62 * wide, -112]] : null;
    if (farArm) { limb(farArm, armW, pjF, sd + 60); hand(farArm[2], sd + 62); }
    if (view === 'back') [[[-38, -195], [-58, -150], [-62, -112]], [[38, -195], [58, -150], [62, -112]]].forEach((a, i) => { limb(a, armW, pjF, sd + 64 + i * 3); hand(a[2], sd + 66 + i * 3); });
    part(C, P(torso), pjF, lo(sd + 70));
    if (view !== 'back') { line(C.l, P([[-16 * wide, -210], [0, -200], [16 * wide, -210]]), lo(sd + 71, { w: 5 })); starOn([view === 'front' ? 0 : 14, -165]); }
    if (view !== 'back') {
      const arms = side ? [[[6, -195], [20, -150], [30, -112]]] : q ? [[36 * wide, -195], [58 * wide, -150], [62 * wide, -112]].length ? [[[36 * wide, -195], [58 * wide, -150], [62 * wide, -112]]] : [] : [[[-38, -195], [-60, -150], [-64, -112]], [[38, -195], [60, -150], [64, -112]]];
      arms.forEach((a, i) => { limb(a, armW, pjF, sd + 100 + i * 4); hand(a[2], sd + 102 + i * 4); });
    }
  } else if (pose === 'lie') {
    // couchée sur le dos, tête à droite (dessin d'enfant : la figure debout basculée de 90°). Origine = centre de la tête.
    headC = [0, 0]; headR = Math.PI / 2;
    const torso = smooth([[-70, -58], [-70, 58], [-90, 66], [-250, 70], [-250, -70], [-90, -66]], 3);
    part(C, P(torso), pjF, lo(sd + 70, { draw: bd }), { kn: bd > 0 });
    line(C.l, P([[-74, -18], [-84, 0], [-74, 18]]), lo(sd + 71, { w: 5, draw: bd }));
    if (bd > 0.6) starOn([-118, 0]);
    if (o.duvet) o.duvet(P);
    const arms = o.arms === 'hold' ? [[[-92, -50], [-130, -78], [-150, -64]], [[-92, 50], [-130, 78], [-150, 64]]] : [[[-92, -50], [-150, -76], [-205, -74]], [[-92, 50], [-150, 76], [-205, 74]]];
    arms.forEach((a, i) => { limb(a, armW, pjF, sd + 100 + i * 4); hand(a[2], sd + 102 + i * 4); });
  } else if (pose === 'sit') {
    // assise dans le lit, de face ; origine = hanches sur le matelas
    headC = [o.headDx || 0, -236]; headR = o.headTilt || 0;
    const torso = smooth([[-44, -190], [44, -190], [56, -170], [62, -60], [-62, -60], [-56, -170]], 3);
    part(C, P(torso), pjF, lo(sd + 70));
    line(C.l, P([[-16, -190], [0, -180], [16, -190]]), lo(sd + 71, { w: 5 }));
    starOn([0, -145]);
    if (o.duvet) o.duvet(P);
    let arms, fists = false;
    if (o.arms === 'fists') { arms = [[[-42, -176], [-74, -140], [-56, -196]], [[42, -176], [74, -140], [56, -196]]]; fists = true; }
    else if (o.arms === 'wave') { arms = [[[-42, -176], [-68, -120], [-66, -70]], [[42, -176], [84, -176], [98, -236]]]; }
    else if (o.arms === 'open') { arms = [[[-42, -176], [-84, -130], [-104, -84]], [[42, -176], [84, -130], [104, -84]]]; }
    else arms = [[[-42, -176], [-68, -120], [-66, -70]], [[42, -176], [68, -120], [66, -70]]];
    arms.forEach((a, i) => { limb(a, armW, pjF, sd + 100 + i * 4); hand(a[2], sd + 102 + i * 4, fists); });
  }
  const hc = P([headC])[0];
  head(C, { x: hc[0], y: hc[1], s: o.s || 1, r: (o.r || 0) + headR * (o.flip ? -1 : 1), flip: o.flip, view: o.headView || view, expr: o.expr, look: o.look, seed: sd + 300, draw: o.headDraw ?? 1 });
}

// ———————————————— Papa : silhouette dans la porte ————————————————
// origine = entre les pieds ; ~700 de haut ; d = progression du dessin
export function papa(C, o) {
  const T = T0(o), sd = o.seed || 900, d = o.draw ?? 1, P = pts => T(pts);
  const shirtF = { col: K.wood, p: 0.9, gap: 8, w: 10, ang: 1.4, seed: sd + 1, over: 3, cross: true, crossP: 0.5 };
  const pantF = { col: K.grey, p: 0.9, gap: 8, w: 10, ang: 1.5, seed: sd + 2, over: 3 };
  const skinF = { col: K.skin, p: 0.9, gap: 7, w: 10, ang: 0.5, seed: sd + 3, over: 2, cross: true, crossP: 0.5 };
  const hairF = { col: K.hair, p: 0.95, gap: 6, w: 9, ang: 1.1, seed: sd + 4, over: 2 };
  const dL = pr(d, 0, 0.5), dB = pr(d, 0.3, 0.8), dH = pr(d, 0.5, 1);
  const limb = (pts, w, f, s, dd) => part(C, P(tube(curve(pts, 5), w)), { ...f, draw: dd }, lo(s, { draw: dd }), { kn: false });
  // jambes + chaussures
  [[[-34, -300], [-36, -160], [-38, -14]], [[34, -300], [36, -160], [38, -14]]].forEach((lg, i) => { limb(lg, 46, pantF, sd + 10 + i * 4, dL); part(C, P(ellipse(lg[2][0], lg[2][1] + 4, 30, 12, 18)), { ...hairF, draw: dL }, lo(sd + 12 + i * 4, { draw: dL }), { kn: false }); });
  // torse chemise de travail
  const torso = smooth([[-70, -560], [70, -560], [92, -530], [84, -300], [-84, -300], [-92, -530]], 3);
  part(C, P(torso), { ...shirtF, draw: dB }, lo(sd + 20, { draw: dB }), { kn: false });
  // col, boutons
  line(C.l, P([[-26, -560], [0, -538], [26, -560]]), lo(sd + 21, { w: 5, draw: dB }));
  [-500, -450, -400].forEach((y, i) => dab(C.l, ...P([[0, y]])[0], 4 * (o.s || 1), { col: K.ink, p: 0.8, seed: sd + 22 + i, gap: 2.5, w: 3 }));
  // bras : manches retroussées (chemise jusqu'au coude, puis peau), main sur le chant de la porte
  const armL = [[-80, -540], [-120, -460], [-130, -400]], armR = [[80, -540], [120, -470], [126, -410]];
  [armL, armR].forEach((a, i) => {
    limb([a[0], a[1]], 38, shirtF, sd + 30 + i * 6, dB);
    limb([a[1], a[2]], 32, skinF, sd + 32 + i * 6, dB);
    part(C, P(handCircle(a[2][0], a[2][1] + 10, 18, sd + 34 + i, 0, 18)), { ...skinF, draw: dB }, lo(sd + 35 + i * 6, { w: 5.5, draw: dB }), { kn: false });
  });
  // tête : visage, barbe courte, cheveux courts
  const hc = [0, -640];
  part(C, P(ellipse(hc[0], hc[1], 66, 72, 40)), { ...skinF, draw: dH }, lo(sd + 40, { draw: dH }), { kn: false });
  const beard = smooth([[-62, -630], [-52, -590], [-20, -572], [20, -572], [52, -590], [62, -630], [50, -612], [20, -600], [-20, -600], [-50, -612]], 3);
  part(C, P(beard), { ...hairF, draw: dH }, null, { occ: true, kn: false });
  line(C.l, P(beard.slice(0, Math.floor(beard.length * 0.6))), lo(sd + 41, { w: 5, draw: dH, p: 0.8 }));
  const hair = smooth([[-70, -660], [-64, -700], [-30, -716], [30, -716], [64, -700], [70, -660], [50, -672], [0, -680], [-50, -672]], 3);
  part(C, P(hair), { ...hairF, draw: dH }, null, { kn: false });
  line(C.l, P(hair.slice(0, Math.floor(hair.length * 0.62))), lo(sd + 42, { w: 5, draw: dH }));
  // yeux doux et fatigués : paupières à demi closes, petit cerne
  [[-24, -646], [24, -646]].forEach(([x, y], i) => {
    const sc = ellipse(x, y, 11, 8, 16);
    part(C, P(sc), { col: K.white, p: 1, gap: 3, w: 5, over: 0.5, seed: sd + 50 + i, draw: dH }, lo(sd + 51 + i, { w: 3.5, draw: dH }), { occ: true, kn: false });
    part(C, P(ellipse(x, y + 1, 5.5, 6, 12)), { col: K.hair, p: 1, gap: 3, w: 4, over: 0.4, seed: sd + 54 + i, draw: dH }, null, { occ: false, kn: false });
    part(C, P([[x - 13, y - 11], [x + 13, y - 11], [x + 13, y - 3], [x - 13, y - 3]]), { ...skinF, seed: sd + 56 + i, draw: dH }, null, { occ: true, kn: false });
    line(C.l, P([[x - 12, y - 3], [x + 12, y - 3]]), lo(sd + 58 + i, { w: 4, draw: dH }));
    line(C.l, P([[x - 9, y + 12], [x + 9, y + 13]]), lo(sd + 60 + i, { w: 3, p: 0.5, draw: dH }));
  });
  line(C.l, P([[-12, -596], [0, -588], [12, -596]]), lo(sd + 64, { w: 4, draw: dH, col: K.pink, p: 0.9 }));   // un sourire dans la barbe
}
