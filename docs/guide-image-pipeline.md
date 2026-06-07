# Guide image pipeline (landing site)

How images get prepared for `/guides`. Two kinds: **stills** (most images) and
**layered-depth banners** (the parallax effect). This is the *web* pipeline; the
app's collectible/perk image rules live in the workspace `docs/IMAGE_PIPELINE.md`.

---

## Golden rules (both kinds)

1. **Process at the highest resolution you have. Downscale exactly once, last.**
   Every downscale is lossy, so never run masking / inpainting / compositing on
   an already-shrunk copy. Do the work big, shrink at the end with Lanczos.
2. **Compress once.** Commit a **lossless** (or near-lossless) master and let
   `astro:assets` do the single delivery compression to webp/avif. Don't ship a
   lossy master that Astro then re-compresses (double loss).
3. **Commit masters at the largest size you'd ever serve, not the raw original.**
   Full-bleed banner master ≈ 2200px; in-column ≈ 1600px. The ~350 MB Inbox
   originals never get committed; only the derived masters do.
4. **`astro:assets` (`<Image>`/`<Picture>`) generates the responsive widths**
   from the master; the Netlify edge image service serves per-device sizes.

---

## Stills

Use `astro:assets`. Put the master under `src/assets/guides/<guide>/`, import it,
render via `<Image>` (or the `Figure` component). To prep a master from a big
original, a single Lanczos downscale is all you need:

```js
sharp(original).rotate()                       // honor EXIF orientation
  .resize({ width: 2200, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })        // or .webp({ quality: 90 })
  .toFile(out)
```

`.rotate()` with no args auto-orients from EXIF (this is how `IMG_4418` got
straightened). Never upscale.

---

## Depth-parallax banners (`DepthParallax`)

The Isle-of-Berk effect: one photo given real 2.5D depth. This is the **modern,
artifact-proof** way (2024+ standard) and it replaced an earlier hand-cut-layers
approach that fought endless fill artifacts.

**How it works:** one photo + one grayscale **depth map**, displaced per-pixel in
a tiny raw-WebGL fragment shader. Because depth is *continuous*, there are no
layer boundaries to expose, so the layer failure modes (fans / ghosts / holes)
**cannot happen**. Near pixels (bright depth) shift more than far pixels (dark
depth), driven by scroll plus a subtle pointer parallax on desktop.

It's a client-side effect (runs in the visitor's browser on their GPU); nothing
server-side. Raw WebGL, no Three.js, ~a few KB of script. Falls back to a static
`<img>` under no-WebGL / `prefers-reduced-motion` / data-saver.

### Generate the assets

```
pip3 install torch torchvision transformers pillow numpy     # one-time
python3 tools/make-depth-map.py \
  "Inbox/Epic Guide Photos/IMG_4407.jpeg" \
  public/guides/epic/berk
```

First run downloads Depth Anything V2 Small (~100 MB, then cached). It writes two
**static files into `public/`** (served as plain files, loaded directly by the
shader and the fallback):

| File | What it is |
|---|---|
| `scene.jpg` | the photo (downscaled master, ~2000px) |
| `depth.png` | grayscale depth — **bright = near, dark = far** |

Sanity-check `depth.png` by eye: the nearest things should be brightest, the sky
black. (No browser depth-generator on hand? Free no-signup web tools like
Upsampler or Depthy also produce a usable map.)

### Wire it in

```mdx
<DepthParallax
  src="/guides/epic/berk/scene.jpg"
  depth="/guides/epic/berk/depth.png"
  alt="…" caption="…" wide
/>
```

### Notes / tuning

- Strength is a few constants in `src/components/guides/DepthParallax.astro`: the
  scroll amplitude (`ty = scroll * 0.028 …`), pointer amplitudes, the depth pivot
  (`d - 0.4`, the "still" plane), and `uZoom` (the margin that hides edge
  displacement). Bigger amplitudes = more depth but more edge stretch at sharp
  depth discontinuities, so keep it subtle.
- The depth map is low-frequency, so a small one (1280px) is plenty and keeps the
  banner light.
- The hero stays a still (depth parallax is below the fold) so it never hurts LCP.

(The previous `LayeredParallax` component cut the photo into masked planes; it was
removed because separating a subject from a single photo always exposes an
unfillable hole. Depth displacement avoids that entirely.)
