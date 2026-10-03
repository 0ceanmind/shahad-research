"""Post-process a pptxgenjs deck: Morph transitions, auto-playing entrance builds,
click-to-reveal triggers and slide-jump links on named shapes.

Usage: python animate.py in.pptx anim.json out.pptx

anim.json = {"slides": {"<1-based slide no>": {
    "transition": "morph" | "fade",  "dur": 1400,
    "anims":    [{"name": objName, "effect": "fade|float|zoom|wipeL|wipeB|wipeR|wipeT",
                  "delay": ms, "dur": ms}],
    "triggers": [{"trigger": objName, "targets": [{"name": objName, "effect": "...", "dur": ms}]}]
}}}
Objects are matched by the cNvPr name pptxgenjs writes from `objectName`.
"""
import json
import re
import sys
import zipfile

P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"
P159 = "http://schemas.microsoft.com/office/powerpoint/2015/09/main"
MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"


class Ids:
    def __init__(self):
        self.n = 0

    def __call__(self):
        self.n += 1
        return self.n


def tgt(spid):
    return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


def set_visible(ids, spid):
    return (f'<p:set><p:cBhvr><p:cTn id="{ids()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/>'
            f'</p:stCondLst></p:cTn>{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName>'
            f'</p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>')


def anim_effect(ids, spid, dur, flt):
    return (f'<p:animEffect transition="in" filter="{flt}"><p:cBhvr><p:cTn id="{ids()}" dur="{dur}"/>'
            f'{tgt(spid)}</p:cBhvr></p:animEffect>')


def anim_prop(ids, spid, dur, attr, frm, to, ease=True):
    def val(v):
        return f'<p:fltVal val="{v}"/>' if isinstance(v, (int, float)) else f'<p:strVal val="{v}"/>'
    decel = ' decel="100000"' if ease else ''
    return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{ids()}" dur="{dur}" fill="hold"{decel}/>'
            f'{tgt(spid)}<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:tavLst><p:tav tm="0"><p:val>{val(frm)}</p:val></p:tav><p:tav tm="100000"><p:val>{val(to)}'
            f'</p:val></p:tav></p:tavLst></p:anim>')


WIPES = {"wipeL": (8, "wipe(left)"), "wipeB": (4, "wipe(down)"),
         "wipeR": (2, "wipe(right)"), "wipeT": (1, "wipe(up)")}


def effect_xml(ids, spid, effect, delay, dur, node_type, grp):
    """One entrance effect as a <p:par>."""
    if effect == "fade":
        preset, sub = 10, 0
        body = set_visible(ids, spid) + anim_effect(ids, spid, dur, "fade")
    elif effect == "float":          # Float In, subtle travel, ease-out
        preset, sub = 42, 0
        body = (set_visible(ids, spid) + anim_effect(ids, spid, dur, "fade")
                + anim_prop(ids, spid, dur, "ppt_x", "#ppt_x", "#ppt_x")
                + anim_prop(ids, spid, dur, "ppt_y", "#ppt_y+0.04", "#ppt_y"))
    elif effect == "zoom":           # scale up from 70 % with fade
        preset, sub = 53, 16
        body = (set_visible(ids, spid)
                + anim_prop(ids, spid, dur, "ppt_w", "#ppt_w*0.70", "#ppt_w")
                + anim_prop(ids, spid, dur, "ppt_h", "#ppt_h*0.70", "#ppt_h")
                + anim_effect(ids, spid, dur, "fade"))
    elif effect in WIPES:
        preset, (sub, flt) = 22, WIPES[effect]
        body = set_visible(ids, spid) + anim_effect(ids, spid, dur, flt)
    elif effect == "fadeOut":        # exit: fade, then hide
        preset, sub = 10, 0
        body = (anim_effect(ids, spid, dur, "fade").replace('transition="in"', 'transition="out"')
                + f'<p:set><p:cBhvr><p:cTn id="{ids()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{max(dur - 1, 0)}"/>'
                  f'</p:stCondLst></p:cTn>{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName>'
                  f'</p:attrNameLst></p:cBhvr><p:to><p:strVal val="hidden"/></p:to></p:set>')
        return (f'<p:par><p:cTn id="{ids()}" presetID="{preset}" presetClass="exit" presetSubtype="{sub}" '
                f'fill="hold" grpId="{grp}" nodeType="{node_type}"><p:stCondLst><p:cond delay="{delay}"/>'
                f'</p:stCondLst><p:childTnLst>{body}</p:childTnLst></p:cTn></p:par>')
    else:
        raise ValueError(effect)
    return (f'<p:par><p:cTn id="{ids()}" presetID="{preset}" presetClass="entr" presetSubtype="{sub}" '
            f'fill="hold" grpId="{grp}" nodeType="{node_type}"><p:stCondLst><p:cond delay="{delay}"/>'
            f'</p:stCondLst><p:childTnLst>{body}</p:childTnLst></p:cTn></p:par>')


def build_timing(spec, shapes):
    """shapes: name -> (spid, kind) ; kind in sp|pic|graphicFrame"""
    ids = Ids()
    grp_count = {}
    bld = []

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
            raise KeyError(f"shape '{name}' not found; have {sorted(shapes)}")
        return shapes[name]

    root_id = ids()
    main_id = ids()
    main = ""
    anims = spec.get("anims", [])
    if anims:
        click_id, grp_id = ids(), ids()
        effects = ""
        for i, a in enumerate(sorted(anims, key=lambda a: a.get("delay", 0))):
            spid, kind = lookup(a["name"])
            effects += effect_xml(ids, spid, a["effect"], a.get("delay", 0), a.get("dur", 700),
                                  "afterEffect" if i == 0 else "withEffect", grp_for(spid, kind))
        main = (f'<p:par><p:cTn id="{click_id}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/>'
                f'<p:cond evt="onBegin" delay="0"><p:tn val="{main_id}"/></p:cond></p:stCondLst><p:childTnLst>'
                f'<p:par><p:cTn id="{grp_id}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
                f'<p:childTnLst>{effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    seqs = (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{main_id}" dur="indefinite" nodeType="mainSeq">'
            f'<p:childTnLst>{main}</p:childTnLst></p:cTn>'
            f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
            f'</p:seq>')
    for trig in spec.get("triggers", []):
        tspid, _ = lookup(trig["trigger"])
        seq_id, p1, p2 = ids(), ids(), ids()
        effects = ""
        for j, t in enumerate(trig["targets"]):
            spid, kind = lookup(t["name"])
            effects += effect_xml(ids, spid, t["effect"], t.get("delay", 0), t.get("dur", 500),
                                  "clickEffect" if j == 0 else "withEffect", grp_for(spid, kind))
        cond = f'<p:cond evt="onClick" delay="0">{tgt(tspid)}</p:cond>'
        seqs += (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{seq_id}" restart="whenNotActive" fill="hold" '
                 f'evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst>{cond}</p:stCondLst>'
                 f'<p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>'
                 f'<p:par><p:cTn id="{p1}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                 f'<p:par><p:cTn id="{p2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                 f'{effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
                 f'<p:nextCondLst>{cond}</p:nextCondLst></p:seq>')
    if not anims and not spec.get("triggers"):
        return ""
    timing = (f'<p:timing><p:tnLst><p:par><p:cTn id="{root_id}" dur="indefinite" restart="never" nodeType="tmRoot">'
              f'<p:childTnLst>{seqs}</p:childTnLst></p:cTn></p:par></p:tnLst>')
    if bld:
        timing += f'<p:bldLst>{"".join(bld)}</p:bldLst>'
    return timing + '</p:timing>'


def transition_xml(spec):
    kind = spec.get("transition", "fade")
    dur = int(spec.get("dur", 1200))
    if kind == "morph":
        return (f'<mc:AlternateContent xmlns:mc="{MC}"><mc:Choice xmlns:p159="{P159}" Requires="p159">'
                f'<p:transition spd="slow" p14:dur="{dur}"><p159:morph option="byObject"/></p:transition>'
                f'</mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>'
                f'</mc:AlternateContent>')
    if kind == "none":
        return ""
    return f'<p:transition spd="slow" p14:dur="{dur}"><p:fade/></p:transition>'


SHAPE_RE = re.compile(r'<p:(sp|pic|graphicFrame)>\s*<p:nv(?:Sp|Pic|GraphicFrame)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"')


def process_slide(xml, spec):
    shapes = {}
    for kind, spid, name in SHAPE_RE.findall(xml):
        shapes.setdefault(name, (spid, kind))
    # namespaces for p14 on the root
    if 'xmlns:p14=' not in xml:
        xml = xml.replace('<p:sld ', f'<p:sld xmlns:p14="{P14}" ', 1)
    # drop any existing transition/timing pptxgenjs might have written
    xml = re.sub(r'<p:transition[^>]*/>|<p:transition.*?</p:transition>', '', xml, flags=re.S)
    xml = re.sub(r'<p:timing>.*?</p:timing>', '', xml, flags=re.S)
    extra = transition_xml(spec) + build_timing(spec, shapes)
    anchor = '</p:clrMapOvr>'
    if anchor in xml:
        xml = xml.replace(anchor, anchor + extra, 1)
    else:
        xml = xml.replace('</p:cSld>', '</p:cSld>' + extra, 1)
    return xml


def main(src, spec_path, dst):
    spec = json.load(open(spec_path))["slides"]
    zin = zipfile.ZipFile(src)
    zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
    for item in zin.infolist():
        data = zin.read(item.filename)
        m = re.match(r'ppt/slides/slide(\d+)\.xml$', item.filename)
        if m and m.group(1) in spec:
            data = process_slide(data.decode("utf8"), spec[m.group(1)]).encode("utf8")
        zout.writestr(item, data)
    zout.close()
    print(f"animated {len(spec)} slides -> {dst}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
