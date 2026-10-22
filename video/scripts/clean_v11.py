"""Erases the copy that changes in v12 from the v11 reel render.

Each patch is refilled with a Coons (bilinearly blended boundary) interpolation
of the surrounding pixels, which matches the soft gradient background to within
~1 level. New copy is drawn on top in src/FitcoReelV12.

Run: python3 scripts/clean_v11.py <v11.mp4>  ->  public/v12/base.mp4
Frame numbers are 30 fps frames of the v11 render.
"""
import subprocess
import sys

import numpy as np

from coons import coons

W, H = 1080, 1920
FULL = (4, 1076)

# (y0, y1, x0, x1, first_frame, last_frame)
PATCHES = [
    (255, 645, *FULL, 102, 262),  # "Tus alumnos creen que..." + "No lo son."
    (255, 525, *FULL, 263, 353),  # "Y esa confusión te está costando tiempo."
    (885, 1140, 195, 988, 421, 499),  # bubble "¿Por qué no puedo comprar...?"
    (255, 745, *FULL, 669, 833),  # "La WEB es para / Comprar / Membresías..."
    (255, 755, *FULL, 834, 1013),  # "La APP es para / Reservar / Yoga..."
    (255, 705, *FULL, 1014, 1127),  # "Primero compran en la web..."
    (255, 550, *FULL, 1346, 1445),  # "Canales claros = ..."
]

# Where blurred transitions would make a Coons fill smear, the region is
# instead copied from a (cleaned) frame of the same shot where it is empty.
# (y0, y1, x0, x1, first_frame, last_frame, plate_frame)
PLATES = [
    (1185, 1295, 188, 420, 1014, 1127, 1052),  # step label "Compra"
    (1340, 1450, 800, 1040, 1014, 1127, 1052),  # step label "Reserva"
    (255, 550, *FULL, 1341, 1345, 1350),  # "Canales claros" fading in over the tips
]


def read_frame(src, n):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", src, "-vf", f"select=eq(n\\,{n})", "-frames:v", "1",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE, check=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3)


def patch(frame, i):
    active = [p for p in PATCHES if p[4] <= i <= p[5]]
    if not active:
        return frame
    f = frame.astype(np.float32)
    for y0, y1, x0, x1, _, _ in active:
        f[y0:y1, x0:x1] = coons(f, y0, y1, x0, x1)
    return np.clip(f + 0.5, 0, 255).astype(np.uint8)


def main(src, dst):
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", "30", "-i", "-", "-c:v", "libx264", "-crf", "12",
         "-preset", "slow", "-pix_fmt", "yuv420p", dst],
        stdin=subprocess.PIPE,
    )
    plates = {n: patch(read_frame(src, n), n) for n in {p[6] for p in PLATES}}
    i = 0
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        frame = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        frame = patch(frame, i)
        for y0, y1, x0, x1, a, z, n in PLATES:
            if a <= i <= z and i != n:
                frame = frame.copy()
                frame[y0:y1, x0:x1] = plates[n][y0:y1, x0:x1]
        enc.stdin.write(frame.tobytes())
        i += 1
    enc.stdin.close()
    enc.wait()
    print(f"{i} frames -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "public/v12/base.mp4")
