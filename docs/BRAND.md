# Vial Foundry — Brand Implementation

The approved Brand Identity & Visual System board is the visual source of truth.
This identity is **closed**: do not explore alternate marks, reinterpret the VF
monogram, or invent another palette.

---

## Descriptor

The supplied board carries the descriptor **RESEARCH MATERIALS**. That wording is
**not approved for customer-facing use**. Everywhere the descriptor appears as a
brand element it reads **RESEARCH PEPTIDES**.

Lowercase "research materials" inside legal and explanatory prose
(`src/data/legal.ts`, `src/data/articles.ts`) is technically correct language and
has deliberately been left alone. It is never presented as the brand tagline.

---

## Monogram provenance — read this before touching the mark

**No vector artwork was ever supplied.** The only approved source is a raster
board (1448 × 1086), on which the VF monogram occupies roughly **157 × 132 px**.
That is too small to produce a sharp 512 px app icon and cannot be used for
thermal label printing.

With the owner's explicit authorisation, the monogram was **rebuilt as clean
vector geometry** from the artwork:

1. The mark's exact bounding box was located in the board by alpha-trim.
2. Every edge was measured by scanline extraction (horizontal and vertical runs
   at 8× supersampling), which recovers the true vertices of what is an almost
   entirely straight-edged, geometric mark.
3. The reconstruction was rasterised and scored against the source artwork.

**Fidelity: IoU 0.976**, with the residual split evenly between both directions
(1.08 % missing / 1.35 % extra) — the signature of sub-pixel anti-aliasing
boundary, not of structural error.

The authored geometry lives in exactly two places and must stay in sync:

- `scripts/brand/generate-brand-assets.py` (`MARK_V` / `MARK_F`)
- `src/components/BrandLogo.tsx` (same two paths, inlined so the mark can
  inherit `currentColor`)

> If real vector artwork ever arrives, it supersedes this reconstruction.
> Drop it in, update the scripts, and regenerate.

---

## Typography

| Role | Face | Notes |
|---|---|---|
| Wordmark | Cormorant Garamond 700 (OFL) | Emitted as **outlines** in the SVG lockups, never as live text — the lockups render identically everywhere and never depend on a webfont |
| Descriptor / headings | Montserrat (OFL) | The board's stated supporting typeface |
| Body | Inter | Chosen for readability: 16 px mobile, 17 px ≥1024 px |
| Technical identifiers | JetBrains Mono | Lot, SKU, CAS, MW only — **not** prices, not prose |

The board describes the wordmark as "custom", so an exact match is not
achievable without the original file. Cormorant Garamond 700 was selected by
rendering candidates against the board and comparing weight and contrast.

---

## Palette

Defined once in `src/index.css` as the source of truth, then mapped to semantic
roles. Components use semantic names only — never raw hex.

| Token | Value | Role |
|---|---|---|
| `--brand-midnight` | `#0F2740` | Authority, primary CTA, footer. Dominant with white. |
| `--brand-teal` | `#2F9E9A` | **Accent only** — links, small highlights, selected states |
| `--brand-slate` | `#6B8FA1` | Secondary information |
| `--brand-mist` | `#C9D6DD` | Borders, dividers |
| `--brand-cloud` | `#F4F7F9` | Dominant page surface |

Legacy token names (`--brand-ink`, `--brand-canvas`, `--brand-steel`, …) are kept
as aliases onto the approved palette so ~900 existing component usages inherit it
without churn.

Status colours (`--brand-success`, `--brand-warning`, `--brand-danger`) are
deliberately **not** brand colours, so a warning never reads as an accent.

---

## Regenerating assets

Requires Python 3 with `fonttools`, `Pillow`, `numpy`, `scipy`, plus ImageMagick.

```bash
python scripts/brand/generate-brand-assets.py    # logos, app icon, pattern
python scripts/brand/generate-product-images.py  # 20 products, hero, OG image
```

Favicons are derived from `public/brand/app-icon.svg`:

```bash
for n in 16 32 48 180 192 512; do
  magick -background none public/brand/app-icon.svg -resize ${n}x${n} -strip PNG32:public/brand/icon-${n}.png
done
magick public/brand/icon-16.png public/brand/icon-32.png public/brand/icon-48.png -colors 256 public/favicon.ico
```

### Product imagery

Product images are **not drawn**. `scripts/brand/generate-product-images.py`
prints one reusable approved label composition onto the supplied *photographic*
vial (real glass, aluminium crimp, real reflections and shadow).

The supplied cutout `vial-transparent.png` had a transparency checkerboard baked
into both its RGB and alpha channels. `scripts/brand/clean-vial-base.py` keys it
out by connected-component analysis and produces `vial-base.png`, which is the
actual compositing base.

Labels carry only: the VF mark, the wordmark, the descriptor, product name, mg
size, presentation, CAS number, catalogue number, storage, and the research-use
bar. **No purity values, lot results, certifications or testing claims** — those
are lot-specific and belong on a certificate, never on artwork.

---

## Asset inventory

| File | Use |
|---|---|
| `logo-horizontal.svg` | Primary lockup — navbar, email, general |
| `logo-stacked.svg` | Secondary lockup |
| `logo-stacked-white.svg` | Reversed stacked — age gate |
| `logo-white.svg` | Reversed horizontal — footer, dark sections |
| `logo-black.svg` | One-colour, thermal-print safe. **No gradients.** |
| `logo-mark.svg` | Monogram alone (`currentColor`) |
| `app-icon.svg` | Monogram on Midnight, rounded — favicon/app-icon source |
| `og-image.png` | 1200 × 630 social card |
| `logo-email.png` / `-dark.png` | Raster lockups for email clients |
| `pattern.svg` | Sparse VF-derived field. Use **very** sparingly. |

There is one canonical brand implementation: `src/components/BrandLogo.tsx`.
Never re-create the logo or wordmark in another component.
