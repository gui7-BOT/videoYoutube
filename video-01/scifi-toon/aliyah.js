// aliyah.js — personnages du film : Aliyah (4 ans), Papa, le lapin en peluche.
// Coordonnées locales : origine à la hanche (assise) ; y vers le bas. Tout passe par toon.js (boil, trait constant, aplats).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, tx, zoom } from './toon.js';

export const C = {
  white: '#ffffff',
  skin: '#5a3626', skinS: '#3f2419', hair: '#3b2520', hairS: '#2a1915',
  pj: '#f7e9a6', pjS: '#dfc766', yel: '#f4d35e', yelS: '#d4ae2e',
  iris: '#7a4a2a', cheek: 'rgba(235,120,150,.45)', mouthIn: '#4a1a2a', tongue: '#e8637a',
  // Papa
  pSkin: '#5a3626', pShirt: '#8a5a3a', pShirtS: '#6d4229', pPants: '#6f7076', pPantsS: '#55565c', pBeard: '#2a1915', sil: '#2a1a2e',
  // lapin
  bun: '#f6f1ea', bunS: '#d9d0cf', bunEar: '#e8b4c2',
};

// —— pièces de visage ——
// Œil : grand blanc, iris marron, petite pupille. lid = part couverte par la paupière ; squeeze = serré très fort ; closed = fermé doux
export function eye(cx, cy, rx, ry, { look = [0, 0], lid = 0, squeeze = false, closed = false, skin = C.skin, iris = 10, pupil = 4.5, lw = 6, jitter = 0 } = {}) {
  if (squeeze) {   // deux arcs épais qui plongent vers le bas + deux petits plis
    stroke(arc(cx, cy - ry * .25, rx * .85, ry * .5, Math.PI * .12, Math.PI * .88, 14), lw * 1.15);
    stroke([[cx - rx * 1.05, cy + ry * .1], [cx - rx * 1.3, cy + ry * .45]], lw * .6);
    stroke([[cx + rx * 1.05, cy + ry * .1], [cx + rx * 1.3, cy + ry * .45]], lw * .6);
    return;
  }
  if (closed) { stroke(arc(cx, cy + ry * .1, rx * .8, ry * .45, Math.PI * 1.1, Math.PI * 1.9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: C.white, lw, shade: () => {
      const px = cx + look[0] * rx * .5 + jitter, py = cy + look[1] * ry * .45;
      fillOnly(ell(px, py, iris, iris * 1.05, 20), C.iris, { boil: .3 });
      dot(px, py, pupil);
      dot(px - iris * .35, py - iris * .4, pupil * .55, '#fff');
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .06]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .06], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
// Bouche paramétrique : o ouverture 0..1, w largeur, sm coins (+ sourire, − moue), skew de travers
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: C.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .3 + 6), C.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .1, cy + h * .95, hw * .55, h * .42, 20), C.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 18, col = C.skin, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.3, -r * .7], [r * 1.45, -r * .05], [r * 1.3, r * .65], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  if (fist) { stroke([[r * .1, -r * .5], [r * .8, -r * .55]], lw * .55); stroke([[r * .2, 0], [r * .95, -.05 * r]], lw * .55); }
  else stroke([[r * .2, -r * .15], [r * .75, -r * .45]], lw * .55);
  pop();
}
export function star5(cx, cy, r, col = C.white, lw = 4) {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * .45 : r; p.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); }
  shape(p, { fill: col, lw });
}
// révélation par parties (intro) : r = {u, fill, on} ; trait partiel, puis trait seul, puis aplat
export function rshape(r, pts, o = {}) {
  if (!r.on) return false;
  if (r.u < 1) { const n = Math.max(2, Math.ceil(pts.length * r.u)); stroke(pts.slice(0, n), o.lw ?? 7); return false; }
  if (!r.fill) { shape(pts, { ...o, fill: null, shade: null }); return false; }
  shape(pts, o); return true;
}
const FULL = { u: 1, fill: true, on: true };
const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— la tête d'Aliyah (origine au centre de la tête, rayon 100) ——
// view : 0 face, 1 trois quarts (vers la droite), 2 profil, 3 dos
export function headAliyah(P = {}) {
  const view = P.view ?? 0, lw = 7;
  const R = P.rv || {}, st = k => R[k] || FULL;
  const sx = view === 1 ? 22 : 0;                    // décalage des traits en trois quarts
  const puff = (px, py, r, seed) => {               // couette afro : masse ronde à bosses, contour extérieur seul
    const pts = []; const n = 11;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, b = 1 + .22 * (i % 2) + .05 * hash(seed + i); pts.push([px + Math.cos(a) * r * b, py + Math.sin(a) * r * b]); }
    rshape(st('puffs'), spline(pts), { fill: C.hair, lw, shade: () => fillOnly(ell(px + r * .35, py + r * .3, r * .55, r * .6, 16), C.hairS, { boil: .3 }) });
  };
  const bow = (bx, by, k = 1) => {                  // nœud jaune : deux boucles + un nœud
    if (!st('bows').on) return;
    push(); translate(bx, by); scale(k);
    shape(ell(-16, -2, 17, 10, 16, .3), { fill: C.yel, lw: 5, shade: () => fillOnly(ell(-18, 3, 10, 4, 10), C.yelS, { boil: .3 }) });
    shape(ell(16, -2, 17, 10, 16, -.3), { fill: C.yel, lw: 5, shade: () => fillOnly(ell(18, 3, 10, 4, 10), C.yelS, { boil: .3 }) });
    shape(ell(0, 0, 8, 7, 12), { fill: C.yel, lw: 5 });
    pop();
  };
  const sq = P.cheeks || 0;                          // joues gonflées
  // oreilles (derrière)
  if (!st('head').on) return;
  if (view !== 3 && st('head').fill) {
    if (view !== 2) shape(ell(-104 + sx * .5, 12, 14, 20, 14), { fill: C.skin, lw: 6, shade: () => fillOnly(ell(-102 + sx * .5, 14, 6, 11, 10), C.skinS, { boil: .3 }) });
    if (view !== 1) shape(ell(104, 12, 14, 20, 14), { fill: C.skin, lw: 6, shade: () => fillOnly(ell(102, 14, 6, 11, 10), C.skinS, { boil: .3 }) });
  }
  // couettes du fond (dos : les deux ; profil : celle de derrière)
  if (view === 3) { puff(-84, -96, 42, 1); puff(84, -96, 42, 2); }
  if (view === 2) puff(-66, -100, 40, 1);
  if (view < 2) { puff(-84 + sx * .6, -96, 42, 1); puff(84 + sx * .2, -96, 42, 2); }
  // tête
  const HD = ell(0, 0, 100 + sq * 10, 100, 48);
  const headOk = rshape(st('head'), HD, {
    fill: C.skin, lw, shade: () => {
      fillOnly(spline([[-40, 60], [30, 72], [110, 40], [120, 130], [-60, 130]]), C.skinS, { boil: .4 });   // ombre dure sous le menton
      if (sq > 0) { fillOnly(ell(-80, 40, 22 * sq, 16 * sq, 12), C.skinS, { boil: .3 }); fillOnly(ell(80, 40, 22 * sq, 16 * sq, 12), C.skinS, { boil: .3 }); }
    }
  });
  if (!headOk) return;
  // calotte de cheveux (bord bouclé)
  const hairline = view === 3 ? [[-104, 20], [-104, 60], [-70, 80], [0, 90], [70, 80], [104, 60], [104, 20]]
    : [[-104, -30], [-80, -66], [-50, -76], [-18, -88], [14, -80], [46, -90], [76, -70], [104, -30]];
  const cap = [...hairline, ...arc(0, 0, 105, 105, Math.atan2(hairline[hairline.length - 1][1], hairline[hairline.length - 1][0]), Math.atan2(hairline[0][1], hairline[0][0]) - TAU + (view === 3 ? TAU : 0), 22).slice(1, -1)];
  shape(view === 3 ? spline(hairline.concat(arc(0, 0, 105, 105, .2, Math.PI - .2, 20).reverse().slice(1, -1))) : spline(cap), { fill: C.hair, lw, shade: () => fillOnly(ell(60, -60, 40, 30, 16), C.hairS, { boil: .3 }) });
  if (view === 3) {   // dos : cheveux pleins, deux nœuds vus de derrière
    bow(-62, -62, 1.3); bow(62, -62, 1.3);
  } else if (view === 2) {
    puff(58, -100, 42, 2); bow(44, -62, 1.4);
    // profil : un œil, le nez qui pointe, la bouche au bord
    const look = P.look || [0, 0];
    eye(46, 6, 24, 36, { look: [clamp(look[0] * .5 + .3, -1, 1), look[1]], lid: P.blink ? 1 : (P.lid || 0), squeeze: !!P.squeeze, closed: !!P.closed, iris: 8 });
    stroke([[26, -42], [66, -48]], 7);                                                        // sourcil
    stroke(spline([[90, 30], [108, 44], [92, 56]], false), 6);                                 // nez
    const m = P.mouth || {};
    mouth(78, 70, 30, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? .2, lw: 6 });
    fillOnly(ell(58, 44, 14, 9, 12), C.cheek, { boil: .3 });
  } else {
    // nœuds jaunes à la base des couettes (devant la calotte)
    bow(-60 + sx * .7, -66, 1.45); bow(60 + sx * .3, -66, 1.45);
    // yeux : grands, qui se touchent presque
    const look = P.look || [0, 0], lid = P.blink ? 1 : clamp(P.lid || 0, 0, 1);
    const jit = P.eyeJit ? (hash(Math.floor((P.t || 0) * 12) * 2.9) - .5) * 2 * P.eyeJit : 0;
    const sqz = P.squeeze || 0;
    const rxL = view === 1 ? 28 : 34, rxR = view === 1 ? 36 : 34;
    if (st('eyes').on) {
      eye(-37 + sx, 8, rxL, 38, { look, lid, squeeze: sqz > 0 && !(P.peek), closed: !!P.closed, jitter: jit, iris: 10 });
      eye(38 + sx, 8, rxR, 38, { look, lid, squeeze: sqz > 0, closed: !!P.closed, jitter: jit, iris: 10 });
    }
    if (!st('brows').on) return;
    // sourcils : brow = hauteur (−1..1), worry = accent (intérieur relevé), angry = extérieur relevé
    const br = P.brow || 0, wo = P.worry || 0, by = -36 - br * 12;
    stroke([[-70 + sx, by + 4 + wo * 10], [-36 + sx, by - 4 - wo * 8], [-12 + sx, by + 2 - wo * 14]], 9);
    stroke([[12 + sx, by + 2 - wo * 14], [38 + sx, by - 4 - wo * 8], [70 + sx, by + 4 + wo * 10]], 9);
    // nez
    stroke(spline([[-8 + sx, 36], [2 + sx, 46], [12 + sx, 38]], false), 6);
    // joues
    fillOnly(ell(-72 + sx, 44, 16, 10, 12), C.cheek, { boil: .3 }); fillOnly(ell(72 + sx, 44, 16, 10, 12), C.cheek, { boil: .3 });
    // bouche
    const m = P.mouth || {};
    mouth(sx + (m.skew || 0) * 6, 70 + ((m.big || 1) - 1) * 10, 52 * (m.big || 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? .25, skew: m.skew || 0, lw: 6 });
  }
  if (P.sweat != null) sweat(118, -40 + (P.sweat % 1) * 26, 1.1);
}

// —— Aliyah entière ——
// P : x,y (hanche, monde), s, up (0 couchée → 1 assise), lean, look, lid, blink, squeeze, peek, brow, worry, mouth, cheeks, jitter, sweat, sq,
//     armL/armR : {h:[dx,dy] relatif à l'épaule, bend, fist} ; hold 'bunny' ; part 'body' | 'front' | 'all'
export function aliyah(P, part = 'all') {
  const s = P.s ?? .7, up = clamp(P.up ?? 1), f = P.face ?? 1;
  const ang = lerp(Math.PI / 2 + .12, 0, up);           // torse : couché vers la droite → debout
  const jx = P.jitter ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 2 * P.jitter : 0;
  const jy = P.jitter ? (hash(Math.floor((P.t || 0) * 12) * 5.1 + 9) - .5) * 2 * P.jitter : 0;
  push(); translate(P.x + jx, P.y + jy); scale(s * f, s * (P.sq ?? 1)); rotate((P.lean || 0) + ang);
  const shL = [-64, -166], shR = [64, -166];
  const torso = spline([[-74, -192], [0, -200], [74, -192], [90, -100], [84, 0], [0, 10], [-84, 0], [-90, -100]]);
  const R = P.rv || {}, st = k => R[k] || FULL;
  if (part !== 'front' && st('pj').on) {
    const ok = rshape(st('pj'), torso, {
      fill: C.pj, lw: 7, shade: () => {
        fillOnly(spline([[20, -210], [100, -200], [110, 10], [40, 10], [60, -100]]), C.pjS, { boil: .4 });
        fillOnly(ell(0, -176, 48, 26, 20), C.skin, { boil: .4 });        // le cou, dans l'encolure
      }
    });
    if (ok) stroke(spline([[-46, -196], [-30, -168], [0, -160], [30, -168], [46, -196]], false), 6);   // encolure
    if (st('star').on) star5(0, -112, 24, C.white, 4);
  }
  if (part !== 'body') {
    // bras (noodles) : la main au bout, poing ou ouverte
    const arm = (sh, a, side) => {
      if (!a) return;
      const hp = [sh[0] + a.h[0], sh[1] + a.h[1]];
      shape(noodle(sh, hp, a.bend ?? 0, 44, 36), { fill: C.pj, lw: 7, shade: () => fillOnly(noodle([sh[0] + side * 10, sh[1] + 10], [hp[0] + side * 8, hp[1] + 4], (a.bend ?? 0) * .6, 18, 14), C.pjS, { boil: .3 }) });
      const an = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
      shape(ell(hp[0] - Math.cos(an) * 6, hp[1] - Math.sin(an) * 6, 22, 22, 18), { fill: C.pjS, lw: 6 });   // poignet
      hand(hp[0] + Math.cos(an) * 8, hp[1] + Math.sin(an) * 8, an + (a.rot || 0), 18, C.skin, { fist: !!a.fist });
    };
    if (st('pj').fill && (up > .5 || !P.hideBack)) arm(shL, P.armL, -1);
    if (P.hold === 'bunny') { push(); translate(0, -60); rotate(-ang); bunny(0, 0, .95, P.bunnyP || {}); pop(); }
    if (st('pj').fill && up > .5) arm(shR, P.armR, 1);
    else if (st('pj').fill && P.armR && P.armR.lyShow) arm(shR, P.armR, 1);
    // tête
    push(); translate(0, -268); rotate(-ang + (P.headRot || 0)); scale(1, 1 + (P.headSq || 0));
    headAliyah(P);
    pop();
  }
  pop();
}

// —— le lapin en peluche (origine : bas du corps) ——
export function bunny(x, y, s = 1, { look = [0, 0], tilt = 0, big = false } = {}) {
  push(); translate(x, y); scale(s); rotate(tilt);
  for (const sx of [-1, 1]) shape(spline([[sx * 22, -70], [sx * 36, -120], [sx * 28, -150], [sx * 12, -130], [sx * 10, -80]]), { fill: C.bun, lw: 6, shade: () => fillOnly(spline([[sx * 22, -84], [sx * 30, -118], [sx * 24, -138], [sx * 16, -122], [sx * 16, -90]]), C.bunEar, { boil: .3 }) });
  shape(ell(0, -30, 40, 34, 24), { fill: C.bun, lw: 6, shade: () => fillOnly(ell(14, -22, 24, 26, 16), C.bunS, { boil: .3 }) });
  shape(ell(0, -80, 36, 34, 26), { fill: C.bun, lw: 6, shade: () => fillOnly(ell(16, -70, 18, 24, 14), C.bunS, { boil: .3 }) });
  for (const sx of [-1, 1]) shape(ell(sx * 26, -10, 14, 10, 12), { fill: C.bun, lw: 5 });
  dot(-13 + look[0] * 3, -86 + look[1] * 3, 4.5); dot(13 + look[0] * 3, -86 + look[1] * 3, 4.5);   // yeux boutons
  shape(ell(0, -74, 6, 4, 10), { fill: '#c8604a', lw: 3 });                                        // nez
  stroke([[0, -70], [0, -64]], 3); stroke(arc(-5, -62, 5, 4, 0, Math.PI, 6), 3); stroke(arc(5, -62, 5, 4, 0, Math.PI, 6), 3);
  pop();
}

// —— Papa (origine : pieds). sil = 1 silhouette à contre-jour (trait + aplat sombre, sans visage) ; door = ouverture de la porte 0..1
export function papa(P = {}) {
  const sil = P.sil ?? 1, s = P.s ?? 1;
  push(); translate(P.x, P.y); scale(s * (P.face ?? 1), s);
  const col = c => sil ? C.sil : c;
  const sh = c => sil ? C.sil : c;
  // jambes
  for (const sx of [-1, 1]) shape(noodle([sx * 34, -300], [sx * 40, -20], sx * 4, 62, 54), { fill: col(C.pPants), lw: 7, shade: () => fillOnly(rect(sx * 10, -300, 40, 300), sh(C.pPantsS), { boil: .3 }) });
  for (const sx of [-1, 1]) shape(spline([[sx * 40 - 36, 0], [sx * 40 - 32, -22], [sx * 40 + 10, -26], [sx * 40 + 44, -10], [sx * 40 + 40, 2]]), { fill: col('#3a2a24'), lw: 6 });
  // torse : chemise de travail, manches retroussées
  const body = spline([[-96, -520], [0, -540], [96, -520], [110, -400], [100, -290], [0, -282], [-100, -290], [-110, -400]]);
  const lift = P.wave || 0;   // bras droit qui se lève pour saluer (0..1)
  const armL = { sh: [-100, -500], hp: [-128 + (P.doorHand ? 10 : 0), -330], bend: -14 };
  const armR = { sh: [100, -500], hp: [lerp(128, 150, lift), lerp(-330, -600, lift)], bend: lerp(14, -30, lift) };
  const arm = a => {
    shape(noodle(a.sh, a.hp, a.bend, 50, 40), { fill: col(C.pShirt), lw: 7 });
    const an = Math.atan2(a.hp[1] - a.sh[1], a.hp[0] - a.sh[0]);
    shape(noodle([lerp(a.sh[0], a.hp[0], .5), lerp(a.sh[1], a.hp[1], .5)], a.hp, a.bend * .5, 48, 42), { fill: col(C.pSkin), lw: 7 });   // avant-bras nu (manche retroussée)
    shape(ell(lerp(a.sh[0], a.hp[0], .5), lerp(a.sh[1], a.hp[1], .5), 28, 22, 16, an), { fill: col(C.pShirtS), lw: 6 });          // revers de la manche
    hand(a.hp[0] + Math.cos(an) * 10, a.hp[1] + Math.sin(an) * 10, an, 22, col(C.pSkin), { fist: false });
  };
  arm(armL);
  shape(body, { fill: col(C.pShirt), lw: 7, shade: () => { fillOnly(spline([[30, -550], [120, -540], [130, -280], [50, -280], [70, -420]]), sh(C.pShirtS), { boil: .4 }); fillOnly([[-26, -545], [26, -545], [0, -470]], sh(C.pSkin), { boil: .3 }); } });
  stroke([[0, -470], [0, -300]], 5); for (let k = 0; k < 4; k++) dot(0, -450 + k * 40, 4, sil ? INK : C.pShirtS);   // boutons
  stroke([[-28, -548], [0, -470], [28, -548]], 6);                                                                // col
  // cou + tête
  shape(noodle([0, -540], [0, -580], 0, 44, 44), { fill: col(C.pSkin), lw: 6 });
  const HD = spline([[-70, -700], [0, -716], [70, -700], [88, -640], [78, -580], [40, -548], [-40, -548], [-78, -580], [-88, -640]]);
  shape(HD, { fill: col(C.pSkin), lw: 7, shade: () => { fillOnly(spline([[-84, -610], [-40, -560], [40, -556], [86, -610], [90, -540], [-90, -540]]), sh(C.pBeard), { boil: .4 }); fillOnly(ell(0, -720, 70, 26, 20), sh(C.hair), { boil: .3 }); } });
  if (!sil) {
    // barbe courte : bosses le long de la mâchoire
    stroke(spline([[-80, -612], [-60, -566], [-20, -552], [20, -552], [60, -566], [80, -612]], false), 5);
    for (const sx of [-1, 1]) shape(ell(sx * 90, -640, 12, 16, 12), { fill: C.pSkin, lw: 6 });
    // regard doux et fatigué : paupières lourdes, petites poches
    for (const ex of [-30, 30]) { eye(ex, -650, 22, 20, { look: P.look || [0, .2], lid: .45, iris: 7, pupil: 4 }); stroke(arc(ex, -628, 16, 6, Math.PI * .15, Math.PI * .85, 8), 4); }
    stroke([[-50, -682], [-14, -686]], 6); stroke([[14, -686], [50, -682]], 6);
    stroke(spline([[-6, -640], [4, -620], [-8, -612]], false), 5);
    mouth(0, -590, 36, { o: 0, sm: .4, lw: 5 });
  }
  arm(armR);
  pop();
}
