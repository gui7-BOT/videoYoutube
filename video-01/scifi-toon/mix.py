"""Mix : chanson fournie (0 → 40 s, fondu 1,5 s) + foley discrète synthétisée (events.json) → out/mix.wav
Usage : LIB=<bibliothèque> python mix.py   (après `ffmpeg … out/song.wav` et `node core/render/events.mjs <projet>`)"""
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, norm, click, whoosh, pop, thump, creak, limit, add

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR)
rng = np.random.default_rng(11)
nz = lambda d: rng.standard_normal(int(round(d * SR)))
def fade(x, a=.004, r=.03):
    n = len(x); x = x.copy(); A, R = min(n, int(a * SR)), min(n, int(r * SR)); x[:A] *= np.linspace(0, 1, A); x[n - R:] *= np.linspace(1, 0, R); return x
def sweep(f0, f1, d, curve=1.0):
    tt = t_(d); f = f0 * (f1 / f0) ** ((tt / d) ** curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)

# —— la chanson : 0 → 40 s, fondu de 1,5 s à la fin ——
song, sr = sf.read(os.path.join(HERE, 'out', 'song.wav'))
assert sr == SR, sr
if song.ndim == 1: song = np.stack([song, song], 1)
song = song[:N] if len(song) >= N else np.pad(song, ((0, N - len(song)), (0, 0)))
fo = np.ones(N); k = int(1.5 * SR); fo[N - k:] = np.linspace(1, 0, k) ** 1.2
song = song * fo[:, None]

# —— foley (palette du style, douce) ——
def blip(f=1700, d=.05): return norm(np.sin(2 * np.pi * f * t_(d)) * np.sin(np.pi * t_(d) / d))
def key(): return norm(click(1.6) * .8 + np.pad(np.sin(2 * np.pi * 2100 * t_(.03)) * env_exp(.03, .008), (0, max(0, len(click(1.6)) - int(.03 * SR)))))
def night(): d = .5; return norm(lp(thump(1, 58) * 1.0, 400) + np.pad(lp(nz(.2), 500) * env_exp(.2, .05) * .3, (0, int(.15 * SR))))
def fwump(): d = .3; x = thump(1, 80)[:int(d * SR)] + lp(nz(d), 900) * env_exp(d, .06) * .8; return norm(x)
def squeak(): d = .1; tt = t_(d); return norm(np.sin(2 * np.pi * (1800 + 400 * np.sin(2 * np.pi * 28 * tt)) * tt) * np.sin(np.pi * tt / d))
def toy():   # jouet qui couine : deux tons, montée puis descente, avec un peu d'harmoniques
    d = .22; tt = t_(d); f = 900 + 500 * np.sin(np.pi * tt / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .35 * np.sin(4 * np.pi * np.cumsum(f) / SR); return norm(x * np.sin(np.pi * tt / d) ** .6)
def glow():  # la lueur dorée s'ouvre : petit boom grave + souffle filtré qui monte + quelques étincelles
    d = 1.4; tt = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(50 + 40 * np.exp(-tt / .15)) / SR) * env_exp(d, .35)
    rise = np.zeros_like(tt); x = nz(d)
    for i in range(0, len(x), 480):
        hi = min(len(x), i + 480); f = 500 * (6 ** (i / len(x))); rise[i:hi] = bp(x[max(0, i - 2400):hi], f * .7, min(f * 1.3, 20000))[-(hi - i):]
    rise *= np.sin(np.pi * np.minimum(tt / d, 1)) ** 1.5
    sp = hp(nz(d), 6000) * (rng.random(len(tt)) > .998) * 3 * np.sin(np.pi * tt / d)
    return norm(boom * .9 + rise * .5 + lp(sp, 12000) * .25)
def swish(): d = .18; return norm(bp(nz(d), 1200, 5000) * np.sin(np.pi * t_(d) / d) ** 2)

FX = {'pop': (lambda: pop(1), .55), 'subpop': (lambda: pop(1)[:int(.1 * SR)], .3), 'blip': (lambda: blip(), .35), 'key': (key, .25), 'night': (night, .9),
      'whoosh': (lambda: whoosh(.32), .6), 'fwump': (fwump, .9), 'squeak': (squeak, .3), 'toy': (toy, .4), 'creak': (lambda: creak(), .6), 'glow': (glow, 1.0), 'wave': (swish, .35)}
fx = np.zeros((N, 2))
for e in E['ev']:
    ty, t, v = e['type'], e['t'], e.get('v', 1.0)
    if ty in FX: f, gain = FX[ty]; add(fx, fade(f()) * v, t, gain, float(rng.uniform(-.15, .15)))
# la foley se tait dans le creux de la chanson (34,8 → 36,5)
mute = np.ones(N); a, b = int(34.8 * SR), int(36.5 * SR); mute[a:b] = 0; mute[a - 2400:a] = np.linspace(1, 0, 2400); mute[b:b + 2400] = np.linspace(0, 1, 2400)
fx *= mute[:, None]

# niveau : la foley reste environ 18 dB (RMS) sous la chanson
def rms(x): return np.sqrt((x ** 2).mean()) + 1e-9
act = np.abs(fx).max(1) > 1e-4
g = rms(song) * 10 ** (-18 / 20) / rms(fx[act]) if act.any() else 0
fx *= g
mix = song + fx
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix peak %.3f  chanson %.1f dB  foley (actif) %.1f dB  écart %.1f dB' % (np.abs(mix).max(), 20 * np.log10(rms(song)), 20 * np.log10(rms(fx[act])), 20 * np.log10(rms(song)) - 20 * np.log10(rms(fx[act]))))
