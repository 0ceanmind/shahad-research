"""Render raster assets for the deck: glossy crude-oil drop and glow backgrounds."""
import numpy as np
from PIL import Image, ImageFilter
import os

OUT = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(OUT, exist_ok=True)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def render_drop(W=1400, H=1900, ss=2, name="drop.png"):
    """Surface-of-revolution teardrop (round base, pointed tip), shaded like glossy crude oil."""
    w, h = W * ss, H * ss
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    sx, sy = w * 0.40, h * 0.96
    x = (xs - w / 2) / sx
    v = np.clip((ys - h * 0.02) / sy, 0, 1)          # 0 = tip, 1 = base
    m = 1.7
    def prof(vv):
        t = np.arccos(np.clip(1 - 2 * vv, -1, 1))     # y = cos t  -> rounded base
        return np.sin(t) * np.power(np.sin(t / 2), m)
    norm = prof(np.linspace(0, 1, 4001)).max()
    R = prof(v) / norm
    dv = 1e-4
    dR = (prof(np.clip(v + dv, 0, 1)) / norm - prof(np.clip(v - dv, 0, 1)) / norm) / (2 * dv)
    inside = (np.abs(x) < R)
    Rs = np.maximum(R, 1e-6)
    z = np.sqrt(np.clip(Rs * Rs - x * x, 0, None))
    k = sx / sy
    nx, ny, nz = x, -Rs * dR * k, z
    nrm = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-9
    nx, ny, nz = nx / nrm, ny / nrm, nz / nrm
    # screen space: +x right, +y down -> flip ny sign convention for lights
    pass
    L = np.array([-0.5, -0.7, 0.5]); L /= np.linalg.norm(L)
    Hh = L + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh)
    lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    spec = np.power(np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1), 220)
    fres = np.power(1 - np.clip(nz, 0, 1), 2.6)
    # soft elongated softbox reflection, upper left
    rx, ry = 2 * nz * nx, 2 * nz * ny
    box = np.exp(-(((rx + 0.42) / 0.16) ** 2 + ((ry + 0.38) / 0.30) ** 2) ** 1.6)
    # warm subsurface light pooled in the base, plus a rim from behind-right
    pool = np.exp(-((x / 0.75) ** 2 + ((v - 0.83) / 0.13) ** 2)) * (1 - lam) ** 0.4
    rim = fres * np.clip(0.35 + 0.65 * (nx * 0.7 - ny * 0.3), 0, 1)
    base = np.array([6, 5, 4], np.float32) / 255
    col = base * (0.4 + 0.6 * lam[..., None])
    col = col + np.array([1.0, 0.50, 0.06]) * (pool[..., None] * 0.55)
    col = col + np.array([1.0, 0.62, 0.12]) * (rim[..., None] * 0.95)
    col = col + np.array([1.0, 0.97, 0.92]) * (spec[..., None] * 1.1 + box[..., None] * 0.42)
    col = np.clip(col, 0, 1)
    edge = (R - np.abs(x)) * sx
    alpha = np.clip(edge / 1.5, 0, 1) * inside
    rgba = np.dstack([col * 255, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA").resize((W, H), Image.LANCZOS)
    a = np.array(img)[..., 3].astype(np.float32)
    pad = int(W * 0.22)
    canvas = Image.new("RGBA", (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
    glow = Image.new("L", canvas.size, 0)
    glow.paste(Image.fromarray(a.astype(np.uint8)), (pad, pad))
    glow = glow.filter(ImageFilter.GaussianBlur(W * 0.09))
    g = np.array(glow).astype(np.float32) / 255 * 0.42
    glow_rgba = np.zeros((canvas.size[1], canvas.size[0], 4), np.uint8)
    glow_rgba[..., 0] = 255; glow_rgba[..., 1] = 128; glow_rgba[..., 2] = 16
    glow_rgba[..., 3] = (g * 255).astype(np.uint8)
    canvas = Image.alpha_composite(canvas, Image.fromarray(glow_rgba, "RGBA"))
    canvas.alpha_composite(img, (pad, pad))
    canvas.save(os.path.join(OUT, name))
    print("drop", canvas.size)


def glow_bg(name, W=3840, H=2160, spots=(), base=(11, 11, 15), noise=2.0):
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    img = np.zeros((H, W, 3), np.float32) + np.array(base, np.float32)
    for (cx, cy, rx, ry, color, strength) in spots:
        d = ((xs / W - cx) / rx) ** 2 + ((ys / H - cy) / ry) ** 2
        img += np.exp(-d)[..., None] * np.array(color, np.float32) * strength
    img += np.random.default_rng(7).normal(0, noise, img.shape)  # dither: no banding
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=92)
    print(name)


if __name__ == "__main__":
    render_drop()
    glow_bg("bg_title.jpg", spots=[(0.76, 0.58, 0.26, 0.42, (255, 110, 10), 0.17),
                                   (0.05, 0.00, 0.30, 0.30, (40, 110, 255), 0.06)])
    glow_bg("bg_section.jpg", spots=[(0.20, 0.52, 0.26, 0.42, (255, 110, 10), 0.13)])
    glow_bg("bg_gas.jpg", spots=[(0.80, 0.45, 0.28, 0.42, (30, 140, 255), 0.13)])
    glow_bg("bg_fire.jpg", spots=[(0.70, 1.05, 0.65, 0.55, (255, 70, 10), 0.42),
                                  (0.30, 1.10, 0.45, 0.40, (255, 150, 20), 0.22)])
    glow_bg("bg_content.jpg", spots=[(0.5, 1.30, 0.9, 0.50, (255, 130, 20), 0.045)])


def api_scale(name="api_scale.png", W=3000, H=84):
    """Heavy (dark brown) -> light (pale gold) gradient bar with rounded ends."""
    stops = [(0.0, (70, 34, 8)), (0.32, (150, 70, 10)), (0.53, (255, 159, 10)), (1.0, (255, 230, 160))]
    xs = np.linspace(0, 1, W)
    col = np.zeros((W, 3))
    for (p0, c0), (p1, c1) in zip(stops[:-1], stops[1:]):
        m = (xs >= p0) & (xs <= p1)
        t = ((xs[m] - p0) / (p1 - p0))[:, None]
        col[m] = np.array(c0) * (1 - t) + np.array(c1) * t
    img = np.zeros((H, W, 4), np.uint8)
    img[..., :3] = col[None, :, :].astype(np.uint8)
    mask = Image.new("L", (W * 2, H * 2), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W * 2 - 1, H * 2 - 1], radius=H, fill=255)
    img[..., 3] = np.array(mask.resize((W, H), Image.LANCZOS))
    Image.fromarray(img, "RGBA").save(os.path.join(OUT, name))


def depth_arrow(name="depth_arrow.png", W=90, H=1320):
    """Vertical arrow fading from transparent (shallow) to white (deep)."""
    from PIL import ImageDraw
    ss = 3
    im = Image.new("RGBA", (W * ss, H * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = W * ss // 2
    shaft_w = 6 * ss
    for y in range(0, (H - 60) * ss):
        a = int(40 + 200 * y / ((H - 60) * ss))
        d.line([(cx - shaft_w // 2, y), (cx + shaft_w // 2, y)], fill=(161, 161, 166, a))
    d.polygon([(cx - 36 * ss, (H - 70) * ss), (cx + 36 * ss, (H - 70) * ss), (cx, H * ss - 2)], fill=(161, 161, 166, 240))
    im.resize((W, H), Image.LANCZOS).save(os.path.join(OUT, name))


if __name__ == "__main__":
    api_scale()
    depth_arrow()


def orb(name, color, size=700, power=1.6, peak=0.55):
    """Soft radial light (alpha falloff) used as a drifting ambient glow."""
    ys, xs = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.sqrt((xs - size / 2) ** 2 + (ys - size / 2) ** 2) / (size / 2)
    a = np.clip(1 - r, 0, 1) ** power * peak
    img = np.zeros((size, size, 4), np.uint8)
    img[..., 0], img[..., 1], img[..., 2] = color
    img[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(os.path.join(OUT, name))


def base_bg(name="bg_base.jpg", W=3840, H=2160):
    """Near-black canvas with a faint vignette and dither, so ambient orbs carry the colour."""
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    d = ((xs / W - 0.5) / 0.75) ** 2 + ((ys / H - 0.45) / 0.75) ** 2
    v = 13 - 5 * np.clip(d, 0, 1)
    img = np.dstack([v - 1, v - 1, v + 2]) + np.random.default_rng(3).normal(0, 1.6, (H, W, 3))
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=92)


def ambient_assets():
    orb("orb_amber.png", (255, 128, 10))
    orb("orb_gold.png", (255, 190, 60), peak=0.42)
    orb("orb_blue.png", (40, 120, 255), peak=0.5)
    orb("orb_red.png", (255, 60, 20), peak=0.6)
    base_bg()


if __name__ == "__main__":
    ambient_assets()
