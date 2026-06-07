#!/usr/bin/env python3
"""
make-depth-map.py — generate a depth map for the DepthParallax component.

Modern single-photo 2.5D parallax = ONE photo + ONE grayscale depth map, displaced
per-pixel in a WebGL shader (see src/components/guides/DepthParallax.astro). No
layer cutting, no inpainting, so none of the layer artifacts (fans/ghosts/holes).

This writes two static files into public/ (served as plain files, used directly by
the shader and the <img> fallback):
  scene.jpg   the photo (downscaled master)
  depth.png   grayscale depth: BRIGHT = near, DARK = far (Depth Anything V2)

Usage:
  python3 tools/make-depth-map.py <source.jpg> <public_out_dir> \
      [--photo 2000] [--depth 1280]

Deps (one-time):  pip3 install torch torchvision transformers pillow numpy
First run downloads the Depth Anything V2 Small model (~100 MB), then it's cached.
"""
import argparse, os
import numpy as np
from PIL import Image, ImageFilter
from transformers import pipeline


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("out_dir")
    ap.add_argument("--photo", type=int, default=2000, help="photo master width")
    ap.add_argument("--depth", type=int, default=1280, help="depth map width (depth is low-freq; small is fine)")
    args = ap.parse_args()
    out = args.out_dir.rstrip("/") + "/"
    os.makedirs(out, exist_ok=True)

    img = Image.open(args.source).convert("RGB")

    # Photo master for the WebGL texture + the static <img> fallback.
    pw = args.photo
    photo = img.resize((pw, round(img.height * pw / img.width)), Image.LANCZOS)
    photo.save(out + "scene.jpg", quality=84)

    # Depth Anything V2 (small) → relative depth (larger = nearer).
    pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")
    d = np.asarray(pipe(photo)["depth"]).astype(np.float32)
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)  # normalize 0..1

    dimg = Image.fromarray((d * 255).astype(np.uint8))
    dw = args.depth
    dimg = dimg.resize((dw, round(dimg.height * dw / dimg.width)), Image.LANCZOS)
    dimg = dimg.filter(ImageFilter.GaussianBlur(5))  # soften depth cliffs so the shader warps gradually instead of tearing at edges
    dimg.save(out + "depth.png")

    for f in ("scene.jpg", "depth.png"):
        print(f, round(os.path.getsize(out + f) / 1024), "KB", Image.open(out + f).size)


if __name__ == "__main__":
    main()
