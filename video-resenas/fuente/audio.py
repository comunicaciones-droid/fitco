# Genera la música de fondo + efectos de sonido sincronizados con video.html
# Uso: python3 audio.py salida.wav
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
DUR = 20.0
# Pausas de lectura [tiempo de animación, segundos extra]; igual que HOLDS en video.html
HOLDS = [(2.94, 1.2), (7.24, 1.5), (11.24, 1.4), (14.2, 0.9)]


def real(t):
    return t + sum(e for h, e in HOLDS if t > h)

N = int(SR * DUR)
rng = np.random.default_rng(3)
BPM = 124
BEAT = 60 / BPM

music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
kbuf = np.zeros((N, 2))


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def add(buf, start, x, gain=1.0, pan=0.0):
    if buf is sfx:
        start = real(start)
    i = int(start * SR)
    if i >= N:
        return
    x = x[: N - i]
    if x.ndim == 1:
        l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        x = np.stack([x * l, x * r], 1) * 1.414
    buf[i:i + len(x)] += x * gain


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low')
    return signal.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high')
    return signal.lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)


def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def saw(f, d, detune=(0,)):
    t = t_arr(d)
    out = np.zeros_like(t)
    for dt in detune:
        ff = f * 2 ** (dt / 1200)
        out += 2 * ((t * ff + rng.random()) % 1) - 1
    return out / len(detune)


# ---------------- MUSIC ----------------
def kick():
    t = t_arr(0.4)
    f = 48 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) + 0.3 * np.sin(ph) * np.exp(-t / 0.01)


def clap():
    n = rng.standard_normal(int(SR * 0.25))
    e = env(len(n), 0.001, 0.07)
    for k in (0.008, 0.016):  # flam
        e[int(k * SR):] += 0.6 * env(len(n) - int(k * SR), 0.001, 0.02)
    return bp(n * e, 900, 5000)


def hat(open_=False):
    n = rng.standard_normal(int(SR * (0.25 if open_ else 0.06)))
    return hp(n * env(len(n), 0.001, 0.08 if open_ else 0.015), 7000)


# Am - F - C - G (2 beats... 4 beats each)
prog = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]
nbeats = int(DUR / BEAT) + 2
DROP = real(3.4)
END = 19.0
duck = np.ones(N)

for b in range(nbeats):
    tb = b * BEAT
    if tb >= DUR:
        break
    full = tb >= DROP - 0.01
    outro = tb >= END
    # kick (four on the floor), skip during the last beat before the drop for tension
    if not (DROP - BEAT * 1.01 < tb < DROP - 0.01) and not outro:
        add(kbuf, tb, kick(), 0.95)
        i = int(tb * SR)
        dl = min(int(0.22 * SR), N - i)
        duck[i:i + dl] = np.minimum(duck[i:i + dl], 0.35 + 0.65 * np.linspace(0, 1, dl) ** 0.6)
    if full and not outro and b % 2 == 1:
        add(music, tb, clap(), 0.45, 0.1)
    # hats on offbeats (+16ths when full)
    if not outro:
        add(music, tb + BEAT / 2, hat(open_=full and b % 4 == 3), 0.22 if full else 0.13, -0.3)
        if full:
            add(music, tb + BEAT / 4, hat(), 0.08, 0.3)
            add(music, tb + 3 * BEAT / 4, hat(), 0.08, 0.3)

    root, chord = prog[(b // 4) % 4]
    # bass: 8ths octave pluck
    if not outro:
        for k, oct_ in ((0, 0), (0.5, 12)):
            if not full and k == 0.5:
                continue
            x = saw(midi(root - 12 + oct_), BEAT / 2, (0, 7))
            x = lp(x, 900 if full else 500) * env(len(x), 0.004, 0.12)
            add(music, tb + k * BEAT, x, 0.32)

# chord pad / plucks per bar
for bar in range(int(DUR / (4 * BEAT)) + 1):
    tb = bar * 4 * BEAT
    if tb >= DUR:
        break
    root, chord = prog[bar % 4]
    full = tb >= DROP - 0.01
    pad = sum(saw(midi(m), 4 * BEAT, (-12, 0, 11)) for m in chord) / len(chord)
    cutoff = 1400 if full else 500 + 250 * bar
    pad = lp(pad, cutoff, 2)
    e = np.minimum(t_arr(4 * BEAT) / 0.08, 1) * np.minimum((4 * BEAT - t_arr(4 * BEAT)) / 0.1, 1)
    add(music, tb, np.stack([pad * e, np.roll(pad, 300) * e], 1), 0.18)
    # arpeggio pluck after the drop
    if full and tb < END:
        notes = chord + [chord[1] + 12, chord[2] + 12]
        for s in range(8):
            m = notes[[0, 2, 1, 3, 2, 4, 3, 5][s]] + 12
            x = saw(midi(m), 0.3, (0, 9)) + 0.5 * np.sin(2 * np.pi * midi(m) * t_arr(0.3))
            x = lp(x, 3200) * env(len(x), 0.002, 0.09)
            add(music, tb + s * BEAT / 2, x, 0.10, 0.4 if s % 2 else -0.4)

# riser into the drop (2.2s -> 3.4s)
r = rng.standard_normal(int(SR * 1.2))
sweep = np.zeros_like(r)
for k, seg in enumerate(np.array_split(np.arange(len(r)), 24)):
    f = 600 * 2 ** (k / 5)
    sweep[seg] = bp(r[max(seg[0] - 2000, 0):seg[-1] + 1], f * .7, min(f * 1.4, 18000))[-len(seg):]
add(music, DROP - 1.2, sweep * np.linspace(0, 1, len(r)) ** 2, 0.35)

music *= duck[:, None]  # sidechain
music += kbuf

# final chord hit
fin = sum(saw(midi(m), 2.0, (-10, 0, 10)) for m in [57, 60, 64, 69, 72]) / 5
fin = lp(fin, 2500) * env(len(fin), 0.003, 0.5)
add(music, END, fin, 0.35)
add(music, END, kick(), 0.8)

# ---------------- SFX ----------------
def pop(pitch=600, d=0.12):
    t = t_arr(d)
    f = pitch * (1 + 1.2 * np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.04)


def ding(m, d=0.6):
    t = t_arr(d)
    f = midi(m)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sin(2 * np.pi * 3.01 * f * t)
    return x * env(len(t), 0.002, 0.18)


def whoosh(d=0.75, lo=300, hi=4000):
    n = rng.standard_normal(int(SR * d))
    out = np.zeros_like(n)
    segs = np.array_split(np.arange(len(n)), 30)
    for k, seg in enumerate(segs):
        p = np.sin(np.pi * k / (len(segs) - 1))
        f = lo + (hi - lo) * p
        out[seg] = bp(n[max(seg[0] - 1500, 0):seg[-1] + 1], f * 0.6, f * 1.5)[-len(seg):]
    e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2
    return out * e


def click():
    n = rng.standard_normal(int(SR * 0.03))
    return hp(n * env(len(n), 0.0005, 0.006), 2500) + 0.3 * pop(1800, 0.03)


def sparkle(d=0.9, k=28):
    out = np.zeros(int(SR * d))
    for _ in range(k):
        s = int(rng.random() * (len(out) - 4000))
        f = 2500 + rng.random() * 5000
        x = np.sin(2 * np.pi * f * t_arr(0.08)) * env(int(SR * 0.08), 0.001, 0.02)
        out[s:s + len(x)] += x * (1 - s / len(out))
    return out


# wipes
for t0 in (3.03, 7.33, 11.33):
    add(sfx, t0, whoosh(), 0.9, 0)
# rings / logo intro
add(sfx, 0.05, whoosh(0.9, 150, 1500), 0.5)
add(sfx, 0.1, pop(500), 0.6)
# marker swipe
add(sfx, 1.05, whoosh(0.4, 1500, 6000), 0.35, 0.3)
# typing
for i, t0 in enumerate([1.75, 1.85, 1.95, 2.05, 2.15]):
    add(sfx, t0, click(), 0.5, (-0.3, 0.3)[i % 2])
# result card + small stars
add(sfx, 2.35, pop(420), 0.55)
for i, t0 in enumerate([2.38, 2.43, 2.48, 2.53]):
    add(sfx, t0, ding(84 + [0, 2, 4, 7][i], 0.3), 0.12)
# badges
add(sfx, 3.85, pop(520), 0.6, -0.3)
add(sfx, 4.1, pop(620), 0.6, 0.3)
add(sfx, 4.25, whoosh(0.4, 500, 3000), 0.3)
# rating stars (ascending pentatonic)
for i, t0 in enumerate([4.55, 4.67, 4.79, 4.91, 5.03]):
    add(sfx, t0, ding([76, 79, 81, 84, 88][i]), 0.28, -0.4 + 0.2 * i)
# tiles + bars
add(sfx, 6.0, pop(480), 0.55, -0.3)
add(sfx, 6.15, pop(560), 0.55, 0.3)
for i, t0 in enumerate([6.2, 6.3, 6.4, 6.5, 6.6]):
    add(sfx, t0, pop(700 + 120 * i, 0.08), 0.3, -0.3)
for i, t0 in enumerate([6.35, 6.45, 6.55, 6.65, 6.75]):
    add(sfx, t0, pop(900 + 80 * i, 0.06), 0.2, 0.3)
add(sfx, 6.7, ding(91, 0.5), 0.15)
# phone + floating cards
add(sfx, 7.75, whoosh(0.8, 120, 1200), 0.6)
add(sfx, 8.45, whoosh(0.4, 600, 3500), 0.4, -0.5)
add(sfx, 8.65, whoosh(0.4, 600, 3500), 0.4, 0.5)
# modal
add(sfx, 9.25, pop(450, 0.18), 0.7)
# tap + stars + confetti
add(sfx, 10.1, click(), 0.9)
add(sfx, 10.1, pop(300, 0.1), 0.5)
for i, t0 in enumerate([10.15, 10.22, 10.29, 10.36, 10.43]):
    add(sfx, t0, ding([79, 81, 84, 86, 91][i], 0.5), 0.25, -0.4 + 0.2 * i)
add(sfx, 10.42, sparkle(), 0.35, 0.2)
add(sfx, 10.42, whoosh(0.5, 2000, 8000), 0.25)
# review bubbles
add(sfx, 10.55, pop(600), 0.55, -0.5)
add(sfx, 10.68, pop(700), 0.55, 0.5)
# closing
add(sfx, 12.8, whoosh(0.7, 150, 1500), 0.5)
add(sfx, 12.8, pop(380, 0.2), 0.75)
add(sfx, 13.15, pop(560), 0.55, -0.3)
add(sfx, 13.3, pop(660), 0.55, 0.3)
for i, m in enumerate([81, 84, 88, 93]):
    add(sfx, 13.5 + i * 0.06, ding(m, 1.2), 0.22)
add(sfx, 13.5, sparkle(1.2, 36), 0.25)

mix = music * 0.55 + sfx * 0.75
# gentle fade in/out
fade = np.ones(N)
fade[: int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
fade[-int(0.7 * SR):] = np.linspace(1, 0, int(0.7 * SR)) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.1)  # soft clip
mix /= np.abs(mix).max() / 0.89
wavfile.write(sys.argv[1], SR, (mix * 32767).astype(np.int16))
