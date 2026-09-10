# -*- coding: utf-8 -*-
"""Compose Vial Foundry product images from the real photographic vial base.

This does NOT draw a vial. It takes the supplied photographic vial
(public/assets/vials/vial-base.png - real glass, aluminium crimp,
real reflections and shadow) and prints one reusable approved label
composition onto its blank label panel.

Label hierarchy (approved board + brand brief):
    VF mark
    VIAL FOUNDRY
    RESEARCH PEPTIDES
    ----------------
    PRODUCT NAME
    XX MG
    presentation
    CAS / catalogue number
    FOR RESEARCH USE ONLY

No purity values, lot results, certifications or testing claims are printed -
those are lot-specific and belong on a certificate, never on artwork.

Run:  python scripts/brand/generate-product-images.py
"""
import os
import re
import sys
import tempfile

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import text_path, load  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BASE = os.path.join(ROOT, "public", "assets", "vials", "vial-base.png")
OUT = os.path.join(ROOT, "public", "assets", "vials", "products")
SERIF = os.path.join(HERE, "CormorantGaramond.ttf")
SANS = os.path.join(HERE, "Montserrat.ttf")

MIDNIGHT = "#0F2740"
TEAL = "#2F9E9A"
SLATE = "#6B8FA1"
MIST = "#C9D6DD"

# Label panel on the photographic base, measured from the artwork.
LABEL_X, LABEL_Y, LABEL_W, LABEL_H = 417, 508, 416, 500
SS = 3  # label supersampling factor

MARK_W, MARK_H = 1000.0, 841.0
MARK_V = "M5 0L257 0L232 37.8L409 475.9L409 819.8L405 829L83 84.1Q56 42 5 0Z"
MARK_F = (
    "M680 0L1000 0L942 121.9L648 121.9L600 161.4L570 227L886 227"
    "L828 349.8L672 350.6L660 369.9L660 724.7"
    "C660 769.3 618 840.8 556 840.8C496 840.8 452 812.2 452 733.2"
    "L452 417L527 417L527 438.9L481 475.9L481 728.1"
    "A47 39.5 0 0 0 575 728.1"
    "L575 458.2C576 424.6 589 401.9 600 393.5L600 380.1"
    "C599 371.6 597 367.4 594 366.6L458 363.2L630 21Z"
)

PRODUCTS = [
    ("bpc-157", "BPC-157", "5 mg Lyophilized Vial", "137525-51-0", "VF-SKU-991"),
    ("tb-500", "TB-500", "10 mg Lyophilized Vial", "77591-33-4", "VF-SKU-992"),
    ("semaglutide", "SEMAGLUTIDE", "5 mg Lyophilized Vial", "910463-68-2", "VF-SKU-993"),
    ("tirzepatide", "TIRZEPATIDE", "10 mg Lyophilized Vial", "2023788-19-2", "VF-SKU-994"),
    ("retatrutide", "RETATRUTIDE", "10 mg Lyophilized Vial", "2381089-83-2", "VF-SKU-995"),
    ("cjc-1295", "CJC-1295", "5 mg Lyophilized Vial", "863288-34-0", "VF-SKU-996"),
    ("ipamorelin", "IPAMORELIN", "5 mg Lyophilized Vial", "170851-70-4", "VF-SKU-997"),
    ("nad-plus", "NAD+", "1000 mg Crystalline Powder", "53-84-9", "VF-SKU-998"),
    ("ghk-cu", "GHK-Cu", "50 mg Powder Vial", "49557-75-7", "VF-SKU-999"),
    ("bacteriostatic-water", "BACTERIOSTATIC WATER", "30 mL Sterile Diluent", "7732-18-5", "VF-SKU-1000"),
    ("sermorelin", "SERMORELIN", "5 mg Lyophilized Vial", "86168-78-7", "VF-SKU-1011"),
    ("tesamorelin", "TESAMORELIN", "5 mg Lyophilized Vial", "218949-48-5", "VF-SKU-1012"),
    ("pt-141", "PT-141", "10 mg Lyophilized Vial", "189691-06-3", "VF-SKU-1013"),
    ("selank", "SELANK", "10 mg Lyophilized Vial", "129954-34-3", "VF-SKU-1014"),
    ("semax", "SEMAX", "10 mg Lyophilized Vial", "80714-61-0", "VF-SKU-1015"),
    ("epithalon", "EPITHALON", "10 mg Lyophilized Vial", "307297-39-8", "VF-SKU-1016"),
    ("thymosin-alpha-1", "THYMOSIN ALPHA-1", "10 mg Lyophilized Vial", "62304-98-7", "VF-SKU-1017"),
    ("mots-c", "MOTS-c", "10 mg Lyophilized Vial", "1627580-64-6", "VF-SKU-1018"),
    ("aod-9604", "AOD-9604", "5 mg Lyophilized Vial", "221231-10-3", "VF-SKU-1019"),
    ("acetonitrile", "ACETONITRILE", "1 L HPLC Gradient Grade", "75-05-8", "VF-SKU-1020"),
]



def save_retry(img, path, attempts=6, **kw):
    """The repo lives under a sync-backed folder; writes occasionally race it."""
    import time
    for i in range(attempts):
        try:
            img.save(path, **kw)
            return
        except OSError:
            if i == attempts - 1:
                raise
            time.sleep(0.4 * (i + 1))


def cap_height(font_path, wght):
    f = load(font_path, wght)
    upm = f["head"].unitsPerEm
    try:
        return f["OS/2"].sCapHeight / upm
    except (KeyError, AttributeError):
        return 0.7


SERIF_CAP = cap_height(SERIF, 700)
SANS_CAP = cap_height(SANS, 500)
SANS_BOLD_CAP = cap_height(SANS, 700)


def centred(font, wght, text, cap, baseline, width, tracking=0.0, cap_ratio=None):
    """Return path data for `text` optically centred in `width`."""
    ratio = cap_ratio or (SANS_BOLD_CAP if wght >= 700 else SANS_CAP)
    size = cap / ratio
    w = text_path(font, wght, text, size, tracking)[1]
    return text_path(font, wght, text, size, tracking, (width - w) / 2.0, baseline)[0], w


def fit_centred(font, wght, text, cap, baseline, width, max_w, tracking=0.0, cap_ratio=None):
    """Same, but shrink the cap height until the string fits `max_w`."""
    while cap > 6:
        d, w = centred(font, wght, text, cap, baseline, width, tracking, cap_ratio)
        if w <= max_w:
            return d
        cap -= 1.0
    return d


def split_size(size_text):
    """'5 mg Lyophilized Vial' -> ('5 MG', 'LYOPHILIZED VIAL')."""
    m = re.match(r"^\s*([\d.]+)\s*(mg|mL|ml|L|g)\b\s*(.*)$", size_text)
    if not m:
        return size_text.upper(), ""
    return f"{m.group(1)} {m.group(2).upper()}", m.group(3).strip().upper()


def label_svg(title, size_text, cas, sku):
    W, H = float(LABEL_W), float(LABEL_H)
    inner = W - 56.0          # keep content off the cylinder's curved edges
    ox = 28.0
    qty, form = split_size(size_text)

    # --- masthead -------------------------------------------------------
    mh = 40.0
    mw = mh * MARK_W / MARK_H
    parts = [
        f'<g transform="translate({(W - mw) / 2:.2f} 16) scale({mh / MARK_H:.6f})" '
        f'fill="{MIDNIGHT}"><path d="{MARK_V}"/><path d="{MARK_F}"/></g>'
    ]
    d, _ = centred(SERIF, 700, "VIAL FOUNDRY", 19.0, 88.0, W, 0.10, SERIF_CAP)
    parts.append(f'<path d="{d}" fill="{MIDNIGHT}"/>')
    d, _ = centred(SANS, 500, "RESEARCH PEPTIDES", 7.0, 108.0, W, 0.30)
    parts.append(f'<path d="{d}" fill="{SLATE}"/>')
    parts.append(f'<rect x="{ox}" y="126" width="{inner}" height="1" fill="{MIST}"/>')

    # --- product identity ----------------------------------------------
    parts.append(
        f'<path d="{fit_centred(SANS, 700, title, 40.0, 194.0, W, inner - 8, 0.01)}" fill="{MIDNIGHT}"/>'
    )
    d, _ = centred(SANS, 700, qty, 26.0, 240.0, W, 0.06)
    parts.append(f'<path d="{d}" fill="{MIDNIGHT}"/>')
    if form:
        d = fit_centred(SANS, 500, form, 9.0, 264.0, W, inner - 8, 0.22)
        parts.append(f'<path d="{d}" fill="{SLATE}"/>')

    parts.append(f'<rect x="{W / 2 - 26:.2f}" y="288" width="52" height="2" fill="{TEAL}"/>')

    # --- identifiers -----------------------------------------------------
    lx, rx = ox + 6.0, W / 2 + 10.0
    d, _ = text_path(SANS, 500, "CAS REGISTRY", 7.4, 0.16, lx, 348.0)
    parts.append(f'<path d="{d}" fill="{SLATE}"/>')
    d, _ = text_path(SANS, 600, cas, 10.5, 0.02, lx, 366.0)
    parts.append(f'<path d="{d}" fill="{MIDNIGHT}"/>')
    d, _ = text_path(SANS, 500, "CAT. NO.", 7.4, 0.16, rx, 348.0)
    parts.append(f'<path d="{d}" fill="{SLATE}"/>')
    d, _ = text_path(SANS, 600, sku, 10.5, 0.02, rx, 366.0)
    parts.append(f'<path d="{d}" fill="{MIDNIGHT}"/>')

    d, _ = centred(SANS, 500, "STORE AT -20°C   PROTECT FROM LIGHT", 6.6, 404.0, W, 0.14)
    parts.append(f'<path d="{d}" fill="{SLATE}"/>')

    # --- research-use bar -------------------------------------------------
    parts.append(f'<rect x="{ox}" y="428" width="{inner}" height="30" fill="{MIDNIGHT}"/>')
    d, _ = centred(SANS, 600, "FOR RESEARCH USE ONLY", 8.4, 447.0, W, 0.26)
    parts.append(f'<path d="{d}" fill="#FFFFFF"/>')

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * SS:.0f}" height="{H * SS:.0f}" '
        f'viewBox="0 0 {W:.0f} {H:.0f}">{"".join(parts)}</svg>'
    )


def render_label(svg_text, tmp_dir):
    import subprocess
    svg_path = os.path.join(tmp_dir, "_label.svg")
    png_path = os.path.join(tmp_dir, "_label.png")
    with open(svg_path, "w", encoding="utf-8") as fh:
        fh.write(svg_text)
    subprocess.run(
        ["magick", "-background", "none", "-density", "288", svg_path,
         "-resize", f"{LABEL_W}x{LABEL_H}!", "PNG32:" + png_path],
        check=True, capture_output=True,
    )
    return Image.open(png_path).convert("RGBA")


def main():
    base = Image.open(BASE).convert("RGBA")
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp()
    composed = {}

    for slug, title, size_text, cas, sku in PRODUCTS:
        art = render_label(label_svg(title, size_text, cas, sku), tmp)
        vial = base.copy()
        vial.alpha_composite(art, (LABEL_X, LABEL_Y))
        composed[slug] = vial

        # Studio card image on the approved Cloud ground.
        canvas = Image.new("RGB", (1600, 1600), "#F4F7F9")
        scaled = vial.resize((1330, 1330), Image.LANCZOS)
        canvas.paste(scaled, (135, 135), scaled)
        save_retry(canvas.resize((1000, 1000), Image.LANCZOS),
                   os.path.join(OUT, f"{slug}.webp"), quality=82, method=6)

        save_retry(vial.resize((1000, 1000), Image.LANCZOS),
                   os.path.join(OUT, f"{slug}-transparent.webp"), quality=85, method=6)
        print(f"  {slug}.webp + {slug}-transparent.webp")

    hero_composition(composed)
    og_image(composed)
    print(f"{len(PRODUCTS)} products composed onto the photographic vial base.")


def hero_composition(composed):
    """Photorealistic 3-vial hero composition.

    No floating UI, no holographic panels, no fake telemetry - just the
    physical product, which is what the brand brief asks to lead with.
    Transparent ground so it sits on the page surface, not in a box.
    """
    W, H = 1600, 980
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # back-to-front so the closer vials overlap correctly
    layout = [
        ("tirzepatide", 0.74, 232, 208),
        ("semaglutide", 0.78, 980, 182),
        ("bpc-157", 1.00, 566, 36),
    ]
    for slug, scale, x, y in layout:
        v = composed[slug].copy()
        s = int(1200 * scale * 0.72)
        v = v.resize((s, s), Image.LANCZOS)
        if scale < 1.0:
            # push the supporting vials back a touch
            v.putalpha(v.split()[3].point(lambda a: int(a * 0.92)))
        canvas.alpha_composite(v, (x, y))

    out = os.path.join(ROOT, "public", "assets", "vials", "hero-composition.webp")
    save_retry(canvas, out, quality=88, method=6)
    print(f"  hero-composition.webp ({W}x{H}, transparent)")


def og_image(composed):
    """1200x630 social card: approved reversed identity + real product."""
    import subprocess

    W, H = 1200, 630
    tmp = tempfile.mkdtemp()
    logo_png = os.path.join(tmp, "og-logo.png")
    subprocess.run(
        ["magick", "-background", "none", "-density", "300",
         os.path.join(ROOT, "public", "brand", "logo-stacked-white.svg"),
         "-resize", "470x", "PNG32:" + logo_png],
        check=True, capture_output=True,
    )

    canvas = Image.new("RGBA", (W, H), (0x0F, 0x27, 0x40, 255))

    # Crop off the base image's own light ground-shadow: on Midnight it reads
    # as haze rather than as a shadow.
    vial = composed["bpc-157"].copy()
    vh = int(vial.height * 0.875)
    vial = vial.crop((0, 0, vial.width, vh))
    tw = 640
    vial = vial.resize((tw, int(vh * tw / vial.width)), Image.LANCZOS)
    canvas.alpha_composite(vial, (742, 22))

    canvas.alpha_composite(Image.open(logo_png).convert("RGBA"), (96, 150))

    art = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    art.append(f'<rect x="96" y="418" width="56" height="3" fill="{TEAL}"/>')
    d, _ = text_path(SANS, 600, "RESEARCH FUELS WHAT'S NEXT.", 15.0, 0.26, 96, 470)
    art.append(f'<path d="{d}" fill="#FFFFFF"/>')
    d, _ = text_path(SANS, 500, "Premium research peptides. For research use only.", 16.0, 0.01, 96, 506)
    art.append(f'<path d="{d}" fill="#8FA9BC"/>')
    art.append("</svg>")

    svg_p, png_p = os.path.join(tmp, "og.svg"), os.path.join(tmp, "og.png")
    with open(svg_p, "w", encoding="utf-8") as fh:
        fh.write("".join(art))
    subprocess.run(["magick", "-background", "none", "-density", "150", svg_p,
                    "-resize", f"{W}x{H}!", "PNG32:" + png_p], check=True, capture_output=True)
    canvas.alpha_composite(Image.open(png_p).convert("RGBA"), (0, 0))

    # OG must stay PNG/JPEG: several crawlers still do not accept WebP.
    save_retry(canvas.convert("RGB"), os.path.join(ROOT, "public", "brand", "og-image.png"),
               optimize=True)
    print(f"  og-image.png ({W}x{H})")


if __name__ == "__main__":
    main()
