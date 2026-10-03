"""Render the Kuwait base map (dark, for slides) from Natural Earth 1:10m (public domain).
Writes assets/map_dark.png and assets/map_frame.json (extent + projection for marker placement)."""
import json
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(__file__)
GEO = os.path.join(HERE, "data", "KWT_10m.geo.json")
OUT = os.path.join(HERE, "assets")

EXT = dict(lon0=46.20, lon1=49.20, lat0=28.15, lat1=30.25)  # west, east, south, north
KLAT = math.cos(math.radians(29.2))


def frame(px_per_unit):
    wu = (EXT["lon1"] - EXT["lon0"]) * KLAT
    hu = EXT["lat1"] - EXT["lat0"]
    return wu, hu, int(wu * px_per_unit), int(hu * px_per_unit)


def proj(lon, lat, s):
    return ((lon - EXT["lon0"]) * KLAT * s, (EXT["lat1"] - lat) * s)


def polys(feature):
    g = feature["geometry"]
    return g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]


def edge_mask(Wp, Hp, f=0.16):
    ys, xs = np.mgrid[0:Hp, 0:Wp].astype(np.float32)
    fx = np.minimum(xs / (Wp * f), (Wp - xs) / (Wp * f))
    fy = np.minimum(ys / (Hp * f), (Hp - ys) / (Hp * f))
    return np.clip(np.minimum(fx, fy), 0, 1) ** 1.5


def render(name, land, land_edge, neigh, neigh_edge, scale=900, ss=3, glow=None):
    """scale = pixels per map unit (degrees of latitude)."""
    wu, hu, Wp, Hp = frame(scale)
    s = scale * ss
    gj = json.load(open(GEO))
    feats = {(f["properties"].get("NAME") or f["properties"].get("ADMIN")): f for f in gj["features"]}
    # neighbours, feathered at the frame edge so they dissolve into the slide
    nb = Image.new("RGBA", (Wp * ss, Hp * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(nb)
    for nm in ("Iraq", "Saudi Arabia"):
        for poly in polys(feats[nm]):
            pts = [proj(x, y, s) for x, y in poly[0]]
            d.polygon(pts, fill=neigh)
            d.line(pts + [pts[0]], fill=neigh_edge, width=max(1, int(1.2 * ss * scale / 900)))
    nb = nb.resize((Wp, Hp), Image.LANCZOS)
    arr = np.array(nb).astype(np.float32)
    arr[..., 3] *= edge_mask(Wp, Hp)
    img = Image.fromarray(arr.astype(np.uint8), "RGBA")
    # Kuwait with a soft warm halo
    kw = [[proj(x, y, s) for x, y in poly[0]] for poly in polys(feats["Kuwait"])]
    big = Image.new("RGBA", (Wp * ss, Hp * ss), (0, 0, 0, 0))
    if glow:
        gl = Image.new("L", big.size, 0)
        gd = ImageDraw.Draw(gl)
        for pts in kw:
            gd.polygon(pts, fill=255)
        gl = gl.filter(ImageFilter.GaussianBlur(18 * ss * scale / 900))
        a = (np.array(gl).astype(np.float32) * glow[3] / 255).astype(np.uint8)
        layer = np.zeros((big.size[1], big.size[0], 4), np.uint8)
        layer[..., 0], layer[..., 1], layer[..., 2], layer[..., 3] = glow[0], glow[1], glow[2], a
        big = Image.alpha_composite(big, Image.fromarray(layer, "RGBA"))
    d = ImageDraw.Draw(big)
    for pts in kw:
        d.polygon(pts, fill=land)
        d.line(pts + [pts[0]], fill=land_edge, width=max(2, int(2.2 * ss * scale / 900)), joint="curve")
    img = Image.alpha_composite(img, big.resize((Wp, Hp), Image.LANCZOS))
    img.save(os.path.join(OUT, name))
    return wu, hu, Wp, Hp


if __name__ == "__main__":
    wu, hu, Wp, Hp = render("map_dark.png", land=(30, 30, 33, 255), land_edge=(120, 120, 128, 255),
                            neigh=(22, 22, 25, 255), neigh_edge=(52, 52, 56, 255),
                            glow=(255, 140, 20, 60), scale=1800, ss=2)
    json.dump(dict(EXT, klat=KLAT, wu=wu, hu=hu, px=[Wp, Hp]), open(os.path.join(OUT, "map_frame.json"), "w"), indent=1)
    print("map", Wp, Hp, round(wu / hu, 3))
