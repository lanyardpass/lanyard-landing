#!/usr/bin/env python3
"""
make-parallax-layers.py — split one photo into depth planes for LayeredParallax.

Produces three layers from a single source image:
  front   = the salient subject (e.g. statues), crisp cutout with alpha matting
  village = everything else, sky removed, subject painted out behind it
  sky     = a SHARP sky plane that fills behind everything

Pipeline rules (see docs/guide-image-pipeline.md for the why):
  • Work at HIGH resolution; downscale ONCE at the very end (Lanczos).
  • The cutout edge is gated by the model, not the pixel count (rembg/u2net work
    at 320px internally). Crisp edges come from isnet-general-use + alpha matting,
    not from feeding more pixels.
  • The sky plane is what the reader actually SEES, so keep it SHARP (never blur).
  • The sky mask must protect tall foreground (a mountain/spire): tight "clearly
    blue" threshold, kept to blobs connected to the TOP edge, so it cannot bleed
    into the hazy top of the subject.
  • Subject is painted out of the background by a distance-transform fill (nearest
    real pixel), so a moving plane never reveals a hole or a blurred-subject ghost.
  • Save LOSSLESS webp masters; astro:assets does the single delivery compression.

Usage:
  python3 tools/make-parallax-layers.py <source.jpg> <out_dir> [--work 2600] [--master 2200]

Deps (one-time):  pip3 install "rembg[cpu]" pymatting scipy pillow numpy
"""
import argparse, os
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import label, binary_closing, binary_opening, binary_dilation, distance_transform_edt
from rembg import remove, new_session


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("out_dir")
    ap.add_argument("--work", type=int, default=2600, help="processing width (high)")
    ap.add_argument("--master", type=int, default=2200, help="final committed width")
    args = ap.parse_args()
    os.makedirs(args.out_dir, exist_ok=True)
    out = args.out_dir.rstrip("/") + "/"

    # Load original, work at a high resolution (NOT a pre-shrunk copy).
    orig = Image.open(args.source).convert("RGB")
    h = round(orig.height * args.work / orig.width)
    work = orig.resize((args.work, h), Image.LANCZOS)

    # FRONT — salient subject, crisp via isnet + alpha matting.
    sess = new_session("isnet-general-use")
    front = remove(
        work, session=sess, alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=12,
        alpha_matting_erode_size=8,
    )

    a = np.asarray(work).astype(np.int16)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]

    # SKY MASK — clearly-blue, connected to the top edge (protects tall subjects).
    sky = (B > 135) & (B > R + 18) & (B > G + 6)
    sky = binary_opening(sky, iterations=2)
    lab, _ = label(sky)
    top = set(np.unique(lab[0:4, :])); top.discard(0)
    sky = np.isin(lab, list(top))
    sky = binary_closing(sky, iterations=4)
    skyA = np.asarray(
        Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    ).astype(np.float32) / 255.0

    # Paint the subject OUT of the scene (nearest-real-pixel fill).
    statue = binary_dilation(np.asarray(front.split()[3]) > 20, iterations=5)
    idx = distance_transform_edt(statue, return_distances=False, return_indices=True)
    scene = np.asarray(work)[idx[0], idx[1]]

    # VILLAGE (mid): scene with subject painted out, sky transparent. SHARP.
    village = np.dstack([scene, (1.0 - skyA) * 255]).astype(np.uint8)

    # SKY plane (back): real sky, non-sky filled by nearest sky. SHARP, no blur.
    sidx = distance_transform_edt(~(skyA > 0.5), return_distances=False, return_indices=True)
    skyplane = np.asarray(work)[sidx[0], sidx[1]]

    # Downscale ONCE to master width; save LOSSLESS webp masters.
    mw = args.master
    def down(im):
        return im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)

    down(Image.fromarray(skyplane)).save(out + "sky.webp", lossless=True, method=6)
    down(Image.fromarray(village)).save(out + "village.webp", lossless=True, method=6)
    down(front).save(out + "front.webp", lossless=True, method=6)
    for f in ("sky.webp", "village.webp", "front.webp"):
        print(f, round(os.path.getsize(out + f) / 1024), "KB")


if __name__ == "__main__":
    main()
