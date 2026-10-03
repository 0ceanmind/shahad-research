"""Dark base map of the Gulf-to-East-Asia region for the export flow-map slide (Natural Earth, public domain)."""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(__file__)
EXT = dict(lon0=38.0, lon1=146.0, lat0=-1.0, lat1=47.0)
K = math.cos(math.radians(24))
HIGHLIGHT = {"Kuwait": (255, 159, 10, 255)}
DEST = {"China", "South Korea", "Japan", "Taiwan", "India"}


def render(scale=40, ss=2):
    wu = (EXT["lon1"] - EXT["lon0"]) * K; hu = EXT["lat1"] - EXT["lat0"]
    W, H = int(wu * scale), int(hu * scale)
    s = scale * ss
    P = lambda x, y: ((x - EXT["lon0"]) * K * s, (EXT["lat1"] - y) * s)
    img = Image.new("RGBA", (W * ss, H * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    gj = json.load(open(os.path.join(HERE, "data", "asia_10m.geo.json")))
    for f in gj["features"]:
        nm = f["properties"]["NAME"]
        fill = HIGHLIGHT.get(nm, (40, 40, 44, 255) if nm in DEST else (26, 26, 29, 255))
        edge = (70, 70, 76, 255) if nm in DEST else (46, 46, 50, 255)
        for poly in f["geometry"]["coordinates"]:
            pts = [P(x, y) for x, y in poly[0]]
            if len(pts) > 2:
                d.polygon(pts, fill=fill)
                d.line(pts + [pts[0]], fill=edge, width=ss)
    img = img.resize((W, H), Image.LANCZOS)
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    f = 0.10
    m = np.clip(np.minimum(np.minimum(xs / (W * f), (W - xs) / (W * f)), np.minimum(ys / (H * f), (H - ys) / (H * f))), 0, 1) ** 1.3
    a = np.array(img).astype(np.float32); a[..., 3] *= m
    Image.fromarray(a.astype(np.uint8), "RGBA").save(os.path.join(HERE, "assets", "asia_dark.png"))
    json.dump(dict(EXT, k=K, wu=wu, hu=hu, px=[W, H]), open(os.path.join(HERE, "assets", "asia_frame.json"), "w"), indent=1)
    print("asia map", W, H, round(wu / hu, 3))


if __name__ == "__main__":
    render()
