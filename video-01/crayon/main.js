// Entrée : ?test=model → planche-modèle ; sinon le film
import { makeComp } from './gl.js';
import { BOIL } from './crayon.js';
const Q = new URLSearchParams(location.search);
const comp = makeComp(document.getElementById('gl'));
window.DUR = 1;
await Promise.all(['400 40px "Patrick Hand"', '700 40px Gaegu'].map(f => document.fonts.load(f)));
if (Q.get('test') === 'model') {
  const S = await import('./sheet.js');
  window.render = t => { BOIL.step = Math.floor(t * 12 + 1e-6); S.sheet(comp, t); };
} else {
  const cues = await (await fetch('cues.json')).json();
  const M = await import('./film.js');
  M.setCues(cues);
  window.DUR = M.DUR; window.EV = M.EV; window.SUBS = M.SUBS; window.TEXTS = M.TEXTS;
  window.render = t => { BOIL.step = Math.floor(t * 12 + 1e-6); M.frame(comp, t, Q); };
}
window.READY = true;
