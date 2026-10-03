// Kuwait: A Century of Oil & Gas — EGCH2230 deck (pptxgenjs). Run: node build_deck.js
const fs = require("fs");
const path = require("path");
const { makePres, THEME, HEX, W, H, MX, A, Anim, CARD_R } = require("./deck_base");
const { createKit, typoNotes } = require("./deck_kit");
const { applyTheme } = require("./apply_theme.js");
const { icon } = require("./icons");

const OUT_DIR = process.env.DECK_OUT || path.join(__dirname, "out");
const OUT_RAW = path.join(OUT_DIR, "deck_raw.pptx");
const J = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, "data", f)));
const SERIES = J("series.json"), MKT = J("markets.json");

const ICONS = [
  ["TbHistory", HEX.oil], ["TbBuildingFactory2", HEX.oil], ["TbMapPin", HEX.oil], ["TbShip", HEX.oil], ["TbBooks", HEX.oil],
  ["TbArrowRight", HEX.text2], ["TbLayoutGrid", HEX.text2], ["TbDroplet", HEX.oil], ["TbFlame", HEX.gas], ["TbShip", HEX.text],
  ["TbBarrel", HEX.oil], ["TbChevronRight", HEX.text3], ["TbBuildingFactory", HEX.oil], ["TbFlask", HEX.oil],
  ["TbWorld", HEX.oil], ["TbCoin", HEX.oil], ["TbGasStation", HEX.oil], ["TbDroplet", HEX.gas], ["TbArrowLeft", HEX.text], ["TbArrowRight", HEX.bg],
];

const state = { ORDER: [], IDX: {}, ICON: {} };
state.ic = (n, c) => state.ICON[`${n}:${c}`];
const def = (id, master, fn, opts = {}) => state.ORDER.push({ id, master, fn, opts });
state.def = def;
let K, C, pres, anim; // set in main()
const ctx = () => ({ K, C, pres, anim });

const chartText = () => ({ catAxisLabelColor: HEX.text2, valAxisLabelColor: HEX.text2, catAxisLabelFontSize: 16,
  valAxisLabelFontSize: 16, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  dataLabelColor: HEX.text, dataLabelFontSize: 16, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true });
const chartFrame = () => ({ chartArea: { fill: { color: HEX.bg, transparency: 100 }, roundedCorners: false },
  plotArea: { fill: { color: HEX.bg, transparency: 100 } } });
state.chartText = chartText; state.chartFrame = chartFrame; state.MKT = MKT;

// =====================================================================
def("title", "Title", (s) => {
  const { text, img, m, ambient } = K;
  ambient(s, ["amber", 10.1, 4.0, 9.5], ["blue", 0.8, 0.5, 7]);
  img(s, A("drop.png"), { x: 7.95, y: 1.45, w: 4.35, h: 5.49, name: "!!drop", altText: "Oil drop illustration" });
  text(s, "EGCH2230  ·  PETROLEUM AND PETROCHEMICAL PROCESSING", { x: MX, y: 1.6, w: 7.6, h: 0.4, fontSize: 13,
    bold: true, color: C.accent1, charSpacing: 1.5, name: "ti_kick" });
  text(s, "Kuwait", { x: MX, y: 2.05, w: 7.2, h: 1.45, fontSize: 96, bold: true, name: "!!title" });
  text(s, "A Century of Oil & Gas", { x: MX, y: 3.48, w: 7.2, h: 0.75, fontSize: 40, name: "ti_sub" });
  text(s, "History  ·  Resources  ·  Reservoirs  ·  Markets", { x: MX, y: 4.3, w: 7.2, h: 0.45, fontSize: 20, color: C.text2, name: "ti_tag" });
  text(s, [
    { text: "Shahad Issa Obaid Alghriabi", options: { fontSize: 24, bold: true, color: C.text1, breakLine: true } },
    { text: "University of Technology and Applied Sciences · Salalah", options: { fontSize: 16, color: C.text2 } },
  ], { x: MX, y: 5.45, w: 7.4, h: 0.9, name: "ti_name", paraSpaceAfter: 4 });
  m.scale("!!drop", 0, 1800, 0.86); m.drift("!!drop", 1800, 3800, 0, -0.014);
  m.fade("ti_kick", 450, 900); m.rise("!!title", 600, 1100, 0.03); m.rise("ti_sub", 850, 1000); m.fade("ti_tag", 1150, 900);
  m.rise("ti_name", 1400, 900);
  s.addNotes("Welcome. This presentation summarises my EGCH2230 research on the State of Kuwait: the history and types of its oil and gas, its resources and industrial growth, where its reservoirs are, and where its exports go and what they cost. Key sources are listed on slide 27; the full APA reference list is in the written report.");
}, { transition: "fade", dur: 1000 });

// =====================================================================
def("contents", "Content", (s) => {
  const { text, shape, img, m, ambient, header } = K;
  ambient(s, ["amber", 11.6, 6.9, 8], ["blue", 1.4, 0.2, 6]);
  header(s, "CONTENTS", "The story in five chapters");
  const tiles = [
    ["01", "History\n& Types", "1934 to today", "TbHistory", "sec1"],
    ["02", "Resources\n& Growth", "Reserves & output", "TbBuildingFactory2", "sec2"],
    ["03", "Reservoir\nLocations", "Fields & rocks", "TbMapPin", "sec3"],
    ["04", "Exports\n& Costs", "Markets & prices", "TbShip", "sec4"],
    ["05", "Conclusion\n& Sources", "Key takeaways", "TbBooks", "takeaways"],
  ];
  const gap = 0.25, w = (W - 2 * MX - 4 * gap) / 5, y = 2.05, h = 3.85;
  tiles.forEach(([n, t, d, ico, target], i) => {
    const x = MX + i * (w + gap), t0 = 300 + i * 120;
    const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: CARD_R, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 } });
    const circ = shape(s, pres.shapes.OVAL, { x: x + 0.3, y: y + 0.35, w: 0.78, h: 0.78, fill: { color: HEX.card2 } });
    const ii = img(s, state.ic(ico, HEX.oil), { x: x + 0.48, y: y + 0.53, w: 0.42, h: 0.42 });
    const nn = text(s, n, { x: x + 0.3, y: y + 1.4, w: w - 0.5, h: 0.6, fontSize: 34, bold: true, color: C.accent1 });
    const tt = text(s, t, { x: x + 0.3, y: y + 2.05, w: w - 0.45, h: 0.9, fontSize: 21, bold: true });
    const dd = text(s, d, { x: x + 0.3, y: y + 2.95, w: w - 0.45, h: 0.35, fontSize: 15, color: C.text2 });
    const ar = img(s, state.ic("TbArrowRight", HEX.text2), { x: x + w - 0.62, y: y + h - 0.6, w: 0.3, h: 0.3 });
    shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: CARD_R, fill: { color: "000000", transparency: 100 },
      hyperlink: { slide: state.IDX[target], tooltip: `Go to ${t.replace("\n", " ")}` } });
    m.scale(card, t0, 900, 0.95); [circ, ii].forEach((o) => m.scale(o, t0 + 60, 900, 0.8));
    [nn, tt].forEach((o, k) => m.rise(o, t0 + 120 + k * 60)); m.fade(dd, t0 + 260); m.glide(ar, t0 + 300, 800, -0.012);
  });
  const hint = text(s, "Click a chapter to jump to it. The grid button at the bottom of each slide returns here.",
    { x: MX, y: 6.15, w: 10, h: 0.35, fontSize: 15, color: C.text2 });
  m.fade(hint, 1300, 900);
  s.addNotes("This slide is the navigation hub. Each tile is a link to its chapter; the small grid button on every slide links back here, so questions can be answered by jumping straight to the relevant chapter.");
});

// =====================================================================
def("glance", "Content", (s) => {
  const { text, img, m, ambient, header, source, homeButton } = K;
  ambient(s, ["amber", 2.0, 7.0, 8.5], ["gold", 12.2, 0.9, 6]);
  header(s, "AT A GLANCE", "A small country with a giant reservoir");
  const stats = [
    ["101.5", "billion barrels", "proven crude oil reserves, about 6.5% of world total", "TbBarrel"],
    ["2.4", "million b/d", "crude oil output in 2024, under OPEC+ cuts", "TbDroplet"],
    ["1.4", "million b/d", "domestic refining capacity since Al-Zour came on line", "TbBuildingFactory"],
    ["90%+", "of exports", "are petroleum; oil funds most of the state budget", "TbCoin"],
  ];
  const gap = 0.35, w = (W - 2 * MX - 3 * gap) / 4;
  stats.forEach(([v, u, l, ico], i) => {
    const x = MX + i * (w + gap), t0 = 300 + i * 160;
    const a = img(s, state.ic(ico, HEX.oil), { x, y: 2.3, w: 0.55, h: 0.55 });
    const b = text(s, v, { x, y: 2.95, w, h: 1.1, fontSize: 66, bold: true, color: i === 0 ? C.accent1 : C.text1 });
    const c = text(s, u, { x, y: 4.05, w, h: 0.45, fontSize: 22, bold: true });
    const d = text(s, l, { x, y: 4.55, w: w - 0.1, h: 1.0, fontSize: 16, color: C.text2 });
    m.fade(a, t0, 700); m.scale(b, t0 + 80, 1100, 0.9); m.rise(c, t0 + 220); m.rise(d, t0 + 320);
  });
  source(s, "Sources: OPEC (2025b, 2026a); JODI (2026); KNPC (n.d.-b, n.d.-c); KIPIC (2024); World Bank (2026); Britannica (n.d.-b).");
  homeButton(s, state.IDX.contents);
  s.addNotes("Kuwait is a small country, but it holds 101.5 billion barrels of proven crude reserves (OPEC), about 6.5% of the world total. In 2024 it produced about 2.4 million barrels per day of crude while OPEC+ cuts were in force (JODI). Refining capacity reached about 1.4 million b/d once the Al-Zour refinery was fully on line in 2023-2024. Fuels are more than 90% of merchandise exports (World Bank) and petroleum provides most government revenue (Britannica).");
});

// =====================================================================
function section(n, title, sub, idx) {
  return (s) => {
    const { text, img, shape, m, ambient, homeButton } = K;
    ambient(s, ["amber", 2.9, 3.6, 8.5], [["blue", "gold", "blue", "gold"][idx], 12.5, idx % 2 ? 0.9 : 6.6, 6]);
    img(s, A("drop.png"), { x: 1.0, y: 1.15, w: 3.8, h: 4.8, name: "!!drop", altText: "Oil drop illustration" });
    text(s, n, { x: 5.3, y: 1.5, w: 4.5, h: 1.7, fontSize: 120, bold: true, color: C.accent1, name: "!!kicker" });
    text(s, title, { x: 5.3, y: 3.25, w: 7.4, h: 1.0, fontSize: 50, bold: true, name: "!!title" });
    const st = text(s, sub, { x: 5.3, y: 4.3, w: 7.0, h: 0.9, fontSize: 22, color: C.text2 });
    const dots = [];
    for (let i = 0; i < 5; i++) dots.push(shape(s, pres.shapes.OVAL, { x: 5.32 + i * 0.32, y: 5.5, w: 0.14, h: 0.14,
      fill: { color: i === idx ? HEX.oil : HEX.line } }));
    m.scale("!!drop", 0, 1600, 0.88); m.drift("!!drop", 1600, 3800, 0, -0.016);
    m.rise(st, 700, 900);
    dots.forEach((d, i) => m.fade(d, 900 + i * 80, 600));
    homeButton(s, state.IDX.contents);
  };
}
def("sec1", "Section", (s) => { section("01", "History & Types", "From a pearling port to a petroleum state", 0)(s);
  s.addNotes("Chapter one: how Kuwait's oil industry began and developed, and which types of crude oil and natural gas it produces."); });

// =====================================================================
def("timeline", "Content", (s) => {
  const { text, shape, m, ambient, header, source, homeButton, glow, wipeTime } = K;
  ambient(s, ["amber", 6.7, 7.7, 10], ["gold", 12.6, 0.5, 5]);
  header(s, "01 — HISTORY & TYPES", "Ninety years in nine moments");
  const items = [
    ["1934", "Oil concession\nsigned with KOC"], ["1938", "Oil strikes at\nBurgan No. 1"],
    ["1946", "First crude\nexport"], ["1960", "Co-founds OPEC;\nKNPC formed"],
    ["1975", "KOC fully\nnationalised"], ["1980", "KPC created"],
    ["1991", "Well fires after\nthe 1990 invasion"], ["2018", "Jurassic facilities;\nSuper Light exports"],
    ["2024", "Al-Zour refinery\nat full 615 kb/d"],
  ];
  const x0 = 1.35, x1 = W - 1.35, yL = 4.05, step = (x1 - x0) / (items.length - 1), WD = 2400, T0 = 250;
  const lx = x0 - 0.3, lw = x1 - x0 + 0.6;
  const line = shape(s, pres.shapes.RECTANGLE, { x: lx, y: yL - 0.015, w: lw, h: 0.03, fill: { color: HEX.line } });
  const prog = shape(s, pres.shapes.RECTANGLE, { x: lx, y: yL - 0.02, w: lw, h: 0.04, fill: { color: HEX.oil, transparency: 35 } });
  m.wipe(line, "L", T0, WD); m.wipe(prog, "L", T0 + 150, WD);
  items.forEach(([yr, lab], i) => {
    const cx = x0 + i * step, up = i % 2 === 0;
    const t0 = T0 + 150 + wipeTime((cx - lx) / lw, WD);
    const col = yr === "1991" ? HEX.red : HEX.oil;
    const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.13, y: yL - 0.13, w: 0.26, h: 0.26, fill: { color: col }, shadow: glow(col, 12, 0.8) });
    const tick = shape(s, pres.shapes.RECTANGLE, { x: cx - 0.008, y: up ? yL - 0.47 : yL + 0.2, w: 0.016, h: up ? 0.27 : 0.37, fill: { color: HEX.line } });
    const yy = text(s, yr, { x: cx - 0.75, y: up ? 2.45 : 4.75, w: 1.5, h: 0.5, fontSize: 28, bold: true,
      color: yr === "1991" ? C.accent4 : C.text1, align: "center", name: yr === "1991" ? "!!y1991" : undefined });
    const ll = text(s, lab, { x: cx - 0.95, y: up ? 2.95 : 5.25, w: 1.9, h: 0.6, fontSize: 15, color: C.text2, align: "center" });
    m.land(dot, t0, 600, 1.9); m.fade(tick, t0 + 80, 500);
    if (up) m.drop(yy, t0 + 60, 700, 0.015); else m.rise(yy, t0 + 60, 700, 0.015);
    m.fade(ll, t0 + 160, 700);
    if (yr === "1991") m.breathe(dot, t0 + 900, 1700, 1.15);
  });
  source(s, "Sources: KOC (n.d.-a); KPC (n.d.-b); KNPC (n.d.-a); Britannica (n.d.-a); S&P Global (2018a, 2024); KIPIC (2024).");
  homeButton(s, state.IDX.contents);
  s.addNotes("1934: Sheikh Ahmad Al-Jaber signed the concession with the Kuwait Oil Company, a 50/50 venture of Anglo-Persian (later BP) and Gulf Oil. 1938: Burgan No. 1 struck oil at about 1,120 m in the Wara sandstone (23 Feb 1938 per GeoExpro and KPC; some sources say 22 Feb). 1946: first crude export on 30 June. 1960: Kuwait co-founded OPEC in Baghdad and created KNPC. 1974-75: the state took 60%, then 100%, of KOC. 1980: Kuwait Petroleum Corporation formed as the holding company. 1990-91: the Iraqi invasion and the well fires. 2018: Jurassic production facilities started and Kuwait Super Light crude was first exported. 2024: Al-Zour refinery reached its full 615,000 b/d capacity.");
});

// =====================================================================
def("fires", "Content", (s) => {
  const { text, m, ambient, source, homeButton } = K;
  ambient(s, ["red", 7.5, 8.4, 12.5], ["amber", 1.6, 8.0, 7.5], { flicker: true });
  s.addText("1991 — THE OIL FIRES", { placeholder: "kicker" });
  s._slideObjects[s._slideObjects.length - 1].options.objectName = "!!y1991";
  s.addText("When the desert burned", { placeholder: "title" });
  s._slideObjects[s._slideObjects.length - 1].options.objectName = "!!title";
  const big = text(s, "700+", { x: MX, y: 1.62, w: 6.2, h: 2.15, fontSize: 150, bold: true });
  const bl = text(s, "oil wells set ablaze by retreating Iraqi forces in February 1991", { x: MX, y: 3.9, w: 5.6, h: 0.95, fontSize: 22, color: C.text2 });
  m.scale(big, 300, 1400, 0.88); m.rise(bl, 750, 900);
  const rows = [["> 1 billion", "barrels of crude oil lost"], ["4–6 million b/d", "of oil burning at the peak"], ["6 November 1991", "last fire capped: Burgan well 118"]];
  rows.forEach(([v, l], i) => {
    const y = 2.0 + i * 1.32, t0 = 1000 + i * 220;
    const a = text(s, v, { x: 7.3, y, w: 5.4, h: 0.7, fontSize: 40, bold: true, color: i === 2 ? C.accent1 : C.accent4 });
    const b = text(s, l, { x: 7.3, y: y + 0.68, w: 5.4, h: 0.45, fontSize: 18, color: C.text2 });
    m.rise(a, t0, 900); m.fade(b, t0 + 150, 800);
  });
  const rec = text(s, [{ text: "Recovery: ", options: { bold: true, color: C.text1 } },
    { text: "27 international teams and Kuwait's own", options: { color: C.text2, breakLine: true } },
    { text: "Wild Well Killers; pre-war output back within about four years.", options: { color: C.text2 } }],
    { x: MX, y: 5.45, w: 6.55, h: 0.8, fontSize: 17 });
  m.fade(rec, 1900, 900);
  source(s, "Sources: KOC (n.d.-b); OSAGWI (1998, 2000); Britannica (n.d.-a). KOC: 700+ wells ablaze; OSAGWI: 750+ of 943 ignited or damaged.");
  homeButton(s, state.IDX.contents);
  s.addNotes("Between August 1990 and February 1991 about 80% of KOC's producing wells and facilities were destroyed (KOC). More than 700 wells were set on fire; the U.S. Department of Defense counted over 750 of 943 wells ignited or damaged. At the peak an estimated 4-6 million barrels per day of oil and 70-100 million cubic metres per day of gas were burning, and more than one billion barrels were lost. The last fire, Burgan 118, was capped on 6 November 1991. Kuwait's own team, the Kuwait Wild Well Killers, capped 41 wells in 54 days. Spilled oil formed more than 100 oil lakes covering about 19 square kilometres (U.S. DoD).");
});

// =====================================================================
def("crudes", "Content", (s) => {
  const { text, shape, img, m, ambient, header, source, homeButton, glow } = K;
  ambient(s, ["amber", 11.8, 5.6, 8], ["gold", 1.4, 0.8, 5]);
  header(s, "01 — HISTORY & TYPES", "Four crudes on one scale");
  const x0 = 0.95, x1 = W - 0.95, y = 3.72, api0 = 10, api1 = 50;
  const X = (api) => x0 + (api - api0) / (api1 - api0) * (x1 - x0);
  const bar = img(s, A("api_scale.png"), { x: x0, y: y - 0.16, w: x1 - x0, h: 0.32 });
  m.wipe(bar, "L", 250, 1500);
  [[16.15, "Heavy"], [26.2, "Medium"], [40.5, "Light"]].forEach(([a, lab], i) => {
    const t = text(s, lab.toUpperCase(), { x: X(a) - 1.2, y: y + 0.3, w: 2.4, h: 0.35, fontSize: 14, bold: true, color: C.text2, align: "center", charSpacing: 2 });
    m.fade(t, 800 + i * 120, 700);
  });
  // class boundaries (22.3° and 31.1° API) are marked below the bar, clear of the crude markers
  [22.3, 31.1].forEach((a) => m.fade(shape(s, pres.shapes.RECTANGLE, { x: X(a) - 0.01, y: y + 0.26, w: 0.02, h: 0.2, fill: { color: HEX.text2 } }), 800, 600));
  [10, 20, 30, 40, 50].forEach((a) => m.fade(text(s, `${a}°`, { x: X(a) - 0.4, y: y + 0.62, w: 0.8, h: 0.3, fontSize: 13, color: C.text2, align: "center" }), 900, 600));
  const crudes = [
    { n: "Kuwait Export Heavy", api: 16, s: "4.93% S", d: "Heavy, very sour", up: true },
    { n: "Khafji", api: 28.5, s: "2.85% S", d: "Partitioned Zone, offshore", up: false },
    { n: "Kuwait Export Crude", api: 30.5, s: "2.50% S", d: "Main export blend (KEC)", up: true },
    { n: "Kuwait Super Light", api: 48, s: "0.38% S", d: "Jurassic, North Kuwait", up: true },
  ];
  crudes.forEach((c, i) => {
    const cx = X(c.api), cw = 3.15, ch = 1.18, t0 = 900 + i * 180;
    const cardX = Math.min(Math.max(cx - cw / 2, MX), W - MX - cw);
    const cy = c.up ? 1.95 : 4.72;
    const mk = shape(s, pres.shapes.OVAL, { x: cx - 0.17, y: y - 0.17, w: 0.34, h: 0.34, fill: { color: HEX.text },
      line: { color: HEX.bg, width: 3 }, shadow: glow(HEX.oil, 10, 0.9) });
    const st = shape(s, pres.shapes.RECTANGLE, { x: cx - 0.008, y: c.up ? cy + ch : y + 0.2, w: 0.016,
      h: c.up ? y - 0.2 - (cy + ch) : cy - (y + 0.2), fill: { color: HEX.line } });
    const card = text(s, [
      { text: c.n, options: { fontSize: 19, bold: true, color: C.text1, breakLine: true } },
      { text: `${c.api}° API  ·  ${c.s}`, options: { fontSize: 17, bold: true, color: C.accent1, breakLine: true } },
      { text: c.d, options: { fontSize: 15, color: C.text2 } },
    ], { x: cardX, y: cy, w: cw, h: ch, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 }, margin: [12, 10, 6, 6], shape: pres.shapes.ROUNDED_RECTANGLE,
      rectRadius: CARD_R, paraSpaceAfter: 2 });
    // markers glide along the gauge from the heavy end to their API value
    m.glide(mk, t0, 1100, -(cx - x0) / W);
    m.fade(st, t0 + 850, 500);
    if (c.up) m.drop(card, t0 + 850, 800, 0.02); else m.rise(card, t0 + 850, 800, 0.02);
  });
  const f = text(s, "API gravity = 141.5 / SG − 131.5   ·   higher API = lighter oil   ·   S = sulfur content (wt%)",
    { x: MX, y: 6.08, w: 10.5, h: 0.32, fontSize: 14, color: C.text2 });
  m.fade(f, 2500, 600);
  source(s, "Sources: Mehdi (2021); Energy Intelligence (n.d.); S&P Global (2018b, 2020); EIA (2023a). Class limits: 22.3° and 31.1° API.");
  homeButton(s, state.IDX.contents);
  s.addNotes("Kuwait Export Crude (KEC) is the main export blend: medium and sour, about 30.5 degrees API and 2.5% sulfur, mostly from the Cretaceous reservoirs of Greater Burgan. Since July 2018 Kuwait also exports Kuwait Super Light Crude from the deep Jurassic reservoirs of North Kuwait: about 48 degrees API and only about 0.4% sulfur. Kuwait Export Heavy is about 16 degrees API with almost 5% sulfur. Khafji crude from the offshore Partitioned Zone shared with Saudi Arabia is about 28.5 degrees API and 2.85% sulfur. For refiners, sour crudes need hydrotreating capacity, which is why Kuwait's new refineries have large desulfurisation units.");
});

// =====================================================================
def("gastypes", "Content", (s) => {
  const { text, shape, img, m, ambient, header, source, homeButton } = K;
  ambient(s, ["blue", 2.8, 4.1, 8.5], ["amber", 12.6, 7.1, 6]);
  header(s, "01 — HISTORY & TYPES", "Gas: mostly a by-product of oil");
  const ch = `${K.sid()}_donut`;
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Gas production by type, 2021", labels: ["Associated", "Non-associated"], values: [70, 30] }],
    Object.assign({ x: 0.7, y: 1.95, w: 4.3, h: 4.3, holeSize: 72, chartColors: [HEX.oil, HEX.gas], showLegend: false,
      showValue: false, showPercent: false, dataBorder: { pt: 0, color: HEX.bg }, objectName: ch, firstSliceAng: 0,
      layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, chartFrame()));
  m.wheel(ch, 300, 1600);
  const c1 = text(s, "70%", { x: 1.65, y: 3.3, w: 2.4, h: 0.9, fontSize: 54, bold: true, align: "center" });
  const c2 = text(s, "associated gas,\nshare of 2021 output", { x: 1.75, y: 4.18, w: 2.2, h: 0.5, fontSize: 14, color: C.text2, align: "center" });
  // the gas slice (30%, 252°–360° clockwise from 12 o'clock) labelled on the ring
  const c3 = text(s, "30%", { x: 1.14, y: 2.9, w: 0.6, h: 0.35, fontSize: 16, bold: true, color: HEX.bg, align: "center", valign: "middle" });
  m.scale(c1, 1100, 900, 0.85); m.fade(c2, 1250, 600); m.fade(c3, 1250, 600);
  const rows = [
    ["TbDroplet", HEX.oil, "Associated gas", "Released with crude oil, so its output follows oil quotas"],
    ["TbFlame", HEX.gas, "Non-associated Jurassic gas", "Deep, high-pressure sour gas in North Kuwait"],
    ["TbShip", HEX.text, "Imported LNG", "Imported since 2009; about 40% of the gas used in 2024"],
  ];
  rows.forEach(([ico, col, h, d], i) => {
    const y = 2.05 + i * 1.3, t0 = 1450 + i * 160;
    const circ = shape(s, pres.shapes.OVAL, { x: 5.75, y, w: 0.8, h: 0.8, fill: { color: HEX.card2 } });
    const ii = img(s, state.ic(ico, col), { x: 5.94, y: y + 0.19, w: 0.42, h: 0.42 });
    const hh = text(s, h, { x: 6.85, y: y - 0.02, w: 5.9, h: 0.45, fontSize: 22, bold: true });
    const dd = text(s, d, { x: 6.85, y: y + 0.43, w: 5.9, h: 0.65, fontSize: 16, color: C.text2 });
    [circ, ii].forEach((o) => m.scale(o, t0, 800, 0.8)); m.rise(hh, t0 + 80); m.rise(dd, t0 + 180);
  });
  const res = text(s, [{ text: "63 Tcf ", options: { bold: true, color: C.accent2 } },
    { text: "(1.78 trillion m³) proven gas reserves, <1% of world", options: { color: C.text2 } }],
    { x: 5.75, y: 5.95, w: 7.0, h: 0.4, fontSize: 17 });
  m.fade(res, 2250, 700);
  source(s, "Sources: EIA (2023a); Energy Institute (2025); S&P Global (2018a); OPEC (2025b).");
  homeButton(s, state.IDX.contents);
  s.addNotes("About 70% of Kuwait's gas production in 2021 was associated gas, released when crude oil is produced, so gas supply follows oil output and OPEC+ quotas. The second type is non-associated gas from deep Jurassic reservoirs in North Kuwait: high-pressure, sour gas produced with light oil and condensate through the Jurassic Production Facilities since 2018. Because demand, mainly for power and desalination, exceeds supply, Kuwait has imported LNG since 2009. In 2024 about 40% of the gas it consumed was imported (Energy Institute data). Proven gas reserves are about 63 trillion cubic feet.");
});

// =====================================================================
def("sec2", "Section", (s) => { section("02", "Resources & Growth", "Reserves, output and an industry built around them", 1)(s);
  s.addNotes("Chapter two: how much oil and gas Kuwait has, how its production has changed over eighty years, and how its industry grew from a single concession into a full value chain."); });

// =====================================================================
def("reserves", "Content", (s) => {
  const { text, m, ambient, header, source, homeButton } = K;
  ambient(s, ["amber", 9.8, 4.2, 9.5], ["gold", 1.0, 7.3, 6]);
  header(s, "02 — RESOURCES & GROWTH", "Seventh-largest oil reserves on Earth");
  const a = text(s, "101.5", { x: MX, y: 2.0, w: 6.6, h: 1.75, fontSize: 130, bold: true, color: C.accent1 });
  const b = text(s, "billion barrels of proven crude oil", { x: MX, y: 3.95, w: 6.4, h: 0.5, fontSize: 26, bold: true });
  const c = text(s, "Unchanged in official statistics since about 2010: additions have offset about one billion barrels produced each year.",
    { x: MX, y: 4.55, w: 6.4, h: 0.85, fontSize: 17, color: C.text2 });
  const d = text(s, [{ text: "≈100 years ", options: { bold: true, color: C.text1 } }, { text: "of output left at today's rate", options: { color: C.text2 } }],
    { x: MX, y: 5.55, w: 6.0, h: 0.45, fontSize: 17 });
  m.scale(a, 250, 1300, 0.88); m.rise(b, 650); m.rise(c, 850); m.rise(d, 1050);
  const ch = `${K.sid()}_share`;
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Share of world proven crude reserves", labels: ["Kuwait", "Rest of world"], values: [6.5, 93.5] }],
    Object.assign({ x: 7.6, y: 1.9, w: 4.5, h: 4.5, holeSize: 74, chartColors: [HEX.oil, HEX.card2], showLegend: false,
      showValue: false, dataBorder: { pt: 0, color: HEX.bg }, objectName: ch, firstSliceAng: 0,
      layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, chartFrame()));
  m.wheel(ch, 500, 1700);
  const e = text(s, "6.5%", { x: 8.35, y: 3.5, w: 3.0, h: 0.9, fontSize: 54, bold: true, align: "center" });
  const f = text(s, "of world reserves", { x: 8.35, y: 4.35, w: 3.0, h: 0.4, fontSize: 16, color: C.text2, align: "center" });
  m.scale(e, 1700, 900, 0.85); m.fade(f, 1850, 700);
  source(s, "Sources: OPEC (2025b, 2026a), world 1,567–1,572 bn bbl; EIA (2023a); bp (2021). Includes half of the Partitioned Zone.");
  homeButton(s, state.IDX.contents);
  s.addNotes("OPEC's 2025 and 2026 bulletins both list Kuwait's proven crude reserves at 101.5 billion barrels, about 6.5% of the world's 1,567-1,572 billion barrels, which ranks Kuwait seventh in the world (EIA). The figure includes Kuwait's half of the Partitioned Zone shared with Saudi Arabia. Reserves jumped from about 68 billion barrels in 1980 to 97 billion in 1990 and have stayed at 101.5 billion since about 2010. At about one billion barrels produced per year, that is roughly a century of output; bp's 2021 review gave a reserves-to-production ratio of 103 years.");
});

// =====================================================================
def("production", "Content", (s) => {
  const { text, shape, m, ambient, header, source, homeButton, glow, wipeTime } = K;
  ambient(s, ["amber", 6.6, 6.9, 11], ["blue", 0.4, 0.5, 5]);
  header(s, "02 — RESOURCES & GROWTH", "Eight decades of output");
  const P = SERIES.production_kbd;
  const years = Object.keys(P).map(Number).sort((a, b) => a - b);
  const box = { x: 0.55, y: 1.9, w: 12.2, h: 4.5 }, L = { x: 0.075, y: 0.06, w: 0.9, h: 0.8 };
  const xmin = 1940, xmax = 2025, ymax = 3500, WD = 2800, T0 = 250;
  const ch = `${K.sid()}_chart`;
  s.addChart(pres.charts.SCATTER, [{ name: "Year", values: years }, { name: "Oil production (million b/d)", values: years.map((y) => P[y] / 1000) }],
    Object.assign(chartText(), chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, layout: L, objectName: ch,
      chartColors: [HEX.oil], lineSize: 4, lineDataSymbol: "none", showLegend: false,
      catAxisMinVal: xmin, catAxisMaxVal: xmax, catAxisMajorUnit: 10, valAxisMinVal: 0, valAxisMaxVal: ymax / 1000, valAxisMajorUnit: 1,
      valAxisLabelFormatCode: '0;-0;""', valGridLine: { color: "2C2C2E", size: 0.75 },
      catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
  m.wipe(ch, "L", T0, WD);
  const px = (yr) => box.x + box.w * (L.x + L.w * (yr - xmin) / (xmax - xmin));
  const py = (v) => box.y + box.h * (L.y + L.h * (1 - v / ymax));
  const notes = [
    [1946, P[1946], "1946", "first exports", 0.0, -1.95, true],
    [1972, P[1972], "1972 · 3.34 mb/d", "all-time peak", 1.25, -0.36, false],
    [1991, P[1991], "1991 · 0.19 mb/d", "invasion and fires", 1.32, -0.5, false],
    [2012, P[2012], "2012 · ≈ 3.2 mb/d", "post-war high (est.)", 0, -0.92, false],
    [2024, P[2024], "2024 · ≈ 2.7 mb/d", "incl. NGLs; crude 2.4", -0.35, 0.17, false],
  ];
  notes.forEach(([yr, v, a, b, ox, oy, leader]) => {
    const t0 = T0 + wipeTime((px(yr) - box.x) / box.w, WD);
    const cx = px(yr), cy = py(v);
    const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: HEX.text },
      line: { color: HEX.oil, width: 2.5 }, shadow: glow(HEX.oil, 10, 0.8) });
    const lw = 2.2, lx = Math.min(cx + ox - lw / 2, W - MX - lw);
    const lab = text(s, [{ text: a, options: { bold: true, color: C.text1, breakLine: true } }, { text: b, options: { color: C.text2 } }],
      { x: lx, y: cy + oy, w: lw, h: 0.62, fontSize: 16, align: "center" });
    m.land(dot, t0, 600, 1.8);
    if (oy < 0) m.drop(lab, t0 + 100, 700, 0.012); else m.rise(lab, t0 + 100, 700, 0.012);
    if (leader) m.wipe(shape(s, pres.shapes.RECTANGLE, { x: cx - 0.007, y: cy + oy + 0.66, w: 0.014, h: -oy - 0.78, fill: { color: HEX.text3 } }), "B", t0 + 100, 500);
  });
  m.fade(text(s, "mb/d = million barrels per day (total oil, incl. NGLs)", { x: MX, y: 1.7, w: 6, h: 0.3, fontSize: 14, color: C.text2 }), 300, 700);
  source(s, "Sources: Energy Institute (2025) via Our World in Data (2025), incl. NGLs; some years (e.g. 2012, 2024) derived; 1946–55: KPC (n.d.-b).");
  homeButton(s, state.IDX.contents);
  s.addNotes("Output rose from about 16 thousand b/d in 1946 to an all-time peak of 3.34 million b/d in 1972 (Energy Institute, total oil including NGLs). After nationalisation, conservation policy and the 1980s price collapse it fell to around one million b/d. The 1990-91 invasion and fires cut it to only 185 thousand b/d in 1991. It recovered within four years and reached an estimated post-war high of about 3.2 million b/d in 2012 (derived from Energy Institute energy data). Since 2017 OPEC+ agreements have set Kuwait's production; in 2024 crude alone averaged about 2.4 million b/d (JODI), or about 2.7 million b/d including NGLs.");
});

// =====================================================================
def("gasbalance", "Content", (s) => {
  const { text, m, ambient, header, source, homeButton } = K;
  ambient(s, ["blue", 4.5, 6.0, 10], ["blue", 12.4, 1.0, 6]);
  header(s, "02 — RESOURCES & GROWTH", "Burning more gas than it produces");
  const G = SERIES.gas;
  const yrs = []; for (let y = 2000; y <= 2024; y++) yrs.push(y);
  const ch = `${K.sid()}_area`;
  s.addChart(pres.charts.AREA, [
    { name: "Domestic production", labels: yrs.map(String), values: yrs.map((y) => G[y].prod_bcm) },
    { name: "LNG imports", labels: yrs.map(String), values: yrs.map((y) => Math.round((G[y].cons_bcm - G[y].prod_bcm) * 10) / 10) },
  ], Object.assign(chartText(), chartFrame(), { x: 0.5, y: 1.95, w: 8.3, h: 4.45, objectName: ch,
    layout: { x: 0.08, y: 0.05, w: 0.9, h: 0.8 }, chartColors: [HEX.gas, "5A5A5F"], chartColorsOpacity: 100,
    barGrouping: "stacked", showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 25, valAxisMajorUnit: 5,
    catAxisLabelFrequency: 4, valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false }));
  m.wipe(ch, "L", 250, 2400);
  const l1 = text(s, "LNG\nimports", { x: 7.42, y: 2.9, w: 1.0, h: 0.6, fontSize: 16, bold: true, align: "center" });
  const l2 = text(s, "Domestic production", { x: 5.6, y: 4.6, w: 2.9, h: 0.35, fontSize: 16, bold: true, color: C.background1 });
  const l3 = text(s, "billion m³ (bcm) per year", { x: MX, y: 1.7, w: 3.5, h: 0.3, fontSize: 14, color: C.text2 });
  const at = (x) => 250 + K.wipeTime((x - 0.5) / 8.3, 2400) + 120;
  m.fade(l3, 300, 700); m.fade(l2, at(5.6), 600); m.fade(l1, at(7.42), 600);
  const big = text(s, "40%", { x: 9.3, y: 2.0, w: 3.4, h: 1.4, fontSize: 96, bold: true, color: C.accent2 });
  const bt = text(s, "of the gas Kuwait used in 2024 was imported as LNG", { x: 9.3, y: 3.45, w: 3.4, h: 0.95, fontSize: 19, bold: true });
  const bd = text(s, "≈15 bcm produced vs ≈25 bcm consumed. Imports began in 2009 at Mina Al-Ahmadi; Al-Zour now has a permanent LNG terminal.",
    { x: 9.3, y: 4.5, w: 3.4, h: 1.4, fontSize: 16, color: C.text2 });
  m.scale(big, 1700, 1100, 0.86); m.rise(bt, 2000); m.rise(bd, 2200);
  source(s, "Sources: Energy Institute (2025) via Our World in Data (2025); EIA (2011a); KIPIC (n.d.). Converted at 10 TWh ≈ 1 bcm.");
  homeButton(s, state.IDX.contents);
  s.addNotes("Until 2008 Kuwait consumed exactly the gas it produced. Demand for power generation and desalination grew faster than associated-gas supply, so since 2009 the gap has been filled with imported LNG. In 2024 Kuwait produced about 15 billion cubic metres and consumed about 25 billion, so roughly 40% was imported. Gas now generates about 62% of Kuwait's electricity, up from 33% in 2000, replacing much of the crude oil and fuel oil burned in power stations (Our World in Data, based on Energy Institute data).");
});

// =====================================================================
def("chain", "Content", (s) => {
  const { text, shape, img, m, ambient, header, source, homeButton, glow } = K;
  ambient(s, ["amber", 6.6, 3.8, 10.5], ["gold", 0.8, 7.3, 5]);
  header(s, "02 — RESOURCES & GROWTH", "One state company, the whole chain");
  const top = text(s, [{ text: "KUWAIT PETROLEUM CORPORATION (KPC)", options: { bold: true, color: C.text1 } },
    { text: "   ·   state-owned holding company, est. 1980", options: { color: C.text2 } }],
    { x: MX, y: 1.95, w: W - 2 * MX, h: 0.62, fontSize: 18, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 }, shape: pres.shapes.ROUNDED_RECTANGLE,
      rectRadius: CARD_R, margin: [20, 20, 0, 0], valign: "middle", align: "center" });
  m.scale(top, 250, 900, 0.97);
  const stages = [
    ["TbDroplet", "Upstream", "KOC: Kuwait fields\nKGOC: Partitioned Zone\nKUFPEC: abroad"],
    ["TbShip", "Shipping", "KOTC tankers\n(since 1957)"],
    ["TbBuildingFactory", "Refining", "KNPC: two refineries\nKIPIC: Al-Zour"],
    ["TbFlask", "Petrochemicals", "PIC (since 1963)\nEQUATE group"],
    ["TbGasStation", "Marketing", "KPI: Q8 brand\nfuels & refining abroad"],
  ];
  const gap = 0.32, w = (W - 2 * MX - 4 * gap) / 5;
  stages.forEach(([ico, h, d], i) => {
    const x = MX + i * (w + gap), cx = x + w / 2, t0 = 500 + i * 300;
    const halo = shape(s, pres.shapes.OVAL, { x: cx - 0.62, y: 2.88, w: 1.24, h: 1.24, fill: { color: HEX.oil, transparency: 84 } });
    const circ = shape(s, pres.shapes.OVAL, { x: cx - 0.55, y: 2.95, w: 1.1, h: 1.1, fill: { color: HEX.card2 }, shadow: glow(HEX.oil, 16, 0.35) });
    const ii = img(s, state.ic(ico, HEX.oil), { x: cx - 0.3, y: 3.2, w: 0.6, h: 0.6 });
    const hh = text(s, h, { x, y: 4.25, w, h: 0.45, fontSize: 20, bold: true, align: "center" });
    const dd = text(s, d.split("\n").map((t, k, arr) => ({ text: t, options: { breakLine: k < arr.length - 1 } })),
      { x, y: 4.75, w, h: 1.3, fontSize: 14, color: C.text2, align: "center", paraSpaceAfter: 3 });
    [halo, circ, ii].forEach((o) => m.scale(o, t0, 900, 0.8)); m.rise(hh, t0 + 120); m.rise(dd, t0 + 220);
    // a wave of light keeps travelling along the chain while the slide is shown
    m.breathe(halo, 2700 + i * 360, 1500, 1.2);
    if (i < 4) m.glide(img(s, state.ic("TbChevronRight", HEX.text3), { x: x + w + gap / 2 - 0.17, y: 3.33, w: 0.34, h: 0.34 }), t0 + 300, 700, -0.01);
  });
  source(s, "Sources: KPC (n.d.-c); KOC (n.d.-a); KNPC (n.d.-a); KIPIC (n.d.); KOTC (n.d.); PIC (n.d.); Britannica (n.d.-b).");
  homeButton(s, state.IDX.contents);
  s.addNotes("Since 1980 the Kuwait Petroleum Corporation has owned the whole chain. KOC explores and produces onshore and offshore Kuwait; KGOC manages Kuwait's share of the Partitioned Zone with Saudi Arabia; KUFPEC invests in upstream projects abroad. KOTC ships crude, products and LPG. KNPC runs the Mina Al-Ahmadi and Mina Abdullah refineries and KIPIC runs the new Al-Zour refinery. PIC, founded in 1963 as the region's first petrochemical company, holds stakes in the EQUATE group with Dow. Kuwait Petroleum International sells fuel under the Q8 brand and holds refining stakes abroad, including the Duqm refinery in Oman.");
});

// =====================================================================
def("refining", "Content", (s) => {
  const { text, shape, m, ambient, header, source, homeButton, glow } = K;
  ambient(s, ["gold", 3.0, 5.6, 8], ["amber", 11.5, 3.5, 8]);
  header(s, "02 — RESOURCES & GROWTH", "Refining capacity more than doubled");
  const base = 5.6, maxH = 2.85;
  [["Jan 2021", 0.6, HEX.gray], ["Jul 2023", 1.4, HEX.oil]].forEach(([lab, v, col], i) => {
    const h = maxH * v / 1.4, x = 1.0 + i * 2.1, t0 = 300 + i * 450;
    const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y: base - h, w: 1.45, h, rectRadius: 0.1, fill: { color: col },
      shadow: i ? glow(HEX.oil, 18, 0.45) : undefined });
    const vv = text(s, `${v}`, { x: x - 0.3, y: base - h - 0.85, w: 2.05, h: 0.8, fontSize: 48, bold: true, align: "center", color: i ? C.accent1 : C.text1 });
    const ll = text(s, lab, { x: x - 0.3, y: base + 0.12, w: 2.05, h: 0.35, fontSize: 16, color: C.text2, align: "center" });
    m.wipe(bar, "B", t0, 1100); m.rise(vv, t0 + 650, 700, 0.015); m.fade(ll, t0, 700);
  });
  m.fade(text(s, "million b/d", { x: 1.0, y: base + 0.5, w: 3.6, h: 0.35, fontSize: 15, color: C.text2, align: "center" }), 300, 700);
  const rows = [["Al-Zour", "KIPIC · full capacity 2024", 615], ["Mina Abdullah", "KNPC · Clean Fuels Project", 454],
    ["Mina Al-Ahmadi", "KNPC · Clean Fuels Project", 346]];
  rows.forEach(([n, d, v], i) => {
    const y = 2.05 + i * 1.12, t0 = 1150 + i * 180, bw = 3.2 * v / 615;
    const a = text(s, n, { x: 5.6, y, w: 3.0, h: 0.42, fontSize: 21, bold: true });
    const b = text(s, d, { x: 5.6, y: y + 0.44, w: 3.4, h: 0.35, fontSize: 14, color: C.text2 });
    const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: 8.55, y: y + 0.13, w: bw, h: 0.42, rectRadius: 0.08, fill: { color: i === 0 ? HEX.oil : "8A5A12" } });
    const vv = text(s, `${v}`, { x: 8.55 + bw + 0.12, y: y + 0.06, w: 0.9, h: 0.55, fontSize: 22, bold: true, valign: "middle" });
    m.rise(a, t0); m.rise(b, t0 + 100); m.wipe(bar, "L", t0 + 100, 900); m.fade(vv, t0 + 700, 500);
  });
  const tot = text(s, [{ text: "= 1,415 kb/d ", options: { bold: true, color: C.accent1 } }, { text: "of crude distillation in Kuwait", options: { color: C.text2 } }],
    { x: 5.6, y: 5.4, w: 7.1, h: 0.4, fontSize: 18 });
  m.rise(tot, 2450, 700);
  source(s, "Sources: EIA (2023b); KNPC (n.d.-b, n.d.-c); KIPIC (2024); S&P Global (2024). Capacities in kb/d (thousand b/d).");
  homeButton(s, state.IDX.contents);
  s.addNotes("According to the EIA, Kuwait's refining capacity rose from about 600,000 b/d in January 2021 to about 1.4 million b/d in July 2023. Two things drove this: the new Al-Zour refinery (615,000 b/d, three crude units, run by KIPIC) and KNPC's Clean Fuels Project, which upgraded and integrated Mina Al-Ahmadi (346,000 b/d) and Mina Abdullah (454,000 b/d). Al-Zour first ran at full capacity on 4 February 2024. As a result Kuwait exports far more refined products than before; in 2024 product exports briefly overtook crude.");
});

// =====================================================================
def("sec3", "Section", (s) => { section("03", "Reservoir Locations", "Fields, regions and the rocks that hold them", 2)(s);
  s.addNotes("Chapter three: the location of Kuwait's oil and gas fields, grouped into four producing areas, and the reservoir rocks they produce from."); });

const REG = require("./build_regions");
REG.mainSlides(state, ctx);

// =====================================================================
def("strata", "Content", (s) => {
  const { text, shape, img, m, ambient, header, source, homeButton } = K;
  ambient(s, ["amber", 1.6, 3.9, 7], ["blue", 11.6, 6.7, 6]);
  header(s, "03 — RESERVOIR LOCATIONS", "Reservoirs from shallow to deep");
  const layers = [
    ["Lower Fars", "Miocene sandstone", 0.5, "sand", "heavy"],
    ["Mishrif", "Mid-Cretaceous carbonate", 0.4, "carb", "kec"],
    ["Wara", "Mid-Cretaceous sandstone", 0.36, "sand", "kec"],
    ["Mauddud", "Mid-Cretaceous carbonate", 0.4, "carb", "kec"],
    ["Burgan", "Mid-Cretaceous (Albian) sandstone", 0.66, "sand", "kec"],
    ["Zubair", "Early Cretaceous sandstone", 0.42, "sand", "kec"],
    ["Ratawi", "Early Cretaceous limestone and shale", 0.36, "carb", "kec"],
    ["Minagish", "Early Cretaceous oolitic limestone", 0.42, "carb", "kec"],
    ["Najmah / Sargelu", "Middle–Late Jurassic carbonates", 0.44, "jur", "jur"],
    ["Marrat", "Early Jurassic carbonate", 0.44, "jur", "jur"],
  ];
  // neutral rock colours (tan = sandstone, slate = carbonate) so amber/blue keep their deck-wide oil/gas meaning
  const colX = 1.15, colW = 1.55, fill = { sand: "A88A5C", carb: "5F7180", jur: "46535F" };
  const arrow = img(s, A("depth_arrow.png"), { x: 0.6, y: 1.95, w: 0.3, h: 4.4 });
  m.wipe(arrow, "T", 1500, 800);
  let y = 1.95;
  const span = {}, rows = [];
  layers.forEach(([n, d, h, lit, grp]) => {
    span[grp] = span[grp] ? [span[grp][0], y + h] : [y, y + h];
    const band = shape(s, pres.shapes.RECTANGLE, { x: colX, y, w: colW, h: h - 0.03, fill: { color: fill[lit] } });
    const lab = text(s, [{ text: n + "  ", options: { bold: true, color: C.text1 } }, { text: d, options: { color: C.text2 } }],
      { x: colX + colW + 0.25, y: y + (h - 0.03) / 2 - 0.17, w: 5.0, h: 0.34, fontSize: 15, valign: "middle" });
    rows.push([band, lab]);
    y += h;
  });
  // build in deposition order: the oldest rock (bottom) first, the youngest (top) last
  rows.slice().reverse().forEach(([band, lab], k) => { const t0 = 250 + k * 120; m.wipe(band, "L", t0, 600); m.fade(lab, t0 + 200, 600); });
  const groups = [
    ["Heavy oil", "Shallow Lower Fars sands, Ratqa, North\u00a0Kuwait", "heavy", HEX.oil],
    ["Kuwait Export Crude", "Cretaceous sandstones and carbonates of the Burgan, Raudhatain, Sabriya, Minagish and Umm\u00a0Gudair fields", "kec", HEX.oil],
    ["Super-light oil & sour gas", "Deep Jurassic carbonates of North Kuwait, high pressure and temperature", "jur", HEX.gas],
  ];
  groups.forEach(([h, d, key, col], i) => {
    const gy = span[key][0], gh = span[key][1] - span[key][0] - 0.03, t0 = 2100 + i * 180, x = 8.35, w = W - MX - x;
    const br = shape(s, pres.shapes.RECTANGLE, { x: 8.05, y: gy + 0.04, w: 0.05, h: gh - 0.08, fill: { color: col } });
    const cardH = Math.min(Math.max(gh, 0.95), 1.6), cy = gy + gh / 2 - cardH / 2;
    const t = text(s, [{ text: h, options: { bold: true, color: C.text1, fontSize: 18, breakLine: true } }, { text: d, options: { color: C.text2, fontSize: 14 } }],
      key === "heavy" ? { x, y: gy - 0.02, w, h: cardH, valign: "top" } : { x, y: Math.max(1.9, Math.min(cy, 6.35 - cardH)), w, h: cardH, valign: "middle" });
    m.wipe(br, "T", t0, 600); m.rise(t, t0 + 100, 700);
  });
  source(s, "Sources: Naqi et al. (2023); S&P Global (2018b); MEES (2025a). Simplified, not to scale.");
  homeButton(s, state.IDX.contents);
  s.addNotes("Kuwait's oil comes from a stack of reservoirs; the column builds in the order the rocks were deposited, oldest first. Deepest are the Jurassic Marrat, Najmah and Sargelu carbonates, which produce Kuwait Super Light crude and sour, high-pressure non-associated gas in the north. Most production and the Kuwait Export Crude blend come from Cretaceous rocks: the Burgan Formation sandstones are the most important reservoir in the country, together with Wara, Mauddud, Mishrif, Zubair, Ratawi and the Minagish Oolite, which is the main reservoir of the Minagish and Umm Gudair fields in the west. Near the surface, the Miocene Lower Fars sands of North Kuwait hold heavy oil. The diagram is simplified and not to scale.");
});

// =====================================================================
def("sec4", "Section", (s) => { section("04", "Exports & Costs", "Who buys Kuwait's oil, and what it costs", 3)(s);
  s.addNotes("Chapter four: where Kuwait's oil exports go, what they earn, what they cost to produce, and how much the gas it imports costs."); });

require("./build_markets")(state, ctx);

// =====================================================================
def("takeaways", "Content", (s) => {
  const { text, shape, img, m, ambient, header, homeButton } = K;
  ambient(s, ["amber", 6.6, 7.9, 11], ["blue", 1.0, 0.5, 6]);
  header(s, "05 — CONCLUSION & SOURCES", "What the numbers say");
  const gap = 0.3, w = (W - 2 * MX - gap) / 2, h = 1.95;
  MKT.takeaways.forEach(([ico, col, hd, d], i) => {
    const x = MX + (i % 2) * (w + gap), y = 1.95 + Math.floor(i / 2) * (h + gap), t0 = 300 + i * 180;
    const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: CARD_R, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 } });
    const circ = shape(s, pres.shapes.OVAL, { x: x + 0.35, y: y + 0.47, w: 0.95, h: 0.95, fill: { color: HEX.card2 } });
    const ii = img(s, state.ic(ico, col), { x: x + 0.59, y: y + 0.71, w: 0.47, h: 0.47 });
    const hh = text(s, hd, { x: x + 1.6, y: y + 0.32, w: w - 1.9, h: 0.5, fontSize: 23, bold: true });
    const dd = text(s, d, { x: x + 1.6, y: y + 0.85, w: w - 1.9, h: 0.85, fontSize: 16, color: C.text2 });
    m.scale(card, t0, 900, 0.96); [circ, ii].forEach((o) => m.scale(o, t0 + 80, 800, 0.8)); m.rise(hh, t0 + 150); m.rise(dd, t0 + 250);
  });
  const fwd = text(s, [{ text: "Next: ", options: { bold: true, color: C.accent1 } }, { text: MKT.next, options: { color: C.text2 } }],
    { x: MX, y: 6.33, w: 11.0, h: 0.36, fontSize: 16 });
  m.fade(fwd, 1300, 900);
  homeButton(s, state.IDX.contents);
  s.addNotes(MKT.notes_takeaways);
});

// =====================================================================
def("refs", "Content", (s) => {
  const { text, m, ambient, header, source, homeButton } = K;
  ambient(s, ["amber", 12.2, 7.1, 8], ["gold", 1.0, 0.5, 5]);
  header(s, "05 — CONCLUSION & SOURCES", "Key sources");
  const refs = [...MKT.refs_slide].sort((a, b) => a.localeCompare(b, "en")).map((r) => { const k = r.indexOf(". ("); return k > 0 ? [r.slice(0, k + 1) + " ", r.slice(k + 2)] : [r, ""]; });
  const half = Math.ceil(refs.length / 2), w = (W - 2 * MX - 0.5) / 2;
  [refs.slice(0, half), refs.slice(half)].forEach((col, j) => {
    const runs = [];
    col.forEach(([a, b], k) => {
      runs.push({ text: a, options: { bold: true, color: C.text1 } });
      const parts = b.split("*");
      parts.forEach((t, j) => { if (t) runs.push({ text: t, options: { color: C.text2, italic: j % 2 === 1 } }); });
      runs[runs.length - 1].options.breakLine = k < col.length - 1;
    });
    const t = text(s, runs, { x: MX + j * (w + 0.5), y: 1.95, w, h: 4.45, fontSize: 13, paraSpaceAfter: 6 });
    anim.hang(t, 182880); // 0.2" hanging indent, as in an APA reference list
    m.rise(t, 300 + j * 200, 900, 0.015);
  });
  source(s, "The full APA 7th-edition reference list (63 sources) is in the written report.");
  homeButton(s, state.IDX.contents);
  s.addNotes("These are the main sources. The written report contains the complete APA reference list and in-text citations.");
});

// =====================================================================
def("thanks", "Title", (s) => {
  const { text, img, m, ambient, button } = K;
  ambient(s, ["amber", 10.1, 4.0, 9.5], ["blue", 0.8, 0.5, 7]);
  img(s, A("drop.png"), { x: 7.95, y: 1.45, w: 4.35, h: 5.49, name: "!!drop", altText: "Oil drop illustration" });
  text(s, "Thank you", { x: MX, y: 2.0, w: 7.2, h: 1.4, fontSize: 88, bold: true, name: "!!title" });
  const b = text(s, "Questions?", { x: MX, y: 3.45, w: 7.2, h: 0.8, fontSize: 40, color: C.text2 });
  const c = text(s, [
    { text: "Shahad Issa Obaid Alghriabi", options: { fontSize: 24, bold: true, color: C.text1, breakLine: true } },
    { text: "EGCH2230 · Petroleum and Petrochemical Processing", options: { fontSize: 16, color: C.text2, breakLine: true } },
    { text: "University of Technology and Applied Sciences · Salalah", options: { fontSize: 16, color: C.text2 } },
  ], { x: MX, y: 4.85, w: 7.4, h: 1.3, paraSpaceAfter: 4 });
  const [pb, pt] = button(s, "Back to contents", MX, 6.15, 2.6, 0.5, state.IDX.contents, { name: "thanks_back", line: HEX.line, icon: ["TbArrowLeft", HEX.text, "left"] });
  m.drift("!!drop", 0, 3800, 0, -0.014);
  m.rise(b, 600, 900); m.rise(c, 900, 900); m.fade(pb, 1300, 700); m.fade(pt, 1300, 700); m.fade("thanks_back_ic", 1300, 700);
  s.addNotes("Thank you. I am happy to take questions; the contents slide links to every chapter, and the map slide links to a zoomed view of each producing region.");
});

REG.hiddenSlides(state, ctx);

// ---------- build ----------
async function main() {
  let chrome;
  ({ pres, C, chrome } = await makePres());
  anim = new Anim();
  K = createKit({ pres, C, anim, ic: state.ic, chrome });
  for (const [n, c] of ICONS) if (!state.ICON[`${n}:${c}`]) state.ICON[`${n}:${c}`] = await icon(n, "#" + c);
  // hidden zoom slides go straight after the map: → on any of them continues to the regions slide,
  // and the normal running order skips them
  const hiddenIds = state.ORDER.filter((d) => d.opts.hidden);
  state.ORDER = state.ORDER.filter((d) => !d.opts.hidden);
  state.ORDER.splice(state.ORDER.findIndex((d) => d.id === "map") + 1, 0, ...hiddenIds);
  state.ORDER.forEach((d, i) => { state.IDX[d.id] = i + 1; });
  const shownNo = {};
  let shown = 0;
  for (const d of state.ORDER) { if (!d.opts.hidden) shown++; shownNo[d.id] = shown; }
  const sections = { title: "Introduction", sec1: "01 History & Types", sec2: "02 Resources & Growth", sec3: "03 Reservoir Locations",
    sec4: "04 Exports & Costs", takeaways: "05 Conclusion & Sources" };
  let secTitle = "Introduction";
  for (const d of state.ORDER) {
    if (sections[d.id]) { secTitle = sections[d.id]; pres.addSection({ title: secTitle }); }
    K.begin(d.id);
    const o = d.opts;
    anim.begin(state.IDX[d.id], { transition: o.transition || "morph", dur: o.dur || 1400, hidden: !!o.hidden,
      advClick: o.advClick !== false, partner: o.partner ? state.IDX[o.partner] : null });
    const s = pres.addSlide({ masterName: d.master, sectionTitle: secTitle });
    const addNotes = s.addNotes.bind(s);
    s.addNotes = (t) => addNotes(typoNotes(t));
    d.fn(s);
    K.chrome(s, d.master, shownNo[d.id]);
  }
  fs.mkdirSync(path.dirname(OUT_RAW), { recursive: true });
  await pres.writeFile({ fileName: OUT_RAW });
  await applyTheme(OUT_RAW, THEME);
  anim.write(path.join(OUT_DIR, "anim.json"));
  console.log("slides:", state.ORDER.length, state.ORDER.map((d) => d.id).join(", "));
}
main().catch((e) => { console.error(e); process.exit(1); });
