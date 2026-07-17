# Parkfolk figures (web copies)

Copied from `brand/crowd-figures/` (lanyard-docs), which is GENERATED from
`CrowdFigures.swift` by `tools/dump-shape-svgs.py` — the Swift is the source
of truth. Re-copy after any figure change lands.

Embedding: the SVGs carry TRUE proportions inside the unit-square viewBox
(figure centered, dominant axis fills 0-1), so render each in a SQUARE box
sized by the app registry relHeight only. Do NOT stretch width by the
registry aspect value — that double-applies it and squishes the figures
(earned 2026-07-16). See CrowdPlaza.astro.
