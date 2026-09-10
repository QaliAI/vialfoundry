# -*- coding: utf-8 -*-
"""Convert a string to SVG outline path data at a given size + letter-spacing."""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

_cache = {}
def load(path, wght):
    key = (path, wght)
    if key not in _cache:
        f = TTFont(path)
        if "fvar" in f:
            f = instantiateVariableFont(f, {"wght": wght}, inplace=True, updateFontNames=False)
        _cache[key] = f
    return _cache[key]

def text_path(font_path, wght, text, size, tracking=0.0, x=0.0, y=0.0):
    """tracking in em units. Returns (path_d, advance_width)."""
    f = load(font_path, wght)
    upm = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f["hmtx"]
    scale = size / upm
    pen_x = x
    parts = []
    for ch in text:
        if ch == " ":
            pen_x += hmtx[cmap[ord(" ")]][0] * scale + tracking * size
            continue
        gname = cmap[ord(ch)]
        spen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
        tpen = TransformPen(spen, Transform(scale, 0, 0, -scale, pen_x, y))
        gs[gname].draw(tpen)
        d = spen.getCommands()
        if d:
            parts.append(d)
        pen_x += hmtx[gname][0] * scale + tracking * size
    return "".join(parts), pen_x - x - (tracking * size if text else 0)

def measure(font_path, wght, text, size, tracking=0.0):
    return text_path(font_path, wght, text, size, tracking)[1]
