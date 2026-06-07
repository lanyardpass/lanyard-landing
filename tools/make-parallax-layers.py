#!/usr/bin/env python3
"""
make-parallax-layers.py — split one photo into depth planes for LayeredParallax.

DEFAULT (robust, what we ship): TWO planes from a single photo —
  foreground = the whole scene with the SKY removed (subject + everything), SHARP
  sky        = a SHARP sky plane that fills behind it
The foreground parallaxes against the sky. Nothing is duplicated or painted out,
so there is no ghost and no fill that can be uncovered.

Pipeline rules (see docs/guide-image-pipeline.md for the why):
  • Work at HIGH resolution; downscale ONCE at the very end (Lanczos).
  • The sky plane is what the reader SEES, so keep it SHARP (never blur it).
  • The sky mask must protect tall foreground (a mountain/spire, or even a blue
    statue): a TIGHT "clearly blue" threshold, kept to blobs connected to the TOP
    edge, so it cannot bleed into the subject.
  • Save LOSSLESS webp masters; astro:assets does the single delivery compression.

Why no separate "subject" (front) plane by default:
  Cutting the subject out and moving it at a different rate than the foreground
  UNCOVERS whatever fills the hole behind it. A single photo has no real "behind
  the subject", and an auto-fill (distance-transform / nearest-pixel) shows up as
  radial "fan" smears the moment the planes separate. Only add a front plane when
  you have a genuinely plausible background behind the subject (hand- or
  AI-inpainted). Then pass it to LayeredParallax's optional `front` prop.

Usage:
  python3 tools/make-parallax-layers.py <source.jpg> <out_dir> [--work 2600] [--master 2200]

Deps (one-time):  pip3 install scipy pillow numpy
"""
import argparse, os
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import label, binary_closing, binary_opening, distance_transform_edt


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("out_dir")
    ap.add_argument("--work", type=int, default=2600, help="processing width (high)")
    ap.add_argument("--master", type=int, default=2200, help="final committed width")
    args = ap.parse_args()
    out = args.out_dir.rstrip("/") + "/"
    os.makedirs(out, exist_ok=True)

    # Load original, work at a high resolution (NOT a pre-shrunk copy).
    orig = Image.open(args.source).convert("RGB")
    h = round(orig.height * args.work / orig.width)
    work = orig.resize((args.work, h), Image.LANCZOS)
    a = np.asarray(work).astype(np.int16)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]

    # SKY MASK — clearly-blue, connected to the top edge. Connectivity-from-top is
    # what protects the rock spire AND the blue statues (they aren't connected to
    # the top sky), so they stay in the foreground.
    sky = (B > 135) & (B > R + 18) & (B > G + 6)
    sky = binary_opening(sky, iterations=2)
    lab, _ = label(sky)
    top = set(np.unique(lab[0:4, :])); top.discard(0)
    sky = np.isin(lab, list(top))
    sky = binary_closing(sky, iterations=4)
    skyA = np.asarray(
        Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    ).astype(np.float32) / 255.0

    # FOREGROUND: full scene, sky transparent. SHARP. (No cutout, no fill.)
    fg = np.dstack([np.asarray(work), (1.0 - skyA) * 255]).astype(np.uint8)

    # SKY plane: real sky, with non-sky filled by nearest sky (only ever revealed
    # at the top, where it's real sky). SHARP, no blur.
    sidx = distance_transform_edt(~(skyA > 0.5), return_distances=False, return_indices=True)
    skyplane = np.asarray(work)[sidx[0], sidx[1]]

    # Downscale ONCE to master width; save LOSSLESS webp masters.
    mw = args.master
    def down(im):
        return im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)

    down(Image.fromarray(skyplane)).save(out + "sky.webp", lossless=True, method=6)
    down(Image.fromarray(fg)).save(out + "foreground.webp", lossless=True, method=6)
    for f in ("sky.webp", "foreground.webp"):
        print(f, round(os.path.getsize(out + f) / 1024), "KB")


if __name__ == "__main__":
    main()
