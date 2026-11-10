"""Mix : chanson (out/song.wav, 0 → 40 s, fondu 1,5 s) + foley discrète propre au style (tampon, plume, papier, iris, tissu, bois)
+ ton de pièce très bas -> out/mix.wav.  Lancer depuis la racine de la bibliothèque : .venv/bin/python films/aliyah-midcentury-toon/mix.py
Silence : de 34,8 à 36,6 s tout est coupé (foley et ambiance), la chanson seule porte le creux avant « Je pousse la porte »."""
import sys, os, json, numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.environ.get('LIB') or os.path.abspath(os.path.join(D, '../..'))
sys.path.insert(0, ROOT)
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, clack, creak, pop, add, limit
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(1950)
def nz(d): return rng.standard_normal(len(t_(d)))
def sine(f, d): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, len(t_(d))).astype(float)) / SR)
def M(*xs): n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def hann(d): return np.sin(np.pi * t_(d) / d) ** 2
# ---- foley par matière (impression, papier, encre)
def stamp():                       # tampon caoutchouc amorti : un cel qui se pose
    d = .26; tt = t_(d)
    return norm(M(sine(130 * (1 - .35 * tt), d) * env_exp(d, .03), lp(nz(d), 1500) * env_exp(d, .01) * .8))
def pen(d):                        # plume qui écrit le trait : stick-slip passe-bande
    x = bp(nz(d), 1800, 6500) * (0.45 + .55 * np.abs(np.sin(2 * np.pi * 9 * t_(d) + 1.3))); return norm(x) * np.sin(np.pi * t_(d) / d) ** .8
def tick(): return norm(clack(1.4, 1)[:int(.08 * SR)])
def swish(d, sweep=0):             # papier qui glisse (essuyage de couleur) ; sweep = balayage long et régulier
    x = bp(nz(d), 1500, 7000)
    if sweep: x = x * (0.75 + .25 * np.sin(2 * np.pi * 2.5 * t_(d)))
    return norm(x) * hann(d) ** (0.6 if sweep else 1)
def iris(d): tt = t_(d); return norm(bp(nz(d), 900, 5000) * np.linspace(1, .25, len(tt))) * np.sin(np.pi * tt / d)
def cloth(): d = .16; return norm(lp(nz(d), 1400) * env_exp(d, .035) * (0.6 + .4 * np.abs(np.sin(2 * np.pi * 40 * t_(d)))))
def wood():                        # porte : craquement + petit choc de bois
    c = creak(1); x = np.zeros(int(.4 * SR)); x[:len(c)] += c * .8
    k = norm(clack(.7, 1)[:int(.1 * SR)]); o = int(.12 * SR); x[o:o + len(k)] += k * .6; return norm(lp(x, 4000))
fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty, gn, pan = e['t'], e['type'], e.get('gain', 1.0), e.get('pan', 0.0)
    if ty == 'stamp': add(fx, stamp(), t, .55 * gn, pan)
    elif ty == 'pen': add(fx, pen(e.get('dur', .5)), t, .16 * gn, pan)
    elif ty == 'tick': add(fx, tick(), t, .22 * gn, pan)
    elif ty == 'pop': add(fx, pop(1), t, .22 * gn, pan)
    elif ty == 'swish': add(fx, swish(e.get('dur', .4), e.get('sweep', 0)), t, .26 * gn, pan)
    elif ty == 'iris': add(fx, iris(e.get('dur', .5)), t, .22 * gn, pan)
    elif ty == 'cloth': add(fx, cloth(), t, .35 * gn, pan)
    elif ty == 'wood': add(fx, wood(), t, .4 * gn, pan)
# ---- ton de pièce, très bas (la chanson porte)
room = lp(brown(DUR), 700) * .010
amb += np.stack([room, np.roll(room, 421)], 1)
# ---- la chanson, 0 → 40 s, fondu 1,5 s
song, ssr = sf.read(os.path.join(D, 'out', 'song.wav'))
assert ssr == SR, ssr
if song.ndim == 1: song = np.stack([song, song], 1)
song = song[:N] if len(song) >= N else np.pad(song, ((0, N - len(song)), (0, 0)))
fade = np.ones(N); a, b = int(38.5 * SR), N; fade[a:b] = np.linspace(1, 0, b - a) ** 1.4
song = song * fade[:, None]
# ---- niveaux : foley ≈ 24 dB sous la chanson (RMS, sur les fenêtres actives), puis le silence
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
sr_song = rms(song[int(2 * SR):int(38 * SR)])
act = np.abs(fx).max(1) > 1e-4; sr_fx = rms(fx[act]) if act.any() else 1
fx *= sr_song / sr_fx * 10 ** (-24 / 20)
def gate(buf, a, b, fade=.04):
    s, e = int(a * SR), int(b * SR); f = int(fade * SR); m = np.ones(N); m[s:e] = 0
    m[s - f:s] = np.linspace(1, 0, f); m[e:e + f] = np.linspace(0, 1, f); buf *= m[:, None]
gate(fx, 34.8, 36.6); gate(amb, 34.8, 36.6)
mix = song + fx + amb
mix = limit(mix, .95)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3), 'song rms dB', round(20 * np.log10(sr_song), 1), 'foley rms dB (actif)', round(20 * np.log10(rms(fx[act])), 1))
