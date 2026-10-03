"""Figures for the Word report (light, print-friendly). Same data as the deck.
Writes PNGs to assets/doc/."""
import json
import math
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Rectangle

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "assets", "doc")
os.makedirs(OUT, exist_ok=True)
S = json.load(open(os.path.join(HERE, "data", "series.json")))
M = json.load(open(os.path.join(HERE, "data", "markets.json")))
F = json.load(open(os.path.join(HERE, "data", "fields.json")))

OIL, OIL2, GAS, GRAY, RED, INK, MUTED, GRID = "#D97706", "#F59E0B", "#0284C7", "#9CA3AF", "#DC2626", "#1F2937", "#6B7280", "#E5E7EB"
plt.rcParams.update({
    "font.family": "Liberation Sans", "font.size": 10.5, "axes.edgecolor": GRID, "axes.labelcolor": INK,
    "xtick.color": MUTED, "ytick.color": MUTED, "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.8, "axes.axisbelow": True, "figure.dpi": 200,
})


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(name)


def fig_api():
    fig, ax = plt.subplots(figsize=(7.2, 2.6))
    ax.grid(False)
    import numpy as np
    grad = np.linspace(0, 1, 400)[None, :]
    from matplotlib.colors import LinearSegmentedColormap
    cm = LinearSegmentedColormap.from_list("api", ["#462208", "#964610", "#FF9F0A", "#FFE6A0"])
    ax.imshow(grad, extent=[10, 50, -0.12, 0.12], aspect="auto", cmap=cm)
    for x in (22.3, 31.1):
        ax.plot([x, x], [-0.25, 0.25], color=INK, lw=0.8)
    for x, lab in ((16.15, "HEAVY"), (25.2, "MEDIUM"), (40.5, "LIGHT")):
        ax.text(x, -0.22, lab, ha="center", va="top", fontsize=8.5, color=MUTED, fontweight="bold")
    crudes = [("Kuwait Export Heavy", 16, "4.9% S", 0.55), ("Khafji", 28.5, "2.85% S", -0.62),
              ("Kuwait Export Crude", 30.5, "2.5% S", 0.55), ("Kuwait Super Light", 48, "0.4% S", 0.55)]
    for n, api, s, yy in crudes:
        ax.plot(api, 0, "o", ms=9, mfc="white", mec=INK, mew=1.4, zorder=5)
        ax.plot([api, api], [0.12 if yy > 0 else -0.12, yy - 0.06 if yy > 0 else yy + 0.04], color=GRAY, lw=0.8)
        ax.text(min(max(api, 15.5), 45.5), yy, f"{n}\n{api}° API · {s}", ha="center", va="bottom" if yy > 0 else "top",
                fontsize=9, color=INK, linespacing=1.3)
    ax.set_xlim(9, 51); ax.set_ylim(-1.25, 1.15)
    ax.set_yticks([]); ax.set_xticks([10, 20, 30, 40, 50]); ax.set_xticklabels(["10°", "20°", "30°", "40°", "50°"])
    for sp in ("left", "bottom"):
        ax.spines[sp].set_visible(False)
    ax.tick_params(axis="x", length=0)
    ax.set_xlabel("API gravity (degrees)", color=MUTED, fontsize=9)
    save(fig, "fig_api.png")


def fig_production():
    P = {int(k): v for k, v in S["production_kbd"].items()}
    ys = sorted(P)
    fig, ax = plt.subplots(figsize=(7.2, 3.4))
    ax.plot(ys, [P[y] for y in ys], color=OIL, lw=2.2)
    ax.fill_between(ys, [P[y] for y in ys], color=OIL2, alpha=0.12)
    for y, lab, xt, yt in ((1972, "1972 peak\n3,339 kb/d", 1972, 3560), (1991, "1991: 185 kb/d\n(invasion & fires)", 2004, 650),
                           (2016, "2016: 3,150", 2016, 3400), (2024, "2024: ≈2,730", 2019.5, 2000)):
        ax.plot(y, P[y], "o", color=OIL, mec="white", ms=6, zorder=5)
        far = abs(yt - P[y]) > 400 or abs(xt - y) > 2
        ax.annotate(lab, (y, P[y]), xytext=(xt, yt), ha="center", fontsize=8.5, color=INK,
                    arrowprops=dict(arrowstyle="-", color=GRAY, lw=0.7) if far else None)
    ax.set_xlim(1944, 2026); ax.set_ylim(0, 3900)
    ax.set_ylabel("thousand barrels per day")
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: f"{int(v):,}"))
    save(fig, "fig_production.png")


def fig_gas():
    G = {int(k): v for k, v in S["gas"].items()}
    ys = list(range(2000, 2025))
    prod = [G[y]["prod_bcm"] for y in ys]
    imp = [G[y]["import_bcm"] for y in ys]
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    ax.stackplot(ys, prod, imp, colors=[GAS, "#9CA3AF"], labels=["Domestic production", "Net imports (LNG)"], alpha=0.9)
    ax.set_xlim(2000, 2024); ax.set_ylim(0, 27); ax.set_ylabel("billion cubic metres")
    ax.legend(loc="upper left", frameon=False, fontsize=9)
    ax.annotate("2024: ≈40% imported", (2024, 24.6), xytext=(2017.2, 25.4), fontsize=9, color=INK)
    save(fig, "fig_gas.png")


def fig_map():
    gj = json.load(open(os.path.join(HERE, "data", "KWT_10m.geo.json")))
    K = math.cos(math.radians(29.2))
    fig, ax = plt.subplots(figsize=(6.6, 5.6))
    ax.grid(False)
    for f in gj["features"]:
        nm = f["properties"].get("NAME") or f["properties"].get("ADMIN")
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            pts = [(x * K, y) for x, y in poly[0]]
            ax.add_patch(Polygon(pts, closed=True, fc="#FDF6EC" if nm == "Kuwait" else "#F3F4F6",
                                 ec="#92400E" if nm == "Kuwait" else "#D1D5DB", lw=1.1 if nm == "Kuwait" else 0.6, zorder=1))
    for f in F["fields"]:
        x, y = f["lon"] * K, f["lat"]
        if f["kind"] == "infra":
            ax.plot(x, y, "D", ms=5.5, mfc=INK, mec="white", zorder=4)
        else:
            ax.plot(x, y, "o", ms=10 if f.get("major") else 7, mfc=GAS if f["kind"] == "gas" else OIL, mec="white", zorder=4)
    labels = {"burgan": (-0.36, -0.1), "raudhatain": (-0.33, 0.04), "sabriya": (0.04, 0.0), "bahra": (0.04, -0.01),
              "ratqa": (-0.31, -0.07), "abdali": (0.04, 0.02), "minagish": (-0.23, -0.02), "ummgudair": (-0.27, -0.06),
              "kramaru": (-0.27, 0.0), "wafra": (0.04, -0.02), "khafji": (0.04, -0.02), "hout": (0.04, -0.01),
              "dorra": (0.04, -0.01), "nokhatha": (0.04, -0.01), "jlaiaa": (0.04, -0.07), "kwcity": (0.04, 0.0),
              "ahmadi": (0.04, 0.03), "abdullah": (0.04, -0.05), "zour": (0.04, -0.03), "abduliyah": (-0.24, 0.0)}
    for f in F["fields"]:
        if f["id"] in labels:
            dx, dy = labels[f["id"]]
            ax.text(f["lon"] * K + dx, f["lat"] + dy, f["name"], fontsize=7.2, color=INK if f["kind"] != "infra" else MUTED,
                    zorder=6, fontweight="bold" if f.get("major") else "normal")
    for t, lon, lat in (("IRAQ", 47.0, 30.15), ("SAUDI ARABIA", 47.0, 28.3), ("ARABIAN GULF", 48.75, 29.65), ("KUWAIT", 47.55, 29.55)):
        ax.text(lon * K, lat, t, fontsize=9, color="#9CA3AF", ha="center", style="italic")
    ax.set_xlim(46.45 * K, 49.35 * K); ax.set_ylim(28.2, 30.25); ax.set_aspect("equal")
    ax.set_xticks([x * K for x in (46.5, 47, 47.5, 48, 48.5, 49)]); ax.set_xticklabels(["46.5°E", "47°E", "47.5°E", "48°E", "48.5°E", "49°E"])
    ax.set_yticks([28.5, 29, 29.5, 30]); ax.set_yticklabels(["28.5°N", "29°N", "29.5°N", "30°N"])
    ax.tick_params(labelsize=8)
    from matplotlib.lines import Line2D
    h = [Line2D([], [], marker="o", ls="", mfc=OIL, mec="white", ms=8, label="Oil field"),
         Line2D([], [], marker="o", ls="", mfc=GAS, mec="white", ms=8, label="Gas field"),
         Line2D([], [], marker="D", ls="", mfc=INK, mec="white", ms=6, label="City / refinery / port")]
    ax.legend(handles=h, loc="lower right", fontsize=8, frameon=True, framealpha=0.95)
    save(fig, "fig_map.png")


def fig_strata():
    layers = [("Lower Fars", "Miocene sandstone", 0.5, "sand", "Heavy oil (Ratqa)"),
              ("Mishrif", "Mid-Cretaceous carbonate", 0.4, "carb", ""), ("Wara", "Mid-Cretaceous sandstone", 0.36, "sand", ""),
              ("Mauddud", "Mid-Cretaceous carbonate", 0.4, "carb", ""), ("Burgan", "Mid-Cretaceous (Albian) sandstone", 0.66, "sand", ""),
              ("Zubair", "Early Cretaceous sandstone", 0.42, "sand", ""), ("Ratawi", "Early Cretaceous limestone/shale", 0.36, "carb", ""),
              ("Minagish", "Early Cretaceous oolitic limestone", 0.42, "carb", ""),
              ("Najmah / Sargelu", "Middle–Late Jurassic carbonates", 0.44, "jur", ""), ("Marrat", "Early Jurassic carbonate", 0.44, "jur", "")]
    col = {"sand": "#E5B567", "carb": "#9DB4C7", "jur": "#6E95B3"}
    fig, ax = plt.subplots(figsize=(7.6, 4.8))
    ax.axis("off")
    y = 0
    spans = {}
    groups = {0: "heavy", 9: "jur", 8: "jur"}
    for i, (n, d, h, lit, _) in enumerate(layers):
        ax.add_patch(Rectangle((0, -y - h), 1.2, h - 0.02, fc=col[lit], ec="white"))
        ax.text(1.35, -y - h / 2, n, fontsize=9.5, fontweight="bold", va="center", color=INK)
        ax.text(3.35, -y - h / 2, d, fontsize=8.5, va="center", color=MUTED)
        g = groups.get(i, "kec")
        spans.setdefault(g, [y, y + h]); spans[g][1] = y + h
        y += h
    for g, lab, c in (("heavy", "Heavy oil\n(Lower Fars, North Kuwait)", OIL), ("kec", "Kuwait Export Crude\n(Cretaceous reservoirs)", OIL),
                      ("jur", "Super-light oil and sour gas\n(deep Jurassic, North Kuwait)", GAS)):
        a, b = spans[g]
        ax.plot([6.75, 6.75], [-a - 0.03, -b + 0.03], color=c, lw=3)
        ax.text(6.9, -(a + b) / 2, lab, fontsize=8.5, va="center", color=INK)
    ax.annotate("", xy=(-0.25, -y), xytext=(-0.25, 0), arrowprops=dict(arrowstyle="->", color=MUTED, lw=1.2))
    ax.text(-0.33, -y / 2, "increasing depth", rotation=90, va="center", ha="right", fontsize=8.5, color=MUTED)
    ax.set_xlim(-0.6, 9.6); ax.set_ylim(-y - 0.05, 0.05)
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(fc=col["sand"], label="Sandstone"), Patch(fc=col["carb"], label="Carbonate / shale"),
                       Patch(fc=col["jur"], label="Jurassic carbonate")], loc="upper center", fontsize=8, frameon=False,
              bbox_to_anchor=(0.45, 0.0), ncol=3)
    save(fig, "fig_strata.png")


def fig_exports():
    E = M["exports_kbd"]
    fig, ax = plt.subplots(figsize=(7.2, 3.1))
    ax.plot(E["years"], E["crude"], "-o", color=OIL, lw=2.2, ms=5, label="Crude oil exports")
    ax.plot(E["years"], E["products"], "-o", color=INK, lw=2.2, ms=5, label="Refined product exports (incl. LPG)")
    ax.set_ylim(0, 2400); ax.set_ylabel("thousand barrels per day")
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: f"{int(v):,}"))
    ax.legend(frameon=False, fontsize=9, loc="lower left")
    ax.annotate("2024: products exceed crude", (2024, 1196), xytext=(2018.3, 1150), fontsize=9,
                arrowprops=dict(arrowstyle="-", color=GRAY, lw=0.7))
    save(fig, "fig_exports.png")


def fig_destinations():
    D = M["dest_value_2024"]; V = M["dest_volume_2024"]
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(7.4, 3.0), gridspec_kw={"width_ratios": [1, 1]})
    cols = [OIL, "#E9963A", "#EDA95C", "#F1BC80", "#F5CFA3", GRAY]
    a1.barh(D["labels"][::-1], D["values"][::-1], color=cols[::-1])
    for i, v in enumerate(D["values"][::-1]):
        a1.text(v + 0.6, i, f"{v}%", va="center", fontsize=8.5)
    a1.set_xlim(0, 40); a1.set_title("By value (OEC, US$ 28.8 bn)", fontsize=10, color=INK)
    a1.grid(axis="y", visible=False); a1.tick_params(axis="y", labelsize=9)
    cols2 = [OIL, "#E9963A", "#EDA95C", "#F1BC80", "#6B7280", "#9CA3AF", "#D1D5DB"]
    a2.barh(V["labels"][::-1], V["values"][::-1], color=cols2[::-1])
    for i, v in enumerate(V["values"][::-1]):
        a2.text(v + 0.6, i, f"{v}%", va="center", fontsize=8.5)
    a2.set_xlim(0, 52); a2.set_title("By volume (Energy Institute)", fontsize=10, color=INK)
    a2.grid(axis="y", visible=False); a2.tick_params(axis="y", labelsize=9)
    fig.tight_layout(w_pad=2.5)
    save(fig, "fig_destinations.png")


def fig_prices():
    B = M["brent_annual"]
    fig, ax = plt.subplots(figsize=(7.2, 3.1))
    ax.plot(B["years"], B["values"], color=OIL, lw=2.2, label="Brent (EIA, annual average)")
    ax.plot([2023, 2024], [M["kec"]["2023"], M["kec"]["2024"]], "s", color=INK, ms=6, label="Kuwait Export Crude (OPEC)")
    for y, lab, dy in ((2008, "2008", -17), (2016, "2016", -16), (2020, "2020", -16), (2022, "2022", 8)):
        v = B["values"][B["years"].index(y)]
        ax.annotate(f"{lab}: ${v:.0f}", (y, v), xytext=(y, v + dy), ha="center", fontsize=8.5, color=INK)
    ax.set_ylim(0, 125); ax.set_xlim(1999.5, 2025.5); ax.set_ylabel("US$ per barrel")
    ax.legend(frameon=False, fontsize=9, loc="upper left")
    save(fig, "fig_prices.png")


def fig_lng():
    G = M["lng_2024"]
    fig, ax = plt.subplots(figsize=(7.2, 2.6))
    cols = [GAS, "#38BDF8", "#7DD3FC", "#94A3B8", OIL, "#CBD5E1", "#E2E8F0"]
    ax.barh(G["labels"][::-1], G["values"][::-1], color=cols[::-1])
    for i, v in enumerate(G["values"][::-1]):
        ax.text(v + 0.6, i, f"{v}%", va="center", fontsize=8.5)
    ax.set_xlim(0, 70); ax.set_xlabel("share of Kuwait's 2024 LNG imports (9.73 bcm)")
    ax.grid(axis="y", visible=False)
    save(fig, "fig_lng.png")


def fig_2026():
    Y = M["y2026"]
    fig, ax = plt.subplots(figsize=(7.2, 3.0))
    cols = [OIL if v > 900 else RED for v in Y["crude_exports"]]
    ax.bar(Y["months"], Y["crude_exports"], color=cols, width=0.62)
    for i, v in enumerate(Y["crude_exports"]):
        ax.text(i, v + 25, f"{v:,}", ha="center", fontsize=8.5)
    ax.set_ylim(0, 1500); ax.set_ylabel("crude exports, kb/d"); ax.grid(axis="x", visible=False)
    a2 = ax.twinx()
    a2.plot(Y["months"], Y["brent"], "-o", color=INK, lw=1.6, ms=4)
    a2.set_ylim(0, 140); a2.set_ylabel("Brent, US$/bbl"); a2.grid(False); a2.spines["right"].set_visible(True)
    from matplotlib.patches import Patch
    from matplotlib.lines import Line2D
    ax.legend(handles=[Patch(fc=OIL, label="Crude exports (left axis)"), Patch(fc=RED, label="Hormuz disruption months"),
                       Line2D([], [], color=INK, marker="o", ms=4, label="Brent monthly average (right axis)")],
              loc="upper center", bbox_to_anchor=(0.5, -0.1), ncol=3, frameon=False, fontsize=8.5)
    save(fig, "fig_2026.png")


if __name__ == "__main__":
    fig_api(); fig_production(); fig_gas(); fig_map(); fig_strata(); fig_exports(); fig_destinations(); fig_prices(); fig_lng(); fig_2026()
