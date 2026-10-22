"""Synthesizes the v12 reel soundtrack: an upbeat 120 BPM track plus SFX.

Everything is generated from scratch here (no samples), so the audio is
original and royalty-free.

Run: python3 scripts/v12_audio.py  ->  public/v12/audio.wav
Event frames are v11 frames at 30 fps; they must match src/FitcoReelV12.
"""
import wave

import numpy as np

SR = 44100
FPS = 30
SPLIT, INSERT = 1128, 195
DURATION = (1605 + INSERT) / FPS
N = int(DURATION * SR)
rng = np.random.default_rng(12)


def out_s(v11_frame):
    """v11 frame -> output seconds (accounts for the inserted scene)."""
    f = v11_frame if v11_frame < SPLIT else v11_frame + INSERT
    return f / FPS


def ins_s(frame):
    """Frame inside the inserted scene -> output seconds."""
    return (SPLIT + frame) / FPS


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def place(buf, sig, start_s, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf):
        return
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i] * gain


def smooth(x, width):
    k = np.ones(width) / width
    return np.convolve(x, k, mode="same")


def highpass(x, width):
    return x - smooth(x, width)


def one_pole(x, cutoff):
    """Time-varying one-pole low-pass (cutoff may be an array)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


# ---------------------------------------------------------------- instruments
def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    freq = 48 + 110 * np.exp(-t / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.16)
    click = rng.standard_normal(n) * np.exp(-t / 0.003) * 0.25
    return body + click


def clap():
    n = int(0.25 * SR)
    noise = highpass(rng.standard_normal(n), 6)
    noise = smooth(noise, 3)
    e = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        e[i:] += env(n - i, 0.001, 0.012 if off < 0.02 else 0.09)
    return noise * e * 0.6


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    noise = highpass(rng.standard_normal(n), 3)
    return noise * env(n, 0.0005, 0.05 if open_ else 0.012) * 0.35


def tone(freq, length, harmonics=(1.0,), detune=0.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in ((-detune, detune) if detune else (0.0,)):
        f = freq * (1 + d)
        for h, amp in enumerate(harmonics, start=1):
            if f * h < 9000:
                out += amp * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28))
    return out


SAW = tuple(1 / h for h in range(1, 9))
SOFT = (1.0, 0.45, 0.2, 0.1)


def pad(notes, length):
    sig = sum(tone(midi(n), length, SOFT, detune=0.004) for n in notes)
    n = len(sig)
    t = np.arange(n) / SR
    shape = np.clip(t / 0.25, 0, 1) * np.clip((length - t) / 0.3, 0, 1)
    return sig * shape / len(notes)


def bass(note, length):
    sig = tone(midi(note), length, (1.0, 0.5, 0.25, 0.12))
    sig += 0.6 * tone(midi(note - 12), length)
    return sig * env(len(sig), 0.004, 0.22)


def pluck(note, length=0.22):
    sig = tone(midi(note), length, SAW[:6])
    return sig * env(len(sig), 0.002, 0.07)


def lead(note, length=0.24):
    sig = tone(midi(note), length, (1.0, 0.0, 0.33, 0.0, 0.2), detune=0.003)
    return sig * env(len(sig), 0.005, 0.16)


def riser(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    filt = one_pole(noise, np.geomspace(300, 9000, n)) - one_pole(noise, np.geomspace(80, 2500, n))
    sweep = np.sin(2 * np.pi * np.cumsum(np.geomspace(220, 880, n)) / SR) * 0.15
    return (filt * 1.4 + sweep) * (t / length) ** 2


# ---------------------------------------------------------------- SFX
def whoosh(length=0.45, f0=500, f1=5000, gain=1.0):
    n = int(length * SR)
    noise = rng.standard_normal(n)
    cut = np.geomspace(f0, f1, n)
    y = one_pole(noise, cut) - one_pole(noise, cut / 5)
    return y * np.sin(np.linspace(0, np.pi, n)) ** 1.6 * 2.2 * gain


def pop(freq=900, length=0.09):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.8 * np.exp(-t / 0.012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.025)


def bell(freq, length=0.9, gain=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.35)
        + 0.5 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t / 0.2)
        + 0.25 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t / 0.1)
    )
    return sig * np.clip(t / 0.002, 0, 1) * gain


def ding():
    return bell(midi(84), 0.7) + 0.7 * np.pad(bell(midi(91), 0.7), (int(0.08 * SR), 0))[: int(0.7 * SR)]


def click():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return (highpass(rng.standard_normal(n), 2) * np.exp(-t / 0.004) * 0.7
            + np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.006) * 0.5)


def tick(freq):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.012)


def impact():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 40 + 120 * np.exp(-t / 0.05)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
            + rng.standard_normal(n) * np.exp(-t / 0.02) * 0.3)


def success():
    out = np.zeros(int(1.2 * SR))
    for i, n in enumerate((72, 76, 79, 84)):
        place(out, bell(midi(n), 0.9, 0.8), i * 0.07)
    return out


# ---------------------------------------------------------------- music
BEAT = 0.5
BAR = 4 * BEAT
GRID0 = 0.3  # a downbeat lands exactly on the drop at out_s(669) = 22.3 s
DROP = out_s(669)
BREAK = out_s(606)
OUTRO = out_s(1446)
CHORDS = [(57, 60, 64), (53, 57, 60), (55, 60, 64), (55, 59, 62)]  # Am F C G
ROOTS = [33, 29, 36, 31]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]
MELODY = [  # 8th notes per bar, None = rest
    [76, None, 72, 74, 76, None, 79, 76],
    [72, None, 69, 72, 74, None, 72, 69],
    [76, None, 72, 74, 76, None, 79, 81],
    [79, None, 74, 76, 74, None, 71, 67],
]

drums = np.zeros(N)
music = np.zeros(N)
leadbuf = np.zeros(N)
kick_times = []

K, C, H, HO = kick(), clap(), hat(), hat(True)
bar = 0
start = GRID0 - BAR  # one pickup bar so the track starts on a beat
while start < DURATION:
    chord, root = CHORDS[bar % 4], ROOTS[bar % 4]
    for beat in range(4):
        t = start + beat * BEAT
        if t < 0 or t >= DURATION:
            continue
        in_break = BREAK <= t < DROP
        outro = t >= OUTRO
        if not in_break and not outro:
            place(drums, K, t, 0.9)
            kick_times.append(t)
            place(drums, HO, t + BEAT / 2, 0.5 if t >= 3.4 else 0.3)
            if beat in (1, 3) and t >= 3.4:
                place(drums, C, t, 0.55)
            if t >= DROP:
                place(drums, H, t + BEAT / 4, 0.35)
                place(drums, H, t + 3 * BEAT / 4, 0.35)
        if t >= 3.4 and not in_break and not outro:
            place(music, bass(root, BEAT * 0.45), t + BEAT / 2, 0.55)
            place(music, bass(root, BEAT * 0.3), t, 0.35)
    if start + BAR > 0:
        bar_pad = pad(chord, BAR + 0.3)
        place(music, bar_pad, max(start, 0), 0.32 if start < OUTRO else 0.4)
        for step in range(8):
            t = start + step * BAR / 8
            if 0 <= t < OUTRO:
                notes = list(chord) + [chord[0] + 12]
                place(music, pluck(notes[ARP[step]] + 12), t, 0.16 if t < DROP else 0.12)
        if DROP <= start < OUTRO:
            for step, note in enumerate(MELODY[bar % 4]):
                if note is not None:
                    place(leadbuf, lead(note), start + step * BAR / 8, 0.2)
    start += BAR
    bar += 1

# Final chord rings out over the end card.
place(music, pad((57, 60, 64, 69), DURATION - OUTRO + 0.5), OUTRO, 0.5)
place(music, bass(33, 2.5), OUTRO, 0.5)

# Breakdown: filter the bed down and build a riser into the drop.
t = np.arange(N) / SR
duck_break = np.where((t >= BREAK) & (t < DROP), 0.55, 1.0)
music *= smooth(duck_break, 2000)
place(drums, riser(DROP - BREAK), BREAK, 0.4)
for i, tt in enumerate(np.arange(DROP - 1.0, DROP, BEAT / 4)):
    place(drums, C, tt, 0.15 + 0.25 * i / 8)
place(drums, impact(), DROP, 0.6)
place(drums, impact(), OUTRO, 0.5)

# Sidechain pump on everything tonal.
pump = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    n = int(0.3 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.09)
    end = min(N, i + n)
    pump[i:end] = np.minimum(pump[i:end], seg[: end - i])
music *= pump
leadbuf *= pump

# Stereo: simple delay on lead + plucks for width.
d = int(0.375 * SR)
lead_l = leadbuf + 0.3 * np.pad(leadbuf, (d, 0))[:N]
lead_r = leadbuf + 0.3 * np.pad(leadbuf, (int(d * 1.33), 0))[:N]
mus_l = music + lead_l
mus_r = 0.97 * music + lead_r

# Fade in/out of the music bed.
fade = np.clip(t / 0.08, 0, 1) * np.clip((DURATION - t) / 1.5, 0, 1)
bed_l = (mus_l + drums) * fade
bed_r = (mus_r + drums) * fade

# ---------------------------------------------------------------- SFX events
sfx = np.zeros(N)
for f in (102, 203, 263, 354, 498, 834, 1014, 1128, 1344, 1446):
    place(sfx, whoosh(), out_s(f) - 0.18, 0.35)
place(sfx, whoosh(0.7, 300, 7000), out_s(606) - 0.2, 0.5)   # dark wipe
place(sfx, whoosh(0.5, 4000, 400), out_s(667) - 0.2, 0.4)   # circle reveal
place(sfx, whoosh(), ins_s(0) - 0.18, 0.35)
place(sfx, whoosh(), ins_s(100) - 0.18, 0.35)

for f in (24, 40, 52, 115, 1058, 1067, 1150, 1168, 1190, 1215, 1350, 1375, 1390, 1455, 1480, 1492, 1504):
    place(sfx, pop(950), out_s(f), 0.25)
place(sfx, impact(), out_s(203), 0.35)  # "=" turns into "≠"
for i, f in enumerate(range(270, 350, 15)):  # clock
    place(sfx, tick(1500 if i % 2 == 0 else 1100), out_s(f), 0.22)
place(sfx, ding(), out_s(372), 0.22)   # chat bubble 1
place(sfx, ding(), out_s(421), 0.22)   # chat bubble 2
for f in (533, 541, 549, 558, 566):    # receptionist questions
    place(sfx, pop(1200), out_s(f), 0.22)
place(sfx, pop(700, 0.12), out_s(685), 0.35)   # "Captar clientes" pill
place(sfx, click(), out_s(738), 0.35)           # click on "Comprar"
place(sfx, pop(700, 0.12), out_s(850), 0.35)   # "Retener alumnos" pill
place(sfx, click(), out_s(880), 0.35)
place(sfx, click(), out_s(930), 0.35)           # "Confirmar reserva"
place(sfx, pop(1100), ins_s(30), 0.3)
place(sfx, pop(1300), ins_s(40), 0.3)
place(sfx, pop(1100), ins_s(122), 0.3)
place(sfx, pop(1300), ins_s(132), 0.3)
place(sfx, click(), ins_s(141), 0.4)
place(sfx, success(), ins_s(148), 0.3)
place(sfx, ding(), out_s(1288), 0.2)  # WhatsApp quick reply

left = bed_l * 0.55 + sfx
right = bed_r * 0.55 + sfx

mix = np.stack([left, right], axis=1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 0.89 / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)

with wave.open("public/v12/audio.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{DURATION:.2f}s -> public/v12/audio.wav")
