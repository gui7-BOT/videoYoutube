// Planche-modèle d'Aliyah (et Papa) : rendue avec le vrai moteur, ?test=model
import { PAL, setClock, shape, ink, ellipse, rrect, rect, text, star, sparkle, paperFinish, plane, spline } from './engine/toon.js';
import { COL, drawAliyah, drawPapa, drawHandA, sky } from './film.js';

export function drawSheet(ctx, t) {
  setClock(0.25);
  const W = 1920, H = 1080;
  ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
  text(ctx, 'Planche-modèle', 60, 86, { font: '700 60px Oleo', fill: COL.tomato, plate: COL.bow, off: [4, 3] });
  text(ctx, 'ALIYAH, 4 ANS  ·  PAPA  ·  « NOTRE PÈRE DANS MA CHAMBRE »', 520, 78, { font: '600 22px Jost', fill: COL.inkSoft, track: 5 });
  ink(ctx, [[60, 108], [1860, 108]], 3, { breaks: 0.2, seed: 2 });
  // turnaround
  plane(ctx, rrect(40, 124, 900, 470, 20), COL.wallNight, { off: [0, 0], grain: 0.2 });
  text(ctx, 'TURNAROUND  ·  2,5 TÊTES', 70, 160, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  [['front', 'FACE'], ['q', 'TROIS QUARTS'], ['side', 'PROFIL'], ['back', 'DOS']].forEach(([v, lab], i) => {
    const x = 160 + i * 220, y = 548;
    ink(ctx, [[x - 90, y + 4], [x + 90, y + 4]], 2.5, { seed: 5 + i, breaks: 0.3 });
    const arms = { F: { t: [92, 10], kind: 'open', a: -1.0 }, B: { t: [-92, 10], kind: 'open', a: -2.1 } };
    drawAliyah(ctx, { x, y, s: 0.74, view: v, eyes: 'open', mouth: 'small', arms, look: [0, 0] });
    text(ctx, lab, x, y + 36, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  });
  // expressions (têtes dans des cercles)
  plane(ctx, rrect(960, 124, 920, 300, 20), COL.quilt, { off: [0, 0], grain: 0.2 });
  text(ctx, 'EXPRESSIONS', 990, 160, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  const EX = [[{ eyes: 'open', wide: true, look: [-2, -9], mouth: 'small' }, 'AU PLAFOND'], [{ eyes: 'squeeze', tension: 2, mouth: 'puff' }, 'TRÈS FORT'], [{ eyes: 'open', wide: true, mouth: 'o', look: [0, -4] }, 'CRIER ?'], [{ eyes: 'open', mouth: 'smile', faceDx: -14, look: [-9, 1] }, 'VERS LA PORTE']];
  EX.forEach(([f, lab], i) => {
    const cx = 1070 + i * 220, cy = 272;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 82, 0, Math.PI * 2); ctx.fillStyle = COL.paper; ctx.fill(); ctx.clip();
    drawAliyah(ctx, { x: cx, y: cy + 230, s: 0.95, view: 'front', ...f }, { torso: false, arms: false, head: true });
    ctx.restore();
    ink(ctx, ellipse(cx, cy, 82, 82, 48), 3.5, { closed: true, seed: 20 + i, breaks: 0.1 });
    text(ctx, lab, cx, cy + 118, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  });
  // poses clés
  plane(ctx, rrect(960, 444, 920, 380, 20), COL.wallNight, { off: [0, 0], grain: 0.2 });
  text(ctx, 'POSES', 990, 480, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  // 1 couchée (tête tournée sur l'oreiller, couette jusqu'au cou)
  const px = 1140, py = 690;
  shape(ctx, rrect(px - 60, py - 60, 170, 70, 26), { fill: COL.pillow, line: 3.5, seed: 30, grain: 0.2 });
  drawAliyah(ctx, { x: px - 110, y: py + 20, s: 0.7, ang: 1.35, headTilt: -0.55, eyes: 'open', wide: true, look: [-2, -9], mouth: 'small' }, { torso: true, arms: false, head: false });
  shape(ctx, [...spline([[px - 240, py + 20], [px - 150, py + 14], [px - 60, py - 20], [px + 10, py - 36], [px + 60, py - 20], [px + 90, py + 30]], false, 6), [px + 92, py + 100], [px - 240, py + 100]], { fill: COL.quilt, line: 3.5, seed: 31, grain: 0.3 });
  drawAliyah(ctx, { x: px - 110, y: py + 20, s: 0.7, ang: 1.35, headTilt: -0.55, eyes: 'open', wide: true, look: [-2, -9], mouth: 'small' }, { torso: false, arms: false, head: true });
  text(ctx, 'COUCHÉE', px - 60, py + 130, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  // 2 assise, mains en porte-voix
  drawAliyah(ctx, { x: 1430, y: 760, s: 0.72, view: 'front', eyes: 'open', wide: true, mouth: 'o', look: [0, -4], arms: { F: { t: [84, -206], kind: 'flat', a: -1.75 }, B: { t: [-84, -206], kind: 'flat', a: -1.4 } } });
  text(ctx, 'PORTE-VOIX', 1430, 800, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  // 3 assise, le doigt vers la fenêtre
  drawAliyah(ctx, { x: 1700, y: 760, s: 0.72, view: 'front', eyes: 'open', wide: true, mouth: 'small', faceDx: -14, headTilt: -0.14, look: [-8, -7], arms: { F: { t: [58, -16], kind: 'open', a: -1.2 }, B: { t: [-34, -270], kind: 'point', a: -2.2 } } });
  text(ctx, 'DEHORS ?', 1700, 800, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  // Papa + silhouette
  plane(ctx, rrect(40, 614, 520, 430, 20), COL.wallDay, { off: [0, 0], grain: 0.2 });
  text(ctx, 'PAPA', 70, 650, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  ink(ctx, [[80, 1000], [300, 1000]], 2.5, { seed: 40, breaks: 0.3 });
  drawPapa(ctx, 0, {}, { x: 180, y: 998, s: 0.62, sil: false, k: 1 });
  plane(ctx, rect(360, 680, 150, 320), COL.gold, { grain: 0.15 });
  ink(ctx, rect(360, 680, 150, 320), 3.5, { closed: true, seed: 41, breaks: 0.2 });
  drawPapa(ctx, 0, {}, { x: 435, y: 998, s: 0.58, sil: true, k: 1 });
  text(ctx, 'DEBOUT', 180, 1026, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  text(ctx, 'DANS LA PORTE', 435, 1026, { font: '500 19px Jost', fill: COL.ink, align: 'center', track: 3 });
  // mains
  plane(ctx, rrect(580, 614, 360, 200, 20), COL.pillow, { off: [0, 0], grain: 0.2 });
  text(ctx, 'MAINS', 610, 650, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  [['open', 'OUVERTE'], ['flat', 'PLATE'], ['point', 'INDEX'], ['grip', 'POING']].forEach(([k, lab], i) => { drawHandA(ctx, 630 + i * 82, 730, -1.3, k, 1, 1.1, COL.skin); text(ctx, lab, 640 + i * 82, 790, { font: '500 15px Jost', fill: COL.ink, align: 'center', track: 2 }); });
  // palette
  plane(ctx, rrect(580, 834, 360, 210, 20), COL.pillow, { off: [0, 0], grain: 0.2 });
  text(ctx, 'PALETTE', 610, 870, { font: '600 22px Jost', fill: COL.ink, track: 5 });
  const sw = [[COL.pyj, 'pyjama'], [COL.bow, 'nœuds'], [COL.skin, 'peau'], [COL.wallDay, 'mur'], [COL.wallNight, 'nuit'], [COL.quilt, 'couette'], [COL.sky, 'ciel'], [COL.moon, 'lune'], [COL.gold, 'lumière'], [COL.rabbit, 'lapin'], [COL.door, 'bois'], [COL.ink, 'encre']];
  sw.forEach(([c, lab], i) => { const x = 612 + (i % 6) * 54, y = 892 + Math.floor(i / 6) * 70; shape(ctx, rrect(x, y, 42, 42, 8), { fill: c, line: 2.6, seed: 50 + i, grain: 0.2 }); text(ctx, lab, x + 21, y + 60, { font: '400 13px Jost', fill: COL.ink, align: 'center' }); });
  // un petit ciel de fenêtre
  ctx.save(); ctx.beginPath(); ctx.arc(1800, 960, 60, 0, Math.PI * 2); ctx.clip(); ctx.translate(1800, 960); sky(ctx, 0, 0.3, { spin: 0.3 }); ctx.restore();
  ink(ctx, ellipse(1800, 960, 60, 60, 40), 3.5, { closed: true, seed: 70, breaks: 0.1 });
  text(ctx, 'FENÊTRE RONDE', 1800, 1040, { font: '500 15px Jost', fill: COL.ink, align: 'center', track: 2 });
  paperFinish(ctx, W, H, 1);
}
