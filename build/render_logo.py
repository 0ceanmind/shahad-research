"""UTAS logo assets from the supplied 281x100 logo (assets/utas_logo_original.png):
utas_logo.png  - 4x upscale, trimmed to the artwork, (premultiplied-alpha Lanczos, light sharpening) for the report cover
logo_badge.png - the logo on a white rounded tile, used on every slide of the dark deck"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src = Image.open("assets/utas_logo_original.png").convert("RGBA")


def upscale(im, f):
    a = np.asarray(im).astype(np.float32) / 255
    pm = a.copy(); pm[..., :3] *= pm[..., 3:4]
    big = []
    for c in range(4):
        ch = Image.fromarray((pm[..., c] * 255).astype(np.uint8)).resize((im.width * f, im.height * f), Image.LANCZOS)
        big.append(np.asarray(ch).astype(np.float32) / 255)
    big = np.stack(big, -1)
    rgb = np.where(big[..., 3:4] > 1e-3, big[..., :3] / np.maximum(big[..., 3:4], 1e-3), 0)
    out = Image.fromarray((np.dstack([np.clip(rgb, 0, 1), big[..., 3:4]]) * 255).astype(np.uint8), "RGBA")
    return out.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))


big = upscale(src, 4)
bbox = big.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
logo = big.crop(bbox)
logo.save("assets/utas_logo.png")
padx, pady = int(logo.height * 0.30), int(logo.height * 0.26)
W, H = logo.width + 2 * padx, logo.height + 2 * pady
tile = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(tile).rounded_rectangle((0, 0, W - 1, H - 1), radius=int(H * 0.22), fill=(255, 255, 255, 255))
tile.alpha_composite(logo, (padx, pady))
tile.save("assets/logo_badge.png")
print("badge", tile.size, "logo bbox", bbox)
