from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

src = Image.open('public/assets/vials/vial-transparent.png').convert('RGBA')
W, H = src.size

# The supplied cutout has a transparency checkerboard baked into BOTH the RGB and
# the alpha channel. Flatten onto white, label the light regions, and treat every
# light region that touches the border as background.
flat = Image.alpha_composite(Image.new('RGBA', (W, H), (255,)*4), src).convert('L')
a = np.array(flat)
light = a > 232

lab, n = ndimage.label(light)
border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
border.discard(0)
bg = np.isin(lab, list(border))
print(f'{n} light regions, {len(border)} touch the border -> background {bg.mean()*100:.1f}%')

alpha = np.where(bg, 0, 255).astype(np.uint8)
# fill pinholes inside the object, then tighten and re-feather the edge
alpha = np.where(ndimage.binary_fill_holes(alpha > 0), 255, 0).astype(np.uint8)
am = Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))

out = np.dstack([np.array(src.convert('RGB')), np.array(am)])
Image.fromarray(out, 'RGBA').save('public/assets/vials/vial-base.png', optimize=True)

chk = Image.new('RGB', (W, H), '#F4F7F9')
o = Image.open('public/assets/vials/vial-base.png'); chk.paste(o, (0, 0), o)
chk.save(r'C:\Users\omino\AppData\Local\Temp\claude\C--Users-omino-Documents-vialfoundry\cd499598-88ce-46ec-8ce3-91a166e8a6f9\scratchpad\base_check.png')
print('wrote public/assets/vials/vial-base.png')
