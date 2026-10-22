"""Synthesizes the FITCO closing sound (sonic logo) in sync with src/Closing.

Run: python3 scripts/closing_sound.py  ->  public/closing/sound.wav
Event times are frames at 30 fps and must match src/Closing/index.tsx.
"""
import wave

import numpy as np

SR = 48000
FPS = 30
DURATION = 4.0
rng = np.random.default_rng(7)


def t_of(frame):
    return frame / FPS


def env_exp(n, decay):
    return np.exp(-np.arange(n) / SR / decay)


def place(buf, sig, start_s, gain=1.0):
    i = int(start_s * SR)
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i] * gain


def whoosh(length, f0, f1):
    """Noise through a swept one-pole low-pass, minus a slower one (band-pass)."""
    n = int(length * SR)
    noise = rng.standard_normal(n)
    cut = np.geomspace(f0, f1, n)
    a = np.exp(-2 * np.pi * cut / SR)
    b = np.exp(-2 * np.pi * (cut / 4) / SR)
    y1 = np.zeros(n)
    y2 = np.zeros(n)
    s1 = s2 = 0.0
    for i in range(n):
        s1 = (1 - a[i]) * noise[i] + a[i] * s1
        s2 = (1 - b[i]) * noise[i] + b[i] * s2
        y1[i] = s1
        y2[i] = s2
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return (y1 - y2) * shape


def impact(length=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    freq = 45 + 90 * np.exp(-t / 0.05)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * env_exp(n, 0.12)
    click = rng.standard_normal(n) * env_exp(n, 0.004) * 0.3
    return body + click


def tick(freq, length=0.09):
    n = int(length * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)) * env_exp(n, 0.02)


def bell(freq, length=2.4):
    """FM bell: inharmonic ratio gives the glassy, recognisable timbre."""
    n = int(length * SR)
    t = np.arange(n) / SR
    index = 3.0 * env_exp(n, 0.25)
    mod = np.sin(2 * np.pi * freq * 1.4 * t) * index
    attack = np.minimum(1, t / 0.004)
    return np.sin(2 * np.pi * freq * t + mod) * env_exp(n, 0.7) * attack


def pad(freqs, length=2.3):
    n = int(length * SR)
    t = np.arange(n) / SR
    sig = sum(np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2.01 * t) for f in freqs)
    shape = np.minimum(1, t / 0.25) * env_exp(n, 0.9)
    return sig * shape / len(freqs)


def reverb(x, seconds=1.6, mix=0.3):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * env_exp(n, seconds / 5)
    ir[0] = 0
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    wet *= np.max(np.abs(x)) / (np.max(np.abs(wet)) + 1e-9)
    return x * (1 - mix) + wet * mix


def main():
    total = int(DURATION * SR)
    left = np.zeros(total)
    right = np.zeros(total)

    def both(sig, start, gain, pan=0.0):
        """pan: -1 left .. 1 right."""
        place(left, sig, start, gain * min(1.0, 1 - pan))
        place(right, sig, start, gain * min(1.0, 1 + pan))

    # Icon spins in (frames 0-10), lands with a soft thump.
    both(whoosh(0.4, 300, 6000), 0.0, 0.5)
    both(impact(), t_of(9), 0.6)
    # Wordmark reveal (slide starts at frame 16).
    both(whoosh(0.3, 2500, 400), t_of(15), 0.35, pan=0.4)
    # One tick per tagline word, rising.
    words = [26, 29, 32, 36, 39, 42]
    notes = [1175, 1319, 1480, 1760, 1976, 2349]
    for i, (f, hz) in enumerate(zip(words, notes)):
        both(tick(hz), t_of(f), 0.12, pan=(-0.3 if i % 2 else 0.3))
    # Signature chime with the logo shine (frame 52): staggered D-major add9.
    chime_start = t_of(52)
    for k, (hz, pan) in enumerate([(587.3, -0.2), (880.0, 0.2), (1318.5, -0.35), (1480.0, 0.35)]):
        both(bell(hz), chime_start + k * 0.045, 0.32, pan=pan)
    both(pad([293.7, 440.0]), chime_start, 0.22)

    stereo = np.stack([reverb(left), reverb(right)], axis=1)
    fade = int(0.35 * SR)
    stereo[-fade:] *= np.linspace(1, 0, fade)[:, None]
    stereo *= 0.89 / np.max(np.abs(stereo))  # about -1 dBFS peak

    pcm = (stereo * 32767).astype("<i2")
    with wave.open("public/closing/sound.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
