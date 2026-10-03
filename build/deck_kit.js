// Shared slide helpers and the motion language for the Kuwait deck.
const { HEX, W, H, MX, A } = require("./deck_base");

// Motion language (ms). Everything enters after the transition with a decelerated rise or a subtle scale,
// staggered in small steps; charts reveal in the reading direction; ambient light drifts slowly.
const T = { start: 250, step: 120, text: 800, card: 900, hero: 1200, chart: 2200 };
// Reveal progress of a decelerated wipe: p(t) = 1 - (1 - t)^2  ->  time for progress p
const wipeTime = (p, dur) => dur * (1 - Math.sqrt(Math.max(0, 1 - p)));

// Typography: curly apostrophes, and non-breaking spaces that keep ≈ < > glued to their numbers
const typo = (t) => t.replace(/(\w)'(\w)/g, "$1\u2019$2").replace(/([≈<>]) ?(?=[\d$])/g, "$1\u00a0");
const typoRuns = (str) => (typeof str === "string" ? typo(str) : str.map((r) => Object.assign({}, r, { text: typo(r.text) })));
// speaker notes: also en dashes in numeric ranges (2011-2013 -> 2011–2013)
const typoNotes = (t) => typo(t).replace(/(\d)-(\d)/g, "$1\u2013$2");

// Arial Bold advance widths (1/1000 em) for centring icon + label pairs
const AB = Object.assign({}, ...[..."abcdeghknopqsuvxy"].map((c) => ({ [c]: "bdghnopqu".includes(c) ? 611 : 556 })),
  { f: 333, i: 278, j: 278, l: 278, m: 889, r: 389, t: 333, w: 778, z: 500, " ": 278, "&": 722, "-": 333, "·": 278 },
  ...[..."ABCDHKNRUX"].map((c) => ({ [c]: "X".includes(c) ? 667 : 722 })),
  { E: 667, F: 611, G: 778, I: 278, J: 556, L: 611, M: 833, O: 778, P: 667, Q: 778, S: 667, T: 611, V: 667, W: 944, Y: 667, Z: 611 });
const boldWidth = (t, pt) => [...t].reduce((a, c) => a + (AB[c] || 600), 0) / 1000 * pt / 72;

function createKit(state) {
  const { pres, C, anim } = state;
  let SID = "", N = 0;
  const kit = {};
  kit.begin = (sid) => { SID = sid; N = 0; };
  kit.sid = () => SID;
  kit.nm = (tag = "o") => `${SID}_${tag}_${++N}`;

  kit.text = (s, str, o) => {
    const name = o.name || kit.nm("t"); delete o.name;
    s.addText(typoRuns(str), Object.assign({ margin: 0, isTextBox: true, fontFace: "Arial", color: C.text1, valign: "top", objectName: name }, o));
    return name;
  };
  kit.shape = (s, type, o) => {
    const name = o.name || kit.nm("s"); delete o.name;
    s.addShape(type, Object.assign({ line: { type: "none" }, objectName: name }, o));
    return name;
  };
  kit.img = (s, data, o) => {
    const name = o.name || kit.nm("i"); delete o.name;
    // altText is always set: pptxgenjs would otherwise write the file path (or base64 data) into the description
    s.addImage(Object.assign(data.startsWith("image/") ? { data } : { path: data }, { objectName: name, altText: "Decorative graphic" }, o));
    return name;
  };
  kit.glow = (color, size = 14, opacity = 0.65) => ({ type: "outer", color, blur: size, offset: 0, angle: 90, opacity });

  // ---- motion presets ----
  const m = {};
  m.rise = (n, t, dur = T.text, dy = 0.025) => anim.add(n, "rise", t, dur, { dy });
  m.drop = (n, t, dur = T.text, dy = 0.02) => anim.add(n, "drop", t, dur, { dy });
  m.fade = (n, t, dur = T.text) => anim.add(n, "fade", t, dur);
  m.appear = (n, t) => anim.add(n, "appear", t, 1);
  m.scale = (n, t, dur = T.card, s0 = 0.94) => anim.add(n, "scale", t, dur, { s0 });
  m.land = (n, t, dur = 700, s0 = 1.6) => anim.add(n, "land", t, dur, { s0 });
  m.wipe = (n, dir, t, dur = T.chart) => anim.add(n, "wipe" + dir, t, dur);
  m.wheel = (n, t, dur = 1500) => anim.add(n, "wheel", t, dur);
  m.glide = (n, t, dur, dx, dy = 0) => anim.add(n, "glide", t, dur, { dx, dy });
  m.drift = (n, t, dur, dx, dy) => anim.add(n, "drift", t, dur, { dx, dy });
  m.breathe = (n, t, dur = 1800, s = 1.15) => anim.add(n, "breathe", t, dur, { s });
  kit.m = m;

  // ---- persistent chrome (morph keeps these still between slides) ----
  kit.header = (s, kicker, title) => {
    s.addText(typo(kicker), { placeholder: "kicker" });
    s._slideObjects[s._slideObjects.length - 1].options.objectName = "!!kicker";
    s.addText(typo(title), { placeholder: "title" });
    s._slideObjects[s._slideObjects.length - 1].options.objectName = "!!title";
  };
  kit.source = (s, str) => kit.text(s, str, { x: MX, y: 6.5, w: 10.6, h: 0.3, fontSize: 12, color: C.text2, valign: "middle", name: "!!source" });
  kit.homeButton = (s, target) => {
    const x = W - MX - 1.1, y = 6.86, d = 0.42;
    kit.shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, rectRadius: 0.1, fill: { color: HEX.card2 }, name: "!!home_bg" });
    kit.img(s, state.ic("TbLayoutGrid", HEX.text2), { x: x + 0.09, y: y + 0.09, w: 0.24, h: 0.24, name: "!!home_ic" });
    kit.shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, rectRadius: 0.1, fill: { color: "000000", transparency: 100 },
      hyperlink: { slide: target, tooltip: "Back to contents" }, name: "!!home_hit" });
  };
  // A pill button: visible pill + label + transparent hit target carrying the link
  // o.icon = [iconName, colour, "left" | "right"]: an icon beside the label, the pair centred in the pill
  kit.button = (s, label, x, y, w, h, target, o = {}) => {
    const bg = kit.shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: h / 2, fill: { color: o.fill || HEX.card2 },
      line: o.line ? { color: o.line, width: 1.25 } : { type: "none" }, name: o.name ? o.name + "_bg" : undefined });
    const fs = o.fontSize || 15;
    let tx;
    if (o.icon) {
      const [ico, col, side] = o.icon, is = h * 0.5, gap = 0.08;
      const tw = boldWidth(label, fs);
      const x0 = x + (w - (tw + gap + is)) / 2;
      const ix = side === "left" ? x0 : x0 + tw + gap, lx = side === "left" ? x0 + is + gap : x0;
      kit.img(s, state.ic(ico, col), { x: ix, y: y + (h - is) / 2, w: is, h: is, name: o.name ? o.name + "_ic" : undefined });
      // the label hugs the icon, so the gap is exact even though the label width above is only estimated
      const geom = side === "left" ? { x: lx, y, w: tw + 0.2, h, align: "left" } : { x: lx - 0.2, y, w: tw + 0.2, h, align: "right" };
      tx = kit.text(s, label, Object.assign(geom, { fontSize: fs, bold: true, valign: "middle", color: o.color || C.text1,
        name: o.name ? o.name + "_tx" : undefined }));
    } else {
      tx = kit.text(s, label, { x, y, w, h, fontSize: fs, bold: true, align: "center", valign: "middle",
        color: o.color || C.text1, name: o.name ? o.name + "_tx" : undefined });
    }
    if (target != null) kit.shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: h / 2, fill: { color: "000000", transparency: 100 },
      hyperlink: { slide: target, tooltip: o.tooltip || label }, name: o.name ? o.name + "_hit" : undefined });
    return [bg, tx];
  };

  // ---- ambient light: two soft orbs that glide between slides (morph) and drift while a slide is shown ----
  const ORB = { amber: A("orb_amber.png"), gold: A("orb_gold.png"), blue: A("orb_blue.png"), red: A("orb_red.png") };
  kit.ambient = (s, a, b, opts = {}) => {
    // a/b = [color, cx, cy, diameter]  (inches; centre position)
    [[a, "!!orbA", 0.035, -0.03, 13000], [b, "!!orbB", -0.03, 0.025, 15000]].forEach(([o, name, dx, dy, dur]) => {
      if (!o) return;
      const [col, cx, cy, d] = o;
      kit.img(s, ORB[col], { x: cx - d / 2, y: cy - d / 2, w: d, h: d, name, altText: "Decorative background light" });
      m.drift(name, 0, opts.slow ? dur * 1.4 : dur, dx, dy);
      if (opts.flicker && name === "!!orbA") m.breathe(name, 0, 2600, 1.12);
    });
  };
  // badge + footer, added after the slide's content so they sit on top of everything
  kit.chrome = (s, master, no) => {
    if (master !== "Title") {
      kit.text(s, "Kuwait Oil & Gas  ·  EGCH2230", { x: MX, y: 6.92, w: 6, h: 0.32, fontSize: 12, color: C.text2,
        valign: "middle", name: "!!footer" });
      kit.text(s, String(no), { x: W - MX - 0.6, y: 6.92, w: 0.6, h: 0.32, fontSize: 12, color: C.text2, align: "right",
        valign: "middle", name: "!!num" });
    }
    const b = master === "Title" ? state.chrome.badgeTitle : state.chrome.badge;
    kit.img(s, b.path, { x: b.x, y: b.y, w: b.w, h: b.h, name: "!!badge", altText: "University of Technology and Applied Sciences, Salalah" });
  };
  kit.T = T;
  kit.wipeTime = wipeTime;
  return kit;
}

module.exports = { createKit, T, wipeTime, typo, typoNotes };
