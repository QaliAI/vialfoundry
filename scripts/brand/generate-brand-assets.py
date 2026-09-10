# -*- coding: utf-8 -*-
"""Generate the approved Vial Foundry brand assets.

The VF monogram geometry below is a vector reconstruction of the approved
Brand Identity & Visual System board, measured directly from the artwork
(scanline edge extraction) and validated at IoU 0.976 against the source.
See docs/BRAND.md for provenance.

Wordmark:   Cormorant Garamond 700 (OFL) - matches the board's high-contrast serif
Descriptor: Montserrat 500 (OFL)         - the board's stated supporting typeface

All type is emitted as outlines so the lockups render identically everywhere
and never depend on a webfont being present.

Run:  python scripts/brand/generate-brand-assets.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import text_path, load  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "..", "public", "brand"))
SERIF = os.path.join(HERE, "CormorantGaramond.ttf")
SANS = os.path.join(HERE, "Montserrat.ttf")

# ---------------------------------------------------------------- palette
MIDNIGHT = "#0F2740"
TEAL = "#2F9E9A"
SLATE = "#6B8FA1"
MIST = "#C9D6DD"
CLOUD = "#F4F7F9"
WHITE = "#FFFFFF"

WORDMARK = "VIAL FOUNDRY"
DESCRIPTOR = "RESEARCH PEPTIDES"

# ---------------------------------------------------------------- monogram
# Authored in a 1000 x 841 box (the approved mark's 157:132 aspect ratio).
MARK_W, MARK_H = 1000.0, 841.0

MARK_V = (
    "M5 0L257 0L232 37.8L409 475.9L409 819.8L405 829L83 84.1Q56 42 5 0Z"
)
MARK_F = (
    "M680 0L1000 0L942 121.9L648 121.9L600 161.4L570 227L886 227"
    "L828 349.8L672 350.6L660 369.9L660 724.7"
    "C660 769.3 618 840.8 556 840.8C496 840.8 452 812.2 452 733.2"
    "L452 417L527 417L527 438.9L481 475.9L481 728.1"
    "A47 39.5 0 0 0 575 728.1"
    "L575 458.2C576 424.6 589 401.9 600 393.5L600 380.1"
    "C599 371.6 597 367.4 594 366.6L458 363.2L630 21Z"
)


def mark_group(x, y, height, fill):
    """Place the monogram with its top-left at (x, y) at the given height."""
    s = height / MARK_H
    return (
        f'<g transform="translate({x:.3f} {y:.3f}) scale({s:.6f})" fill="{fill}">'
        f'<path d="{MARK_V}"/><path d="{MARK_F}"/></g>'
    )


def mark_width(height):
    return height * MARK_W / MARK_H


# ---------------------------------------------------------------- type metrics
def cap_height(font_path, wght):
    f = load(font_path, wght)
    upm = f["head"].unitsPerEm
    try:
        ch = f["OS/2"].sCapHeight
    except (KeyError, AttributeError):
        ch = int(upm * 0.7)
    return ch / upm


SERIF_CAP = cap_height(SERIF, 700)
SANS_CAP = cap_height(SANS, 500)


def fit_tracking(font_path, wght, text, size, target_w, lo=0.0, hi=1.2):
    """Solve letter-spacing (em) so the string renders at target_w."""
    for _ in range(60):
        mid = (lo + hi) / 2
        w = text_path(font_path, wght, text, size, mid)[1]
        if w < target_w:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def svg(width, height, body, bg=None):
    rect = f'<rect width="{width}" height="{height}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} {height:.2f}" '
        f'width="{width:.2f}" height="{height:.2f}" role="img" '
        f'aria-label="Vial Foundry - Research Peptides">'
        f"{rect}{body}</svg>\n"
    )


def write(name, content):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  {name}  ({len(content):,} bytes)")


# ---------------------------------------------------------------- lockups
def horizontal(ink, sub_ink, rule_ink, filename, bg=None, pad=0.0):
    """Primary lockup: mark | rule | VIAL FOUNDRY / RESEARCH PEPTIDES.

    Proportions are taken from panel 01 of the approved board, normalised so
    the monogram is 100 units tall.
    """
    mh = 100.0
    mw = mark_width(mh)                    # 118.94
    rule_x = mw + 31.0
    text_x = rule_x + 29.0

    wm_size = 37.0 / SERIF_CAP             # cap height 37
    wm_d, wm_w = text_path(SERIF, 700, WORDMARK, wm_size, 0.105, text_x, 65.0)

    sub_size = 9.3 / SANS_CAP
    sub_track = fit_tracking(SANS, 500, DESCRIPTOR, sub_size, wm_w)
    sub_d, _ = text_path(SANS, 500, DESCRIPTOR, sub_size, sub_track, text_x, 85.0)

    w = text_x + wm_w + pad
    h = mh
    body = (
        mark_group(0, 0, mh, ink)
        + f'<rect x="{rule_x:.2f}" y="6" width="1.6" height="88" fill="{rule_ink}"/>'
        + f'<path d="{wm_d}" fill="{ink}"/>'
        + f'<path d="{sub_d}" fill="{sub_ink}"/>'
    )
    write(filename, svg(w + pad, h, body, bg))
    return w


def stacked(ink, sub_ink, filename, bg=None):
    """Secondary lockup: mark centred above the wordmark (board panel 02)."""
    mh = 118.0
    mw = mark_width(mh)

    wm_size = 40.0 / SERIF_CAP
    wm_d0, wm_w = text_path(SERIF, 700, WORDMARK, wm_size, 0.105, 0, 0)

    sub_size = 10.0 / SANS_CAP
    sub_track = fit_tracking(SANS, 500, DESCRIPTOR, sub_size, wm_w)
    sub_d0, sub_w = text_path(SANS, 500, DESCRIPTOR, sub_size, sub_track, 0, 0)

    w = wm_w
    wm_d, _ = text_path(SERIF, 700, WORDMARK, wm_size, 0.105, 0.0, 186.0)
    sub_d, _ = text_path(SANS, 500, DESCRIPTOR, sub_size, sub_track, 0.0, 212.0)

    body = (
        mark_group((w - mw) / 2.0, 0, mh, ink)
        + f'<path d="{wm_d}" fill="{ink}"/>'
        + f'<path d="{sub_d}" fill="{sub_ink}"/>'
    )
    write(filename, svg(w, 222.0, body, bg))


def mark_only(ink, filename, bg=None, box=False):
    if box:
        # App-icon style: mark centred in a Midnight square with clear space.
        size = 512.0
        mh = 268.0
        mw = mark_width(mh)
        body = (
            f'<rect width="{size}" height="{size}" rx="112" fill="{MIDNIGHT}"/>'
            + mark_group((size - mw) / 2.0, (size - mh) / 2.0, mh, WHITE)
        )
        write(filename, svg(size, size, body))
        return
    write(filename, svg(MARK_W, MARK_H,
                        f'<path d="{MARK_V}" fill="{ink}"/><path d="{MARK_F}" fill="{ink}"/>', bg))


def pattern():
    """Board panel 08: a sparse field derived from the monogram's V stroke."""
    tile = 240.0
    stroke = (
        f'<g fill="{MIST}" opacity="0.55">'
        f'<g transform="translate(18 26) scale(0.115)"><path d="{MARK_V}"/></g>'
        f'<g transform="translate(138 146) scale(0.115)"><path d="{MARK_V}"/></g>'
        f"</g>"
    )
    body = (
        f'<defs><pattern id="vf-pattern" width="{tile}" height="{tile}" '
        f'patternUnits="userSpaceOnUse">{stroke}</pattern></defs>'
        f'<rect width="{tile}" height="{tile}" fill="url(#vf-pattern)"/>'
    )
    write("pattern.svg", svg(tile, tile, body))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print(f"Vial Foundry brand assets -> {OUT}")

    horizontal(MIDNIGHT, SLATE, MIST, "logo-horizontal.svg")
    horizontal(WHITE, MIST, "#3A5670", "logo-white.svg")               # reversed
    horizontal("#000000", "#000000", "#000000", "logo-black.svg")     # thermal / one-colour
    stacked(MIDNIGHT, SLATE, "logo-stacked.svg")
    stacked(WHITE, MIST, "logo-stacked-white.svg")
    mark_only("currentColor", "logo-mark.svg")
    mark_only(WHITE, "app-icon.svg", box=True)
    pattern()
    print("done.")
