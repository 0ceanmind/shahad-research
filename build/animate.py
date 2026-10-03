"""Post-process a pptxgenjs deck: Morph transitions, choreographed auto-playing builds, ambient loops,
click-triggered highlights, hidden slides, link highlighting and media de-duplication.

Usage: python animate.py in.pptx anim.json out.pptx

anim.json = {"slides": {"<n>": {
    "transition": "morph" | "fade" | "none", "dur": 1400, "advClick": true, "hidden": false, "partner": <n or null>,
    "roundCaps": [names of line shapes to draw with round caps], "hang": {text shape name: hanging indent in EMU},
    "anims":    [{"name", "effect", "delay", "dur", ...effect params}],
    "triggers": [{"trigger": name, "targets": [{"name", "effect", "delay", "dur", ...}]}]
}}}

Effects (entrance unless noted):
  appear | fade | rise(dy) | drop(dy) | scale(s0) | land(s0) | wipeL/wipeR/wipeT/wipeB | wheel | glide(dx, dy)
  drift(dx, dy)  - ambient motion loop (ease in-out, auto-reverse, repeats until the slide ends)
  travel(path)   - looping journey along a motion path (fades in/out each lap; pair with a fade entrance)
  breathe(s)     - ambient scale loop (auto-reverse, repeats until the slide ends)
  pulse(s)       - one-shot emphasis (grow then shrink back)
  fadeOut        - exit
Objects are matched by the cNvPr name pptxgenjs writes from `objectName`.
"""
import hashlib
import json
import re
import sys
import zipfile

P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
P159 = "http://schemas.microsoft.com/office/powerpoint/2015/09/main"
MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"
EASE_OUT = ' decel="100000"'
EASE_INOUT = ' accel="50000" decel="50000"'


class Ids:
    def __init__(self):
        self.n = 0

    def __call__(self):
        self.n += 1
        return self.n


def tgt(spid):
    return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


def set_vis(ids, spid, val="visible", delay=0):
    return (f'<p:set><p:cBhvr><p:cTn id="{ids()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{delay}"/>'
            f'</p:stCondLst></p:cTn>{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName>'
            f'</p:attrNameLst></p:cBhvr><p:to><p:strVal val="{val}"/></p:to></p:set>')


def fx(ids, spid, dur, flt, direction="in", ease=EASE_OUT):
    return (f'<p:animEffect transition="{direction}" filter="{flt}"><p:cBhvr><p:cTn id="{ids()}" dur="{dur}"{ease}/>'
            f'{tgt(spid)}</p:cBhvr></p:animEffect>')


def prop(ids, spid, dur, attr, frm, to, ease=EASE_OUT):
    def val(v):
        return f'<p:fltVal val="{v}"/>' if isinstance(v, (int, float)) else f'<p:strVal val="{v}"/>'
    return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{ids()}" dur="{dur}" fill="hold"{ease}/>'
            f'{tgt(spid)}<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:tavLst><p:tav tm="0"><p:val>{val(frm)}</p:val></p:tav><p:tav tm="100000"><p:val>{val(to)}'
            f'</p:val></p:tav></p:tavLst></p:anim>')


def motion(ids, spid, dur, path, ease=EASE_OUT):
    return (f'<p:animMotion origin="layout" path="{path}" pathEditMode="relative" ptsTypes="">'
            f'<p:cBhvr><p:cTn id="{ids()}" dur="{dur}" fill="hold"{ease}/>{tgt(spid)}'
            f'<p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:rCtr x="0" y="0"/></p:animMotion>')


def scale_by(ids, spid, dur, s, ease=EASE_INOUT):
    v = int(round(s * 100000))
    return (f'<p:animScale><p:cBhvr><p:cTn id="{ids()}" dur="{dur}" fill="hold"{ease}/>{tgt(spid)}</p:cBhvr>'
            f'<p:by x="{v}" y="{v}"/></p:animScale>')


WIPES = {"wipeL": (8, "wipe(left)"), "wipeB": (4, "wipe(down)"), "wipeR": (2, "wipe(right)"), "wipeT": (1, "wipe(up)")}
ENTRANCE = {"appear", "fade", "rise", "drop", "scale", "land", "wheel", "glide"} | set(WIPES)


def effect_xml(ids, spid, a, node_type, grp):
    e, dur, delay = a["effect"], int(a.get("dur", 800)), int(a.get("delay", 0))
    extra = ""
    cls, preset, sub = "entr", 10, 0
    if e == "fade":
        body = set_vis(ids, spid) + fx(ids, spid, dur, "fade")
    elif e == "appear":
        preset = 1
        body = set_vis(ids, spid)
    elif e in ("rise", "drop"):
        dy = float(a.get("dy", 0.03)) * (1 if e == "rise" else -1)
        preset = 42
        body = (set_vis(ids, spid) + fx(ids, spid, int(dur * 0.8), "fade")
                + prop(ids, spid, dur, "ppt_x", "#ppt_x", "#ppt_x")
                + prop(ids, spid, dur, "ppt_y", f"#ppt_y+{dy:.4f}", "#ppt_y"))
    elif e in ("scale", "land"):
        s0 = float(a.get("s0", 0.92 if e == "scale" else 1.35))
        preset, sub = 53, 16
        body = (set_vis(ids, spid)
                + prop(ids, spid, dur, "ppt_w", f"#ppt_w*{s0:.3f}", "#ppt_w")
                + prop(ids, spid, dur, "ppt_h", f"#ppt_h*{s0:.3f}", "#ppt_h")
                + fx(ids, spid, int(dur * 0.7), "fade"))
    elif e in WIPES:
        preset, (sub, flt) = 22, WIPES[e]
        body = set_vis(ids, spid) + fx(ids, spid, dur, flt)
    elif e == "wheel":
        preset, sub = 21, 1
        body = set_vis(ids, spid) + fx(ids, spid, dur, "wheel(1)")
    elif e == "glide":
        preset = 2
        dx, dy = float(a.get("dx", -0.2)), float(a.get("dy", 0))
        body = (set_vis(ids, spid) + fx(ids, spid, int(dur * 0.5), "fade")
                + motion(ids, spid, dur, f"M {dx:.4f} {dy:.4f} L 0 0 E"))
    elif e == "drift":
        cls, preset = "path", 0
        dx, dy = float(a.get("dx", 0.02)), float(a.get("dy", -0.02))
        body = motion(ids, spid, dur, f"M 0 0 L {dx:.4f} {dy:.4f} E", ease=EASE_INOUT)
        extra = ' repeatCount="indefinite" autoRev="1"'
    elif e == "travel":
        # looping journey along a supplied path (slide fractions): fade in, glide, fade out, repeat
        cls, preset = "path", 0
        fin = min(500, dur // 6)
        body = (set_vis(ids, spid) + fx(ids, spid, fin, "fade", ease="")
                + motion(ids, spid, dur, a["path"], ease=' accel="15000" decel="15000"')
                + f'<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="{ids()}" dur="{fin}">'
                  f'<p:stCondLst><p:cond delay="{dur - fin}"/></p:stCondLst></p:cTn>{tgt(spid)}</p:cBhvr></p:animEffect>'
                + set_vis(ids, spid, "hidden", dur - 1))
        extra = ' repeatCount="indefinite"'
    elif e == "breathe":
        cls, preset = "emph", 6
        body = scale_by(ids, spid, dur, float(a.get("s", 1.12)))
        extra = ' repeatCount="indefinite" autoRev="1"'
    elif e == "pulse":
        cls, preset = "emph", 6
        body = scale_by(ids, spid, dur, float(a.get("s", 1.5)))
        extra = ' autoRev="1"'
    elif e == "fadeOut":
        cls = "exit"
        body = fx(ids, spid, dur, "fade", "out", ease="") + set_vis(ids, spid, "hidden", max(dur - 1, 0))
    else:
        raise ValueError(e)
    return (f'<p:par><p:cTn id="{ids()}" presetID="{preset}" presetClass="{cls}" presetSubtype="{sub}" '
            f'fill="hold" grpId="{grp}" nodeType="{node_type}"{extra}><p:stCondLst><p:cond delay="{delay}"/>'
            f'</p:stCondLst><p:childTnLst>{body}</p:childTnLst></p:cTn></p:par>')


def build_timing(spec, shapes):
    ids = Ids()
    grp_count, bld = {}, []

    def grp_for(spid, kind):
        g = grp_count.get(spid, 0)
        grp_count[spid] = g + 1
        if kind == "sp":
            bld.append(f'<p:bldP spid="{spid}" grpId="{g}" animBg="1"/>')
        elif kind == "graphicFrame":
            bld.append(f'<p:bldGraphic spid="{spid}" grpId="{g}"><p:bldAsOne/></p:bldGraphic>')
        return g

    def lookup(name):
        if name not in shapes:
            raise KeyError(f"shape '{name}' not found; have {sorted(shapes)[:40]}...")
        return shapes[name]

    anims, triggers = spec.get("anims", []), spec.get("triggers", [])
    if not anims and not triggers:
        return ""
    root_id, main_id = ids(), ids()
    main = ""
    if anims:
        click_id, grp_id = ids(), ids()
        effects = ""
        for i, a in enumerate(sorted(anims, key=lambda a: a.get("delay", 0))):
            spid, kind = lookup(a["name"])
            effects += effect_xml(ids, spid, a, "afterEffect" if i == 0 else "withEffect", grp_for(spid, kind))
        main = (f'<p:par><p:cTn id="{click_id}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/>'
                f'<p:cond evt="onBegin" delay="0"><p:tn val="{main_id}"/></p:cond></p:stCondLst><p:childTnLst>'
                f'<p:par><p:cTn id="{grp_id}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
                f'<p:childTnLst>{effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    seqs = (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{main_id}" dur="indefinite" nodeType="mainSeq">'
            f'<p:childTnLst>{main}</p:childTnLst></p:cTn>'
            f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
            f'</p:seq>')
    for trig in triggers:
        tspid, _ = lookup(trig["trigger"])
        seq_id, p1, p2 = ids(), ids(), ids()
        effects = ""
        for j, t in enumerate(trig["targets"]):
            spid, kind = lookup(t["name"])
            effects += effect_xml(ids, spid, t, "clickEffect" if j == 0 else "withEffect", grp_for(spid, kind))
        cond = f'<p:cond evt="onClick" delay="0">{tgt(tspid)}</p:cond>'
        seqs += (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{seq_id}" restart="whenNotActive" fill="hold" '
                 f'evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst>{cond}</p:stCondLst>'
                 f'<p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>'
                 f'<p:par><p:cTn id="{p1}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                 f'<p:par><p:cTn id="{p2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                 f'{effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
                 f'<p:nextCondLst>{cond}</p:nextCondLst></p:seq>')
    timing = (f'<p:timing><p:tnLst><p:par><p:cTn id="{root_id}" dur="indefinite" restart="never" nodeType="tmRoot">'
              f'<p:childTnLst>{seqs}</p:childTnLst></p:cTn></p:par></p:tnLst>')
    if bld:
        timing += f'<p:bldLst>{"".join(bld)}</p:bldLst>'
    return timing + '</p:timing>'


def transition_xml(spec):
    kind, dur = spec.get("transition", "fade"), int(spec.get("dur", 1200))
    adv = '' if spec.get("advClick", True) else ' advClick="0"'
    if kind == "morph":
        return (f'<mc:AlternateContent xmlns:mc="{MC}"><mc:Choice xmlns:p159="{P159}" Requires="p159">'
                f'<p:transition spd="slow" p14:dur="{dur}"{adv}><p159:morph option="byObject"/></p:transition>'
                f'</mc:Choice><mc:Fallback><p:transition spd="slow"{adv}><p:fade/></p:transition></mc:Fallback>'
                f'</mc:AlternateContent>')
    if kind == "none":
        return f'<p:transition{adv}/>' if adv else ""
    return f'<p:transition spd="slow" p14:dur="{dur}"{adv}><p:fade/></p:transition>'


SHAPE_RE = re.compile(r'<p:(sp|pic|graphicFrame)>\s*<p:nv(?:Sp|Pic|GraphicFrame)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"')


def shape_names(xml):
    shapes = {}
    for kind, spid, name in SHAPE_RE.findall(xml):
        shapes.setdefault(name, (spid, kind))
    return shapes


def process_slide(xml, spec):
    ids = re.findall(r'<p:cNvPr id="(\d+)"', xml)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        raise ValueError(f"duplicate shape ids {dup}")
    names = [n for _, _, n in SHAPE_RE.findall(xml)]
    dupn = sorted({n for n in names if names.count(n) > 1 and n})
    if dupn:
        raise ValueError(f"duplicate shape names {dupn}")
    shapes = shape_names(xml)
    if 'xmlns:p14=' not in xml:
        xml = xml.replace('<p:sld ', f'<p:sld xmlns:p14="{P14}" ', 1)
    if spec.get("hidden"):
        xml = xml.replace('<p:sld ', '<p:sld show="0" ', 1)
    xml = re.sub(r'<p:transition[^>]*/>|<p:transition.*?</p:transition>', '', xml, flags=re.S)
    xml = re.sub(r'<p:timing>.*?</p:timing>', '', xml, flags=re.S)
    # click feedback on every slide-jump link
    xml = xml.replace('action="ppaction://hlinksldjump"/>', 'action="ppaction://hlinksldjump" highlightClick="1"/>')
    # round line caps and joins (pptxgenjs has no option for them), e.g. for joined route strokes
    for name in spec.get("roundCaps", []):
        m = re.search(r'<p:sp>\s*<p:nvSpPr>\s*<p:cNvPr id="\d+" name="' + re.escape(name) + r'".*?</p:sp>', xml, flags=re.S)
        if m:
            blk = re.sub(r'<a:ln w="(\d+)">', r'<a:ln w="\1" cap="rnd">', m.group(0), count=1)
            blk = blk.replace('</a:ln>', '<a:round/></a:ln>', 1) if '<a:round/>' not in blk else blk
            xml = xml.replace(m.group(0), blk, 1)
    # hanging indents (reference lists)
    for name, emu in spec.get("hang", {}).items():
        m = re.search(r'<p:sp>\s*<p:nvSpPr>\s*<p:cNvPr id="\d+" name="' + re.escape(name) + r'".*?</p:sp>', xml, flags=re.S)
        if m:
            blk = m.group(0).replace('indent="0" marL="0"', f'indent="-{emu}" marL="{emu}"')
            xml = xml.replace(m.group(0), blk, 1)
    extra = transition_xml(spec) + build_timing(spec, shapes)
    anchor = '</p:clrMapOvr>'
    xml = xml.replace(anchor, anchor + extra, 1) if anchor in xml else xml.replace('</p:cSld>', '</p:cSld>' + extra, 1)
    return xml


def morph_warnings(slides_xml, spec, links=None):
    """Entrance effects on objects that Morph already carries over from a slide that can precede this one
    (the previous shown slide, the declared partner, or any slide that hyperlinks here) fight each other."""
    out = []
    order = sorted(int(k) for k in spec)
    shown = [n for n in order if not spec[str(n)].get("hidden")]
    links = links or {}
    for n in order:
        s = spec[str(n)]
        if s.get("transition") != "morph":
            continue
        sources = set(links.get(n, ()))
        if s.get("partner") is not None:
            sources.add(s["partner"])
        prev = [m for m in shown if m < n]
        if prev and not s.get("hidden"):
            sources.add(prev[-1])
        for src in sorted(sources - {n}):
            carried = {k for k in shape_names(slides_xml[src]) if k.startswith("!!")}
            for a in s.get("anims", []):
                if a["name"] in carried and a["effect"] in ENTRANCE:
                    out.append(f"slide {n}: entrance '{a['effect']}' on morphing object {a['name']} (arriving from slide {src})")
    return out


def slide_links(items):
    """{target slide: [slides that hyperlink to it]}"""
    links = {}
    for f, b in items.items():
        m = re.match(r'ppt/slides/_rels/slide(\d+)\.xml\.rels$', f)
        if not m:
            continue
        for t in re.findall(r'Type="[^"]*/slide" Target="(?:\.\./slides/)?slide(\d+)\.xml"', b.decode("utf8")):
            links.setdefault(int(t), []).append(int(m.group(1)))
    return links


def main(src, spec_path, dst):
    spec = json.load(open(spec_path))["slides"]
    zin = zipfile.ZipFile(src)
    items = {i.filename: zin.read(i.filename) for i in zin.infolist()}
    infos = {i.filename: i for i in zin.infolist()}
    slides = {int(m.group(1)): items[f].decode("utf8") for f in items
              if (m := re.match(r'ppt/slides/slide(\d+)\.xml$', f))}
    for w in morph_warnings(slides, spec, slide_links(items)):
        print("WARN", w)
    for n, xml in slides.items():
        if str(n) in spec:
            items[f"ppt/slides/slide{n}.xml"] = process_slide(xml, spec[str(n)]).encode("utf8")
    # de-duplicate identical media (pptxgenjs embeds a copy per slide)
    media = {f: hashlib.sha1(b).hexdigest() for f, b in items.items() if f.startswith("ppt/media/")}
    canon, remap = {}, {}
    for f in sorted(media):
        h = media[f]
        if h in canon:
            remap[f.split("/")[-1]] = canon[h].split("/")[-1]
        else:
            canon[h] = f
    if remap:
        pat = re.compile(r'Target="(\.\./media/|/ppt/media/)([^"]+)"')
        for f in list(items):
            if f.endswith(".rels"):
                t = items[f].decode("utf8")
                t2 = pat.sub(lambda m: f'Target="{m.group(1)}{remap.get(m.group(2), m.group(2))}"', t)
                if t2 != t:
                    items[f] = t2.encode("utf8")
        for old in remap:
            items.pop(f"ppt/media/{old}", None)
    zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
    for f, b in items.items():
        zi = infos[f]
        zout.writestr(zi, b)
    zout.close()
    print(f"animated {len(spec)} slides, removed {len(remap)} duplicate media -> {dst}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
