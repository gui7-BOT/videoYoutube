// Contrat de page : window.READY, window.render(t), window.DUR, window.EV, window.TEXTS
import { textures } from './engine/toon.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['700 80px Oleo', '80px Slab', '400 40px Jost', '500 40px Jost', '600 40px Jost'].map(f => document.fonts.load(f)));
textures();
const cues = await (await fetch('cues.json')).json();
const film = await import('./film.js');
film.setup(cues);
window.DUR = film.DUR; window.EV = film.events(); window.TEXTS = t => film.texts(t);
window.render = async t => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (Q.get('test') === 'model') { (await import('./sheet.js')).drawSheet(g, t); return; }
  film.renderFilm(g, t, Q);
};
window.READY = true;
