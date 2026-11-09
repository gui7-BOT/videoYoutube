# Mix : la chanson (0 → 40 s, fondu 1,5 s) + une foley crayon discrète sur les traits (events.json) → out/mix.wav
# Usage : .venv/bin/python films/aliyah-notre-pere/mix.py   (après `ffmpeg … out/song.wav`, voir build.sh)
import sys, os, json, numpy as np, soundfile as sf, soxr
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, bp, lp, hp, add, limit

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; EV = E['ev']; N = int(DUR * SR)
tt = np.arange(N) / SR
rng = np.random.default_rng(7)
def nz(d): return rng.standard_normal(int(round(d * SR)))
def T(d): return np.arange(int(round(d * SR))) / SR
def fade(x, a=.01, b=.03):
    n = len(x); ia, ib = min(n, int(a * SR)), min(n, int(b * SR))
    if ia: x[:ia] *= np.linspace(0, 1, ia)
    if ib: x[-ib:] *= np.linspace(1, 0, ib)
    return x
def envelope(d, pts):
    k = np.array(pts, float); return np.interp(T(d), k[:, 0] * d, k[:, 1])

# crayon sur papier : frottement saccadé = bruit passe-bande × grain irrégulier ; plus vite = grain plus dense et plus clair
def crayon(d, speed=1.0, v=1.0):
    n = nz(d)
    rate = int(SR / (70 + 90 * speed))
    grain = uniform_filter1d((rng.random(len(n) // rate + 2) ** 3).repeat(rate)[:len(n)], rate // 3 + 1)
    x = bp(n, 1400 + 600 * speed, 6500, 2) * (0.35 + grain * 1.6) + bp(n, 300, 900, 1) * 0.15
    return fade(x * envelope(d, [(0, 0), (.08, 1), (.85, .9), (1, 0)]) * v * 0.22, .01, .04)
# coloriage : va-et-vient = une courte raclure par passe
def scribble(d, rate=6.5, v=1.0):
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.08:
        L = 1 / rate * (0.8 + 0.4 * rng.random()); s = crayon(min(L, d - t), 1.3, v * (0.7 + 0.3 * rng.random()))
        i = int(t * SR); out[i:i + len(s)] += s[:len(out) - i]; t += L
    return out
def paper_rustle(d=0.6, v=1.0):
    n = nz(d); cr = (rng.random(len(n)) < 0.004) * rng.standard_normal(len(n)) * 3
    return fade((hp(n, 900) * 0.25 + bp(cr, 1500, 8000)) * envelope(d, [(0, 0), (.2, 1), (1, 0)]) * v * 0.25)
def brush(d, v=1.0):   # pinceau mouillé : large bande douce + grain fin, attaque et relâche lentes
    n = nz(d)
    wet = lp(n, 1800) * 0.5 + bp(n, 1800, 5000) * 0.18
    grain = uniform_filter1d(np.abs(rng.standard_normal(len(n))), 400) * 0.6 + 0.7
    return fade(wet * grain * envelope(d, [(0, 0), (.06, .9), (.3, 1), (.8, .85), (1, 0)]) * 0.22 * v, .03, .1)
def pop(v=1.0):   # substitution : un trait très court et sec
    return crayon(0.09, 1.8, v)

fol = np.zeros((N, 2))
def put(x, at, g=1.0, pan=0.0): add(fol, x.astype(np.float64), at, g, pan)
for e in EV:
    t, ty, pan = e['t'], e['type'], e.get('pan', 0.0)
    if ty == 'scratch': put(crayon(e['dur'], 1.1), t, 1.0, pan)
    elif ty == 'scribble': put(scribble(e['dur'], 5.5 if e.get('long') else 6.5), t, 0.8, pan)
    elif ty == 'paper': put(paper_rustle(0.8), t, 0.7)
    elif ty == 'pop': put(pop(), t, 0.9, pan)
    elif ty == 'brush':
        d = e['dur'] + 0.25; x = brush(d); L = len(x); s = int(t * SR); pn = np.linspace(-0.85, 0.85, L)
        l, r = np.cos((pn + 1) * np.pi / 4) * 1.414, np.sin((pn + 1) * np.pi / 4) * 1.414
        e2 = min(N, s + L); fol[s:e2, 0] += (x * l)[:e2 - s]; fol[s:e2, 1] += (x * r)[:e2 - s]

# la chanson : 0 → 40 s, fondu de 1,5 s à la fin
song, ssr = sf.read(os.path.join(HERE, 'out', 'song.wav'))
if song.ndim == 1: song = np.stack([song, song], 1)
if ssr != SR: song = soxr.resample(song, ssr, SR)
mus = np.zeros((N, 2)); L = min(N, len(song)); mus[:L] = song[:L]
mus *= np.interp(tt, [0, DUR - 1.5, DUR], [1, 1, 0])[:, None]

def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
# la foley reste loin sous la chanson : environ 19 dB sous son RMS, et elle se tait dans le creux (34,8 → 36,5)
target = db(mus) - 19.0
fol *= 10 ** ((target - db(fol[np.abs(fol).sum(1) > 1e-6])) / 20) if np.any(np.abs(fol) > 0) else 1
fol *= np.interp(tt, [0, 34.6, 34.9, 36.4, 36.7, DUR], [1, 1, 0, 0, 1, 1])[:, None]
mix = mus + fol
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
for name, x in [('chanson', mus), ('foley', fol), ('mix', mix)]: print(f'{name:8s} RMS {db(x):6.1f} dB  crête {20*np.log10(np.abs(x).max()+1e-9):6.1f}')
for a, b in [(0, 12.8), (12.8, 24.1), (24.1, 34.8), (34.8, 36.5), (36.5, 40)]:
    s, e = int(a * SR), int(b * SR); print(f'{a:5.1f}-{b:5.1f}  chanson {db(mus[s:e]):6.1f}  foley {db(fol[s:e]):6.1f}')
