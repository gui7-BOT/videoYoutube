// Planche-modèle d'Aliyah : ?test=model  (turnaround, expressions, poses clés, palette)
import { layer, clear, line, fill, text, CAM } from './crayon.js';
import { group, clearGroup, part } from './rig.js';
import { aliyah, head, papa, star5 } from './aliyah.js';
import { PAL } from './pal.js';
const C = group(), BG = layer(), TX = layer();
const K = PAL.crayon;
const label = (s, x, y, size = 28, o = {}) => text(TX, s, x, y, { size, col: K.ink, p: 0.9, ...o });
const rule = (x0, y0, x1, y1, seed) => line(BG, [[x0, y0], [x1, y1]], { w: 3, col: K.night, p: 0.5, seed, wob: 1.5 });

export function sheet(comp, t) {
  clearGroup(C); [BG, TX].forEach(clear);
  CAM.x = 960; CAM.y = 540; CAM.s = 1;
  label('ALIYAH  —  planche modèle', 40, 60, 48, { align: 'left', font: 'Gaegu', weight: 700 });
  label('4 ans · environ 2,6 têtes · pyjama jaune pâle, étoile blanche · deux couettes afro, nœuds jaunes', 640, 58, 25, { align: 'left', p: 0.6 });
  // turnaround
  [['front', 'FACE'], ['q', '3/4'], ['side', 'PROFIL'], ['back', 'DOS']].forEach(([vw, lab], i) => {
    const x = 150 + i * 225;
    aliyah(C, { x, y: 520, s: 1.12, view: vw, expr: 'wide', seed: 1000 + i * 37 });
    label(lab, x, 562, 28);
  });
  rule(40, 590, 960, 590, 3); rule(980, 90, 980, 1060, 4);
  // expressions
  [['wide', 'yeux grands ouverts'], ['o', '« crier ? »'], ['shut', 'yeux serrés fort'], ['peek', 'un œil ouvert'], ['soft', 'bonne nuit']].forEach(([e, lab], i) => {
    const x = 118 + i * 185;
    head(C, { x, y: 700, s: 1.0, view: 'front', expr: e, seed: 2000 + i * 41, look: e === 'wide' ? [0, -0.6] : [0, 0] });
    label(lab, x, 812, 24);
  });
  rule(40, 835, 960, 835, 5);
  // palette
  Object.entries(K).forEach(([k, c], i) => {
    const x = 50 + i * 76, y = 880;
    fill(BG, [[x, y], [x + 56, y], [x + 56, y + 70], [x, y + 70]], { col: c, p: 0.85, seed: 300 + i, gap: 8, w: 10 });
    if (k === 'white') line(BG, [[x, y], [x + 56, y], [x + 56, y + 70], [x, y + 70], [x, y]], { w: 3, col: K.night, p: 0.4, seed: 350 });
    label(k, x + 28, y + 96, 20);
  });
  label('12 crayons · contours prune, jamais noirs · une seule aquarelle : outremer (la nuit dans la fenêtre)', 490, 1040, 22, { p: 0.7 });
  // poses clés
  label('POSES CLÉS', 1010, 130, 34, { align: 'left', font: 'Gaegu', weight: 700 });
  // 1 couchée, yeux au plafond (couette lilas)
  const duvet1 = P => part(C, [[1030, 380], [1290, 392], [1300, 470], [1020, 476]], { col: K.lilac, p: 0.85, gap: 10, w: 11, ang: 0.3, seed: 3150 }, { w: 7, seed: 3151 });
  part(C, [[1180, 330], [1340, 320], [1360, 420], [1200, 430]].map(q => q), { col: K.white, p: 0.7, gap: 8, w: 10, seed: 3160, over: 2 }, { w: 6, seed: 3161 });   // oreiller
  aliyah(C, { x: 1262, y: 372, s: 0.92, pose: 'lie', expr: 'wide', look: [-0.7, 0], duvet: duvet1, seed: 3100 });
  label('1 · couchée, yeux au plafond', 1190, 520, 25);
  // 2 assise, yeux serrés, poings
  const duvet2 = P => part(C, [[1420, 440], [1680, 436], [1690, 520], [1410, 524]], { col: K.lilac, p: 0.85, gap: 10, w: 11, ang: 0.3, seed: 3250 }, { w: 7, seed: 3251 });
  aliyah(C, { x: 1550, y: 470, s: 0.92, pose: 'sit', expr: 'shut', arms: 'fists', duvet: duvet2, seed: 3200 });
  label('2 · « fermer les yeux très fort »', 1550, 560, 25);
  // 3 assise, regarde la porte, petit signe
  const duvet3 = P => part(C, [[1720, 440], [1900, 436], [1900, 520], [1710, 524]], { col: K.lilac, p: 0.85, gap: 10, w: 11, ang: 0.3, seed: 3350 }, { w: 7, seed: 3351 });
  aliyah(C, { x: 1800, y: 470, s: 0.92, pose: 'sit', expr: 'soft', arms: 'wave', look: [-0.8, 0.1], headTilt: -0.12, duvet: duvet3, seed: 3300 });
  label('3 · bonne nuit', 1800, 560, 25);
  // 4 Papa, silhouette
  label('PAPA', 1010, 630, 34, { align: 'left', font: 'Gaegu', weight: 700 });
  fill(BG, [[1040, 650], [1290, 650], [1290, 1040], [1040, 1040]], { col: K.gold, p: 0.85, gap: 12, w: 13, ang: 1.5, seed: 3400, boil: 0 });
  papa(C, { x: 1165, y: 1030, s: 0.52, seed: 3500 });
  label('chemise brune, manches retroussées, regard doux', 1165, 1058, 20, { p: 0.7 });
  // 5 : détails : étoile du pyjama, nœud, lune-veilleuse
  label('DÉTAILS', 1560, 630, 34, { align: 'left', font: 'Gaegu', weight: 700 });
  star5(C, [1620, 720], 34, 4000, 0, K.white, K.ink);
  label('étoile blanche (cire)', 1620, 790, 20, { p: 0.7 });
  aliyah(C, { x: 1420, y: 1040, s: 1.2, pose: 'stand', view: 'q', expr: 'wide', look: [0.4, -0.3], seed: 4100 });
  label('3/4 agrandi', 1420, 1075, 20, { p: 0.7 });
  // lampe lune sur table
  part(C, [[1760, 880], [1900, 880], [1900, 1000], [1760, 1000]], { col: K.wood, p: 0.85, gap: 9, w: 10, ang: 1.5, seed: 4200 }, { w: 6, seed: 4201 });
  const cres = []; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + i / 30 * Math.PI; cres.push([1830 + Math.cos(a) * 46, 830 + Math.sin(a) * 46]); } for (let i = 30; i >= 0; i--) { const a = -Math.PI / 2 + i / 30 * Math.PI; cres.push([1842 + Math.cos(a) * 34, 830 + Math.sin(a) * 36]); }
  part(C, cres, { col: K.yellow, p: 0.95, gap: 4, w: 6, seed: 4300, over: 1 }, { w: 5, seed: 4301 });
  label('veilleuse lune', 1830, 1040, 20, { p: 0.7 });
  label('les traits bouillonnent sur deux images · la couleur déborde du trait', 1700, 1075, 18, { p: 0.6 });
  comp.paperCam(0, 0, 1);
  comp.begin(PAL.paper);
  comp.crayon(BG.c);
  comp.group(C);
  comp.crayon(TX.c);
  comp.finish({ vig: 0.18 });
}
