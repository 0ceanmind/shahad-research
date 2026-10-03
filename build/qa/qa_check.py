"""Deterministic layout checks for out/deck.pptx.

Measures every text box with Liberation Sans (metric-compatible with Arial), wraps it the way PowerPoint does
and reports: text that overflows its box, text that leaves the slide, text-on-text collisions (using the actual
inked extent, not the box), objects intruding on the logo badge / footer band, fonts below the minimum size,
images without a proper description, and slides missing the logo.

Usage: python qa/qa_check.py [out/deck.pptx]   (exit code 1 if anything is reported)
"""
import re
import sys
import zipfile

from PIL import ImageFont

EMU = 914400.0
SW, SH = 13.333, 7.5
FONT = {False: "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        True: "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"}
_fonts = {}
LINE = 1.17          # single line height / font size (Arial ascent + descent + PowerPoint leading)
MIN_PT = 12
BADGE_ZONE = (10.4, 0.0, SW, 1.32)   # x0, y0, x1, y1
FOOTER_Y = 6.84
FOOTER_OK = ("!!footer", "!!num", "!!home_bg", "!!home_ic", "!!home_hit")
IGNORE = ("!!orbA", "!!orbB")


def font(bold, pt):
    k = (bold, round(pt * 4))
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(FONT[bold], max(1, int(round(pt * 4))))  # 4x for precision
    return _fonts[k]


def width_in(txt, bold, pt, spc=0):
    if not txt:
        return 0.0
    w = font(bold, pt).getlength(txt) / 4.0  # points
    return (w + spc / 100.0 * len(txt)) / 72.0


def attr(tag, name, default=None):
    m = re.search(rf'\b{name}="([^"]*)"', tag)
    return m.group(1) if m else default


def parse_paragraphs(tx, default_sz):
    paras = []
    for p in re.findall(r'<a:p>(.*?)</a:p>', tx, flags=re.S):
        ppr = re.search(r'<a:pPr[^>]*?(?:/>|>.*?</a:pPr>)', p, flags=re.S)
        ppr = ppr.group(0) if ppr else ""
        algn = attr(ppr, "algn", "l")
        aft = re.search(r'<a:spcAft><a:spcPts val="(\d+)"', ppr)
        bef = re.search(r'<a:spcBef><a:spcPts val="(\d+)"', ppr)
        lnpct = re.search(r'<a:lnSpc><a:spcPct val="(\d+)"', ppr)
        runs = []
        for rpr, t in re.findall(r'<a:r>\s*(<a:rPr[^>]*?(?:/>|>.*?</a:rPr>))\s*<a:t>(.*?)</a:t>\s*</a:r>', p, flags=re.S):
            t = (t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
                 .replace("&apos;", "'"))
            runs.append((t, attr(rpr, "b") == "1", float(attr(rpr, "sz", default_sz * 100)) / 100, float(attr(rpr, "spc", 0))))
        end = re.search(r'<a:endParaRPr[^>]*sz="(\d+)"', p)
        paras.append({"algn": algn, "runs": runs, "aft": int(aft.group(1)) / 100 if aft else 0,
                      "bef": int(bef.group(1)) / 100 if bef else 0, "ln": int(lnpct.group(1)) / 100000 if lnpct else 1.0,
                      "endsz": float(end.group(1)) / 100 if end else default_sz})
    return paras


def layout_text(paras, box_w, wrap=True):
    """-> (lines, height_in, max_line_width_in); each line = (width, height, algn)"""
    lines = []
    for para in paras:
        if not para["runs"]:
            lines.append((0.0, para["endsz"] * LINE * para["ln"] / 72, para["algn"], para, []))
            continue
        # tokens: words with their run style; wrap greedily on spaces
        toks = []
        for t, b, sz, spc in para["runs"]:
            for piece in re.split(r'(\s+)', t):
                if piece:
                    toks.append((piece, b, sz, spc))
        cur_w, cur_h, line_toks = 0.0, 0.0, []
        def push(tw_line, h, toks_):
            lines.append((tw_line, h, para["algn"], para, toks_))
        for tok in toks:
            tw = width_in(tok[0], tok[1], tok[2], tok[3])
            if wrap and line_toks and not tok[0].isspace() and cur_w + tw > box_w + 0.01:
                # trailing spaces don't count
                tw_line = cur_w - sum(width_in(x[0], x[1], x[2], x[3]) for x in line_toks[-1:] if x[0].isspace())
                push(tw_line, cur_h, line_toks)
                cur_w, cur_h, line_toks = 0.0, 0.0, []
            if not line_toks and tok[0].isspace():
                continue
            line_toks.append(tok)
            cur_w += tw
            cur_h = max(cur_h, tok[2] * LINE * para["ln"] / 72)
        tw_line = cur_w - sum(width_in(x[0], x[1], x[2], x[3]) for x in line_toks[-1:] if x[0].isspace())
        push(tw_line, cur_h or para["endsz"] * LINE / 72, line_toks)
    h = 0.0
    for i, para in enumerate(paras):
        pl = [ln for ln in lines if ln[3] is para]
        h += sum(ln[1] for ln in pl) + (para["bef"] if i else 0) / 72 + (para["aft"] / 72 if i < len(paras) - 1 else 0)
    return lines, h, max([ln[0] for ln in lines] or [0])


SHAPE_RE = re.compile(r'<p:(sp|pic|graphicFrame|cxnSp)>(.*?)</p:\1>', flags=re.S)


def shapes_of(xml, layout_ph):
    out = []
    for kind, body in SHAPE_RE.findall(xml):
        name = attr(re.search(r'<p:cNvPr[^>]*>', body).group(0), "name", "")
        descr = attr(re.search(r'<p:cNvPr[^>]*>', body).group(0), "descr", "")
        m = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>\s*<a:ext cx="(\d+)" cy="(\d+)"/>', body)
        if m:
            x, y, w, h = (int(v) / EMU for v in m.groups())
        else:
            ph = re.search(r'<p:ph[^>]*idx="(\d+)"', body)
            if not ph or ph.group(1) not in layout_ph:
                continue
            x, y, w, h = layout_ph[ph.group(1)]
        sh = {"kind": kind, "name": name, "descr": descr, "x": x, "y": y, "w": w, "h": h, "text": None}
        hit = re.search(r'<a:hlinkClick', body)
        sh["link"] = bool(hit)
        nofill = "<a:noFill/>" in body.split("<a:ln")[0] if "<p:spPr" in body else True
        alpha = re.search(r'<a:solidFill><a:srgbClr val="[0-9A-F]+"><a:alpha val="0"/>', body)
        sh["invisible"] = bool(alpha) or (kind == "sp" and nofill and "<a:t>" not in body and "<a:ln" not in body)
        tx = re.search(r'<p:txBody>(.*?)</p:txBody>', body, flags=re.S)
        if tx and "<a:t>" in tx.group(1):
            bp = re.search(r'<a:bodyPr[^>]*>', tx.group(1)).group(0)
            ins = [int(attr(bp, k, d)) / EMU for k, d in (("lIns", 91440), ("tIns", 45720), ("rIns", 91440), ("bIns", 45720))]
            sh["ins"] = ins
            sh["anchor"] = attr(bp, "anchor", "t")
            sh["wrap"] = attr(bp, "wrap", "square") != "none"
            sh["paras"] = parse_paragraphs(tx.group(1), 18)
            sh["text"] = " / ".join("".join(r[0] for r in p["runs"]) for p in sh["paras"])
            sizes = [r[2] for p in sh["paras"] for r in p["runs"]]
            sh["minpt"] = min(sizes) if sizes else 18
        out.append(sh)
    return out


def ink_box(sh):
    """Actual extent of the text inside its box (inches)."""
    l, t, r, b = sh["ins"]
    bw = sh["w"] - l - r
    lines, th, mw = layout_text(sh["paras"], bw, sh["wrap"])
    sh["_lines"], sh["_th"] = lines, th
    algns = {ln[2] for ln in lines if ln[0] > 0}
    if algns <= {"ctr"}:
        x0 = sh["x"] + l + (bw - mw) / 2
    elif algns <= {"r"}:
        x0 = sh["x"] + sh["w"] - r - mw
    else:
        x0 = sh["x"] + l
    bh = sh["h"] - t - b
    if sh["anchor"] == "ctr":
        y0 = sh["y"] + t + (bh - th) / 2
    elif sh["anchor"] == "b":
        y0 = sh["y"] + sh["h"] - b - th
    else:
        y0 = sh["y"] + t
    # vertical ink from real glyph bounds of the first and last lines
    def glyph_v(line):
        toks = [t for t in line[4] if not t[0].isspace()]
        if not toks:
            return None
        tops, bots = [], []
        for t in toks:
            bb = font(t[1], t[2]).getbbox(t[0], anchor="la")
            tops.append(bb[1] / 4 / 72); bots.append(bb[3] / 4 / 72)
        return min(tops), max(bots)
    first, last = glyph_v(lines[0]) if lines else None, glyph_v(lines[-1]) if lines else None
    ink_top = y0 + (first[0] if first else 0)
    ink_bot = y0 + th - lines[-1][1] + (last[1] if last else lines[-1][1]) if lines else y0 + th
    return (x0, ink_top, x0 + mw, ink_bot), th, bh, mw, bw


def inter(a, b):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    return (w, h) if w > 0 and h > 0 else None


def main(path):
    z = zipfile.ZipFile(path)
    names = z.namelist()
    pres = z.read("ppt/presentation.xml").decode()
    rels = z.read("ppt/_rels/presentation.xml.rels").decode()
    rid2t = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
    rid2t.update({k: v for v, k in re.findall(r'Target="([^"]+)"[^>]*Id="(rId\d+)"', rels)})
    order = [rid2t[r] for r in re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', pres)]
    issues = []
    for n, target in enumerate(order, 1):
        f = "ppt/" + target.lstrip("/").replace("ppt/", "")
        xml = z.read(f).decode()
        srels = z.read(f.replace("slides/", "slides/_rels/") + ".rels").decode()
        lay = re.search(r'Target="\.\./slideLayouts/(slideLayout\d+\.xml)"', srels).group(1)
        lxml = z.read("ppt/slideLayouts/" + lay).decode()
        layout_ph = {}
        for body in re.findall(r'<p:sp>(.*?)</p:sp>', lxml, flags=re.S):
            ph = re.search(r'<p:ph[^>]*idx="(\d+)"', body)
            m = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>\s*<a:ext cx="(\d+)" cy="(\d+)"/>', body)
            if ph and m:
                layout_ph[ph.group(1)] = tuple(int(v) / EMU for v in m.groups())
        hidden = 'show="0"' in xml[:400]
        tag = f"slide {n}{' (hidden)' if hidden else ''}"
        shs = shapes_of(xml, layout_ph)
        if not any(s["name"] == "!!badge" for s in shs):
            issues.append(f"{tag}: UTAS logo badge missing")
        texts, marks = [], []
        for s in shs:
            if s["name"] in IGNORE:
                continue
            if s["kind"] == "pic" and (s["descr"].startswith("/") or len(s["descr"]) > 300 or not s["descr"]):
                issues.append(f"{tag}: image {s['name']} description is a path/blob/empty")
            box = (s["x"], s["y"], s["x"] + s["w"], s["y"] + s["h"])
            if s["text"] is None:
                if s["kind"] in ("sp", "pic") and not s["invisible"] and s["w"] < 0.5 and s["h"] < 0.5 and s["name"] != "!!badge":
                    marks.append((s, box))
                if s["kind"] != "pic" or not s["name"].startswith("!!map"):
                    if box[0] < -0.01 or box[1] < -0.01 or box[2] > SW + 0.01 or box[3] > SH + 0.01:
                        issues.append(f"{tag}: {s['name']} outside slide {tuple(round(v, 2) for v in box)}")
                if s["name"] != "!!badge" and not s["invisible"] and inter(box, BADGE_ZONE) and s["kind"] != "pic":
                    issues.append(f"{tag}: {s['name']} intrudes on the logo zone")
                if s["name"] not in FOOTER_OK and box[3] > FOOTER_Y + 0.02 and not s["invisible"] and s["kind"] != "pic":
                    issues.append(f"{tag}: {s['name']} reaches the footer band (bottom {box[3]:.2f})")
                continue
            ink, th, bh, mw, bw = ink_box(s)
            s["ink"] = ink
            texts.append(s)
            label = f"{s['name']} '{s['text'][:48]}'"
            if s["minpt"] < MIN_PT:
                issues.append(f"{tag}: {label} uses {s['minpt']}pt (< {MIN_PT})")
            box_bot = s["y"] + s["h"] - s["ins"][3]
            if (len(s["_lines"]) > 1 and th > bh + 0.06) or ink[3] > box_bot + 0.06:
                issues.append(f"{tag}: {label} overflows its box: needs {th:.2f}in, has {bh:.2f}in "
                              f"({len(s['_lines'])} lines)")
            # orphan: a wrapped paragraph whose last line is a single short word
            for para in (s["paras"] if len(s["paras"]) < 6 else []):  # long lists (references) wrap freely
                pl = [ln for ln in s["_lines"] if ln[3] is para]
                words = [t for t in pl[-1][4] if not t[0].isspace()] if pl else []
                size = max([r[2] for r in para["runs"]] or [0])
                if len(pl) >= 2 and len(words) == 1 and size >= 13 and len(words[0][0]) <= 12:
                    issues.append(f"{tag}: {label} orphan word '{words[0][0]}' on its last line")
            if not s["wrap"] and mw > bw + 0.05:
                issues.append(f"{tag}: {label} too wide ({mw:.2f} > {bw:.2f})")
            if ink[0] < 0.2 or ink[2] > SW - 0.2 or ink[1] < 0.15 or ink[3] > SH - 0.12:
                issues.append(f"{tag}: {label} too close to the slide edge {tuple(round(v, 2) for v in ink)}")
            if s["name"] not in ("!!footer", "!!num") and inter(ink, BADGE_ZONE):
                issues.append(f"{tag}: {label} intrudes on the logo zone")
            if s["name"] not in FOOTER_OK and "sldNum" not in s["name"] and ink[3] > FOOTER_Y and s["name"] != "":
                issues.append(f"{tag}: {label} reaches the footer band (bottom {ink[3]:.2f})")
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                a, b = texts[i], texts[j]
                # a label sitting on its own pill/card is fine: only check text vs text
                ov = inter(a["ink"], b["ink"])
                hx = min(a["ink"][2], b["ink"][2]) - max(a["ink"][0], b["ink"][0])
                gap = max(a["ink"][1], b["ink"][1]) - min(a["ink"][3], b["ink"][3])
                if not ov and hx > 0.1 and 0 <= gap < 0.04:
                    issues.append(f"{tag}: tight spacing {a['name']} '{a['text'][:30]}' / {b['name']} '{b['text'][:30]}' "
                                  f"(gap {gap:.3f}in)")
                if ov and min(ov) > 0.02:
                    if (a["x"], a["y"], a["w"], a["h"]) == (b["x"], b["y"], b["w"], b["h"]) and (a["link"] or b["link"]):
                        continue
                    issues.append(f"{tag}: text collision {a['name']} '{a['text'][:30]}' x {b['name']} '{b['text'][:30]}' "
                                  f"({ov[0]:.2f}x{ov[1]:.2f}in)")
        for t in texts:
            for mk, mb in marks:
                ov = inter(t["ink"], mb)
                inside = mb[0] <= t["x"] and mb[1] <= t["y"] and mb[2] >= t["x"] + t["w"] and mb[3] >= t["y"] + t["h"]
                if ov and min(ov) > 0.03 and not inside:
                    issues.append(f"{tag}: text {t['name']} '{t['text'][:30]}' covers marker {mk['name']} ({ov[0]:.2f}x{ov[1]:.2f}in)")
    for i in issues:
        print(i)
    print(f"{len(issues)} issue(s) across {len(order)} slides")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "out/deck.pptx"))
