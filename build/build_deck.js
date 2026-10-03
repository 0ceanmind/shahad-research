// Kuwait: A Century of Oil & Gas — EGCH2230 deck (pptxgenjs). Run: node build_deck.js
const fs = require("fs");
const path = require("path");
const { makePres, THEME, HEX, W, H, MX, A, Anim } = require("./deck_base");
const { applyTheme } = require("./apply_theme.js");
const { icon } = require("./icons");

const OUT_RAW = path.join(__dirname, "out", "deck_raw.pptx");
const SERIES = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "series.json")));
const FIELDS = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "fields.json")));
const MKT = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "markets.json")));
const MAPF = JSON.parse(fs.readFileSync(A("map_frame.json")));

let pres, C, anim, ICON = {};
const ICONS = [
  ["TbHistory", HEX.oil], ["TbBuildingFactory2", HEX.oil], ["TbMapPin", HEX.oil], ["TbShip", HEX.oil], ["TbBooks", HEX.oil],
  ["TbArrowRight", HEX.text2], ["TbLayoutGrid", HEX.text2], ["TbDroplet", HEX.oil], ["TbFlame", HEX.gas], ["TbShip", HEX.text],
  ["TbBarrel", HEX.oil], ["TbChevronRight", HEX.text3], ["TbBuildingFactory", HEX.oil], ["TbFlask", HEX.oil],
  ["TbWorld", HEX.oil], ["TbCurrencyDollar", HEX.oil], ["TbChartBar", HEX.oil], ["TbFlame", HEX.oil], ["TbAnchor", HEX.oil],
  ["TbDroplet", HEX.gas], ["TbTrendingUp", HEX.oil], ["TbGasStation", HEX.oil], ["TbTargetArrow", HEX.oil],
  ["TbBuildingBank", HEX.oil], ["TbWorld", HEX.gas], ["TbFlame", HEX.red], ["TbCoin", HEX.oil],
];
const ic = (n, c) => ICON[`${n}:${c}`];

// ---------- helpers ----------
let SID = "", NCOUNT = 0, CUR;
const nm = (tag = "o") => `${SID}_${tag}_${++NCOUNT}`;
function text(s, str, o) {
  const name = o.name || nm("t");
  delete o.name;
  s.addText(str, Object.assign({ margin: 0, isTextBox: true, fontFace: "Arial", color: C.text1, valign: "top", objectName: name }, o));
  return name;
}
function shape(s, type, o) {
  const name = o.name || nm("s");
  delete o.name;
  s.addShape(type, Object.assign({ line: { type: "none" }, objectName: name }, o));
  return name;
}
function img(s, data, o) {
  const name = o.name || nm("i");
  delete o.name;
  s.addImage(Object.assign(data.startsWith("image/") ? { data } : { path: data }, { objectName: name }, o));
  return name;
}
const glow = (color, size = 14, opacity = 0.65) => ({ type: "outer", color, blur: size, offset: 0, angle: 90, opacity });
function phText(s, str, ph, name) {
  s.addText(str, { placeholder: ph });
  s._slideObjects[s._slideObjects.length - 1].options.objectName = name;  // layout options would override it
}
function header(s, kicker, title, kickerName = "!!kicker") {
  phText(s, kicker, "kicker", kickerName);
  const t = `${SID}_title`;
  phText(s, title, "title", t);
  anim.add(t, "float", 0, 800);
}
function source(s, str) {
  text(s, str, { x: MX, y: 6.5, w: 10.6, h: 0.3, fontSize: 12, color: C.text2, valign: "middle" });
}
function homeButton(s) {
  const x = W - MX - 1.1, y = 6.86, d = 0.42;
  shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, rectRadius: 0.1, fill: { color: HEX.card2 },
    hyperlink: { slide: IDX.contents, tooltip: "Back to contents" }, name: nm("home") });
  img(s, ic("TbLayoutGrid", HEX.text2), { x: x + 0.09, y: y + 0.09, w: 0.24, h: 0.24 });
  // invisible hit target on top so the icon is clickable too
  shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, rectRadius: 0.1, fill: { color: "000000", transparency: 100 },
    hyperlink: { slide: IDX.contents, tooltip: "Back to contents" } });
}
const chartText = { catAxisLabelColor: HEX.text2, valAxisLabelColor: HEX.text2, catAxisLabelFontSize: 16,
  valAxisLabelFontSize: 16, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  dataLabelColor: HEX.text, dataLabelFontSize: 16, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true };
const chartFrame = () => ({ chartArea: { fill: { color: HEX.bg, transparency: 100 }, roundedCorners: false },
  plotArea: { fill: { color: HEX.bg, transparency: 100 } } });
const fmt = (n) => n.toLocaleString("en-US");

// ---------- slide registry ----------
const ORDER = [];
const IDX = {};
const def = (id, master, fn, transition = "morph") => ORDER.push({ id, master, fn, transition });

// =====================================================================
def("title", "Title", (s) => {
  img(s, A("drop.png"), { x: 7.95, y: 1.2, w: 4.35, h: 5.49, name: "!!drop" });
  text(s, "EGCH2230  ·  PETROLEUM & PETROCHEMICAL PROCESSING", { x: MX, y: 1.45, w: 7.6, h: 0.4, fontSize: 13,
    bold: true, color: C.accent1, charSpacing: 1.5, name: "ti_kick" });
  text(s, "Kuwait", { x: MX, y: 1.95, w: 7.2, h: 1.45, fontSize: 96, bold: true, name: "ti_title" });
  text(s, "A Century of Oil & Gas", { x: MX, y: 3.38, w: 7.2, h: 0.75, fontSize: 40, color: C.text1, name: "ti_sub" });
  text(s, "History  ·  Resources  ·  Reservoirs  ·  Markets", { x: MX, y: 4.2, w: 7.2, h: 0.45, fontSize: 20, color: C.text2, name: "ti_tag" });
  text(s, [
    { text: "Shahad Issa Obaid Alghriabi", options: { fontSize: 24, bold: true, color: C.text1, breakLine: true } },
    { text: "University of Technology and Applied Sciences", options: { fontSize: 16, color: C.text2 } },
  ], { x: MX, y: 5.35, w: 7.2, h: 0.9, name: "ti_name", paraSpaceAfter: 4 });
  anim.add("!!drop", "zoom", 0, 1600);
  anim.add("ti_kick", "fade", 500, 800);
  anim.add("ti_title", "float", 700, 1000);
  anim.add("ti_sub", "float", 950, 1000);
  anim.add("ti_tag", "fade", 1250, 900);
  anim.add("ti_name", "float", 1500, 900);
  s.addNotes("Welcome. This presentation summarises my EGCH2230 research on the State of Kuwait: the history and types of its oil and gas, its resources and industrial growth, where its reservoirs are, and where its exports go and what they cost. Full references are in the written report and on the final slides.");
}, "fade");

// =====================================================================
def("contents", "Content", (s) => {
  header(s, "CONTENTS", "The story in five chapters", "co_kick");
  const tiles = [
    ["01", "History & Types", "1934 to today", "TbHistory", "sec1"],
    ["02", "Resources & Growth", "Reserves and output", "TbBuildingFactory2", "sec2"],
    ["03", "Reservoir Locations", "Fields and rocks", "TbMapPin", "sec3"],
    ["04", "Exports & Costs", "Markets and prices", "TbShip", "sec4"],
    ["05", "References", "Sources used", "TbBooks", "refs"],
  ];
  const gap = 0.25, w = (W - 2 * MX - 4 * gap) / 5, y = 2.05, h = 3.85;
  tiles.forEach(([n, t, d, ico, target], i) => {
    const x = MX + i * (w + gap);
    const link = { slide: IDX[target], tooltip: `Go to ${t}` };
    const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18, fill: { color: HEX.card } });
    const circ = shape(s, pres.shapes.OVAL, { x: x + 0.3, y: y + 0.35, w: 0.78, h: 0.78, fill: { color: HEX.card2 } });
    const ii = img(s, ic(ico, HEX.oil), { x: x + 0.48, y: y + 0.53, w: 0.42, h: 0.42 });
    const nn = text(s, n, { x: x + 0.3, y: y + 1.4, w: w - 0.5, h: 0.6, fontSize: 34, bold: true, color: C.accent1 });
    const tt = text(s, t, { x: x + 0.3, y: y + 2.05, w: w - 0.45, h: 0.9, fontSize: 21, bold: true });
    const dd = text(s, d, { x: x + 0.3, y: y + 2.95, w: w - 0.45, h: 0.35, fontSize: 15, color: C.text2 });
    const ar = img(s, ic("TbArrowRight", HEX.text2), { x: x + w - 0.62, y: y + h - 0.6, w: 0.3, h: 0.3 });
    const hit = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18,
      fill: { color: "000000", transparency: 100 }, hyperlink: link });
    const t0 = 300 + i * 160;
    [card, circ, ii, nn, tt, dd, ar].forEach((o) => anim.add(o, "float", t0, 800));
  });
  const hint = text(s, "Click a chapter to jump to it. The grid button at the bottom of each slide returns here.",
    { x: MX, y: 6.15, w: 10, h: 0.35, fontSize: 15, color: C.text2 });
  anim.add(hint, "fade", 1400, 800);
  s.addNotes("This slide is the navigation hub. Each tile is a link to its chapter; the small grid button on every slide links back here, so questions can be answered by jumping straight to the relevant chapter.");
});

// =====================================================================
def("glance", "Content", (s) => {
  header(s, "AT A GLANCE", "A small country with a giant reservoir");
  const stats = [
    ["101.5", "billion barrels", "proven crude oil reserves, about 6.5% of the world total", "TbBarrel"],
    ["2.4", "million b/d", "crude oil produced in 2024 (OPEC+ quota period)", "TbDroplet"],
    ["1.4", "million b/d", "domestic refining capacity since Al-Zour came on line", "TbBuildingFactory"],
    ["90%+", "of exports", "and of government revenue come from petroleum", "TbCoin"],
  ];
  const gap = 0.35, w = (W - 2 * MX - 3 * gap) / 4;
  stats.forEach(([v, u, l, ico], i) => {
    const x = MX + i * (w + gap), t0 = 350 + i * 220;
    const a = img(s, ic(ico, HEX.oil), { x, y: 2.3, w: 0.55, h: 0.55 });
    const b = text(s, v, { x, y: 2.95, w, h: 1.1, fontSize: 66, bold: true, color: i === 0 ? C.accent1 : C.text1 });
    const c = text(s, u, { x, y: 4.05, w, h: 0.45, fontSize: 22, bold: true });
    const d = text(s, l, { x, y: 4.55, w: w - 0.1, h: 1.0, fontSize: 16, color: C.text2 });
    anim.add(a, "fade", t0, 700); anim.add(b, "zoom", t0, 900); anim.add(c, "float", t0 + 150, 700); anim.add(d, "fade", t0 + 300, 700);
  });
  source(s, "Sources: OPEC Annual Statistical Bulletin (2025, 2026); IMF crude production series via FRED; KNPC; KIPIC; Britannica.");
  homeButton(s);
  s.addNotes("Kuwait is smaller than Oman's Dhofar governorate but holds 101.5 billion barrels of proven crude reserves (OPEC), about 6.5% of the world total. In 2024 it produced about 2.4 million barrels per day of crude while OPEC+ cuts were in force. Refining capacity reached about 1.4 million b/d once the Al-Zour refinery was fully on line in 2023-2024. Petroleum provides more than 90% of export earnings and of government revenue (Britannica).");
});

// =====================================================================
function section(n, title, sub, idx) {
  return (s) => {
    img(s, A("drop.png"), { x: 1.0, y: 1.15, w: 3.8, h: 4.8, name: "!!drop" });
    text(s, n, { x: 5.3, y: 1.5, w: 4.5, h: 1.7, fontSize: 120, bold: true, color: C.accent1, name: "!!kicker" });
    const t = text(s, title, { x: 5.3, y: 3.25, w: 7.4, h: 1.0, fontSize: 50, bold: true });
    const st = text(s, sub, { x: 5.3, y: 4.3, w: 7.0, h: 0.9, fontSize: 22, color: C.text2 });
    const dots = [];
    for (let i = 0; i < 4; i++) dots.push(shape(s, pres.shapes.OVAL, { x: 5.32 + i * 0.32, y: 5.5, w: 0.14, h: 0.14,
      fill: { color: i === idx ? HEX.oil : HEX.line } }));
    anim.add("!!drop", "zoom", 0, 1300);   // the previous slide's kicker morphs into the big number
    anim.add(t, "float", 450, 900);
    anim.add(st, "fade", 750, 900);
    dots.forEach((d) => anim.add(d, "fade", 1000, 600));
    homeButton(s);
  };
}
def("sec1", "Section", (s) => { section("01", "History & Types", "From a pearling port to a petroleum state", 0)(s);
  s.addNotes("Chapter one: how Kuwait's oil industry began and developed, and which types of crude oil and natural gas it produces."); });

// =====================================================================
def("timeline", "Content", (s) => {
  header(s, "01 — HISTORY & TYPES", "Ninety years in nine moments");
  const items = [
    ["1934", "Oil concession signed with KOC"], ["1938", "Oil strikes at Burgan No. 1"],
    ["1946", "First crude export"], ["1960", "Co-founds OPEC; KNPC formed"],
    ["1975", "KOC fully nationalised"], ["1980", "KPC created"],
    ["1991", "Invasion and 700+ well fires"], ["2018", "Jurassic super-light crude and gas"],
    ["2024", "Al-Zour refinery at full 615 kb/d"],
  ];
  const x0 = 1.35, x1 = W - 1.35, yL = 4.05, step = (x1 - x0) / (items.length - 1);
  const line = shape(s, pres.shapes.RECTANGLE, { x: x0 - 0.3, y: yL - 0.015, w: x1 - x0 + 0.6, h: 0.03, fill: { color: HEX.line } });
  anim.add(line, "wipeL", 200, 1800);
  items.forEach(([yr, lab], i) => {
    const cx = x0 + i * step, up = i % 2 === 0, t0 = 300 + i * 190;
    const col = yr === "1991" ? HEX.red : HEX.oil;
    const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.13, y: yL - 0.13, w: 0.26, h: 0.26, fill: { color: col },
      shadow: glow(col, 12, 0.8) });
    const tick = shape(s, pres.shapes.RECTANGLE, { x: cx - 0.008, y: up ? yL - 0.62 : yL + 0.2, w: 0.016, h: 0.42,
      fill: { color: HEX.line } });
    const yy = text(s, yr, { x: cx - 0.75, y: up ? 2.45 : 4.75, w: 1.5, h: 0.5, fontSize: 28, bold: true,
      color: yr === "1991" ? C.accent4 : C.text1, align: "center", name: yr === "1991" ? "!!y1991" : undefined });
    const ll = text(s, lab, { x: cx - 0.74, y: up ? 2.95 : 5.25, w: 1.48, h: 0.8, fontSize: 15, color: C.text2, align: "center" });
    anim.add(dot, "zoom", t0, 500); anim.add(tick, "fade", t0 + 100, 400);
    anim.add(yy, "float", t0 + 100, 600); anim.add(ll, "fade", t0 + 200, 600);
  });
  source(s, "Sources: KOC (n.d.); KPC (n.d.); KNPC timeline; Britannica; S&P Global (2018, 2024); KIPIC (2024).");
  homeButton(s);
  s.addNotes("1934: Sheikh Ahmad Al-Jaber signed the concession with the Kuwait Oil Company, a 50/50 venture of Anglo-Persian (later BP) and Gulf Oil. 1938: Burgan No. 1 struck oil at about 1,120 m in the Wara sandstone (23 Feb 1938 per KOC; some sources say 22 Feb). 1946: first crude export on 30 June. 1960: Kuwait co-founded OPEC in Baghdad and created KNPC. 1974-75: the state took 60%, then 100%, of KOC. 1980: Kuwait Petroleum Corporation formed as the holding company. 1990-91: the Iraqi invasion and the well fires. 2018: Jurassic production facilities started and Kuwait Super Light crude was first exported. 2024: Al-Zour refinery reached its full 615,000 b/d capacity.");
});

// =====================================================================
def("fires", "Fire", (s) => {
  header(s, "1991 — THE OIL FIRES", "When the desert burned", "!!y1991");
  const big = text(s, "700+", { x: MX, y: 1.95, w: 6.2, h: 2.0, fontSize: 150, bold: true, color: C.text1 });
  const bl = text(s, "oil wells set ablaze by retreating Iraqi forces in February 1991", { x: MX, y: 4.05, w: 5.6, h: 0.95,
    fontSize: 22, color: C.text2 });
  anim.add(big, "zoom", 300, 1100); anim.add(bl, "fade", 700, 800);
  const rows = [
    ["> 1 billion", "barrels of crude oil lost"],
    ["4–6 million b/d", "of oil burning at the peak"],
    ["6 Nov 1991", "last fire capped: Burgan well 118"],
  ];
  rows.forEach(([v, l], i) => {
    const y = 2.0 + i * 1.32, t0 = 1000 + i * 300;
    const a = text(s, v, { x: 7.3, y, w: 5.4, h: 0.7, fontSize: 40, bold: true, color: i === 2 ? C.accent1 : C.accent4 });
    const b = text(s, l, { x: 7.3, y: y + 0.68, w: 5.4, h: 0.45, fontSize: 18, color: C.text2 });
    anim.add(a, "float", t0, 700); anim.add(b, "fade", t0 + 150, 700);
  });
  const rec = text(s, [{ text: "Recovery: ", options: { bold: true, color: C.text1 } },
    { text: "27 international teams and Kuwait's own Wild Well Killers; pre-war output restored within about four years.", options: { color: C.text2 } }],
    { x: MX, y: 5.45, w: 6.3, h: 0.8, fontSize: 17 });
  anim.add(rec, "fade", 2100, 800);
  source(s, "Sources: KOC, Oil fires (n.d.); U.S. DoD GulfLINK (1998, 2000); Britannica. Estimates of wells ignited range from about 605 to 750.");
  homeButton(s);
  s.addNotes("Between August 1990 and February 1991 about 80% of KOC's producing wells and facilities were destroyed (KOC). More than 700 wells were set on fire; the U.S. Department of Defense counted over 750 of 943 wells ignited or damaged. At the peak an estimated 4-6 million barrels per day of oil and 70-100 million cubic metres per day of gas were burning, and more than one billion barrels were lost. The last fire, Burgan 118, was capped on 6 November 1991. Kuwait's own team, the Kuwait Wild Well Killers, capped 41 wells in 54 days. Spilled oil formed more than 100 oil lakes covering about 19 square kilometres (U.S. DoD).");
});

// =====================================================================
def("crudes", "Content", (s) => {
  header(s, "01 — HISTORY & TYPES", "Four crudes on one scale");
  const x0 = 0.95, x1 = W - 0.95, y = 3.72, api0 = 10, api1 = 50;
  const X = (api) => x0 + (api - api0) / (api1 - api0) * (x1 - x0);
  const bar = img(s, A("api_scale.png"), { x: x0, y: y - 0.16, w: x1 - x0, h: 0.32 });
  anim.add(bar, "wipeL", 200, 1500);
  // classification zones
  [[10, 22.3, "Heavy"], [22.3, 28.0, "Medium"], [31.1, 50, "Light"]].forEach(([a, b, lab], i) => {
    const t = text(s, lab.toUpperCase(), { x: X(a), y: y + 0.3, w: X(b) - X(a), h: 0.35, fontSize: 14, bold: true,
      color: C.text2, align: "center", charSpacing: 2 });
    anim.add(t, "fade", 900 + i * 120, 600);
  });
  [22.3, 31.1].forEach((a) => anim.add(shape(s, pres.shapes.RECTANGLE, { x: X(a) - 0.01, y: y - 0.3, w: 0.02, h: 0.6,
    fill: { color: HEX.text2 } }), "fade", 900, 600));
  [10, 20, 30, 40, 50].forEach((a) => anim.add(text(s, `${a}°`, { x: X(a) - 0.4, y: y + 0.62, w: 0.8, h: 0.3, fontSize: 13,
    color: C.text2, align: "center" }), "fade", 1000, 600));
  const crudes = [
    { n: "Kuwait Export Heavy", api: 16, s: "4.9% S", d: "Heavy, very sour", up: true },
    { n: "Khafji", api: 28.5, s: "2.85% S", d: "Partitioned Zone, offshore", up: false },
    { n: "Kuwait Export Crude", api: 30.5, s: "2.5% S", d: "Main export blend (KEC)", up: true },
    { n: "Kuwait Super Light", api: 48, s: "0.4% S", d: "Jurassic, North Kuwait", up: true },
  ];
  crudes.forEach((c, i) => {
    const cx = X(c.api), cw = 3.15, ch = 1.18, t0 = 1300 + i * 260;
    let cardX = Math.min(Math.max(cx - cw / 2, MX), W - MX - cw);
    const cy = c.up ? 1.95 : 4.72;
    const m = shape(s, pres.shapes.OVAL, { x: cx - 0.17, y: y - 0.17, w: 0.34, h: 0.34, fill: { color: HEX.text },
      line: { color: HEX.bg, width: 3 }, shadow: glow(HEX.oil, 10, 0.9) });
    const st = shape(s, pres.shapes.RECTANGLE, { x: cx - 0.008, y: c.up ? cy + ch : y + 0.2, w: 0.016,
      h: c.up ? y - 0.2 - (cy + ch) : cy - (y + 0.2), fill: { color: HEX.line } });
    const card = text(s, [
      { text: c.n, options: { fontSize: 19, bold: true, color: C.text1, breakLine: true } },
      { text: `${c.api}° API  ·  ${c.s}`, options: { fontSize: 17, bold: true, color: C.accent1, breakLine: true } },
      { text: c.d, options: { fontSize: 15, color: C.text2 } },
    ], { x: cardX, y: cy, w: cw, h: ch, fill: { color: HEX.card }, margin: [12, 10, 6, 6], shape: pres.shapes.ROUNDED_RECTANGLE,
      rectRadius: 0.12, paraSpaceAfter: 2 });
    anim.add(m, "zoom", t0, 500); anim.add(st, "fade", t0 + 100, 400); anim.add(card, "float", t0 + 100, 700);
  });
  const f = text(s, "API gravity = 141.5 / SG − 131.5   ·   higher API = lighter oil   ·   S = sulfur content (wt%)",
    { x: MX, y: 6.08, w: 10.5, h: 0.32, fontSize: 14, color: C.text2 });
  anim.add(f, "fade", 2400, 700);
  source(s, "Sources: OIES (2021); Energy Intelligence crude profiles; S&P Global (2018, 2020); EIA (2023). API classes per API/US definitions.");
  homeButton(s);
  s.addNotes("Kuwait Export Crude (KEC) is the main export blend: medium and sour, about 30.5 degrees API and 2.5% sulfur, mostly from the Cretaceous reservoirs of Greater Burgan. Since July 2018 Kuwait also exports Kuwait Super Light Crude from the deep Jurassic reservoirs of North Kuwait: about 48 degrees API and only about 0.4% sulfur. Kuwait Export Heavy is about 16 degrees API with almost 5% sulfur. Khafji crude from the offshore Partitioned Zone shared with Saudi Arabia is about 28.5 degrees API and 2.85% sulfur. For refiners, sour crudes need hydrotreating capacity, which is why Kuwait's new refineries have large desulfurisation units.");
});

// =====================================================================
def("gastypes", "Gas", (s) => {
  header(s, "01 — HISTORY & TYPES", "Gas: mostly a by-product of oil");
  const ch = `${SID}_donut`;
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Gas production by type, 2021", labels: ["Associated", "Non-associated"], values: [70, 30] }],
    Object.assign({ x: 0.7, y: 1.95, w: 4.3, h: 4.3, holeSize: 72, chartColors: [HEX.oil, HEX.gas], showLegend: false,
      showValue: false, showPercent: false, dataBorder: { pt: 0, color: HEX.bg }, objectName: ch, firstSliceAng: 0,
      layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, chartFrame()));
  anim.add(ch, "zoom", 300, 1100);
  const c1 = text(s, "70%", { x: 1.65, y: 3.3, w: 2.4, h: 0.9, fontSize: 54, bold: true, align: "center" });
  const c2 = text(s, "associated gas, 2021", { x: 1.75, y: 4.18, w: 2.2, h: 0.35, fontSize: 14, color: C.text2, align: "center" });
  anim.add(c1, "fade", 900, 700); anim.add(c2, "fade", 1000, 700);
  const rows = [
    ["TbDroplet", HEX.oil, "Associated gas", "Released with crude oil; output rises and falls with oil quotas"],
    ["TbFlame", HEX.gas, "Non-associated Jurassic gas", "Deep, high-pressure, sour gas in North Kuwait; on stream since 2018"],
    ["TbShip", HEX.text, "Imported LNG", "Since 2009; about 40% of the gas used in 2024 was imported"],
  ];
  rows.forEach(([ico, col, h, d], i) => {
    const y = 2.05 + i * 1.3, t0 = 900 + i * 280;
    const circ = shape(s, pres.shapes.OVAL, { x: 5.75, y, w: 0.8, h: 0.8, fill: { color: HEX.card2 } });
    const ii = img(s, ic(ico, col), { x: 5.94, y: y + 0.19, w: 0.42, h: 0.42 });
    const hh = text(s, h, { x: 6.85, y: y - 0.02, w: 5.9, h: 0.45, fontSize: 22, bold: true });
    const dd = text(s, d, { x: 6.85, y: y + 0.43, w: 5.9, h: 0.65, fontSize: 16, color: C.text2 });
    [circ, ii].forEach((o) => anim.add(o, "zoom", t0, 600)); anim.add(hh, "float", t0 + 100, 700); anim.add(dd, "fade", t0 + 200, 700);
  });
  const res = text(s, [{ text: "63 Tcf ", options: { bold: true, color: C.accent2 } },
    { text: "(1.78 trillion m³) proven gas reserves, <1% of world", options: { color: C.text2 } }],
    { x: 5.75, y: 5.95, w: 7.0, h: 0.4, fontSize: 17 });
  anim.add(res, "fade", 2000, 700);
  source(s, "Sources: EIA Country Analysis Brief: Kuwait (2023); Energy Institute Statistical Review (2025); S&P Global (2018); OPEC ASB.");
  homeButton(s);
  s.addNotes("About 70% of Kuwait's gas production in 2021 was associated gas, released when crude oil is produced, so gas supply follows oil output and OPEC+ quotas. The second type is non-associated gas from deep Jurassic reservoirs in North Kuwait: high-pressure, sour gas produced with light oil and condensate through the Jurassic Production Facilities since 2018. Because demand, mainly for power and desalination, exceeds supply, Kuwait has imported LNG since 2009. In 2024 about 40% of the gas it consumed was imported (Energy Institute data). Proven gas reserves are about 63 trillion cubic feet.");
});

// =====================================================================
def("sec2", "Section", (s) => { section("02", "Resources & Growth", "Reserves, output and an industry built around them", 1)(s);
  s.addNotes("Chapter two: how much oil and gas Kuwait has, how its production has changed over eighty years, and how its industry grew from a single concession into a full value chain."); });

// =====================================================================
def("reserves", "Content", (s) => {
  header(s, "02 — RESOURCES & GROWTH", "Seventh-largest oil reserves on Earth");
  const a = text(s, "101.5", { x: MX, y: 2.0, w: 6.6, h: 1.75, fontSize: 130, bold: true, color: C.accent1 });
  const b = text(s, "billion barrels of proven crude oil", { x: MX, y: 3.95, w: 6.4, h: 0.5, fontSize: 26, bold: true });
  const c = text(s, "Unchanged in official statistics since about 2010: additions have offset about one billion barrels produced each year.",
    { x: MX, y: 4.55, w: 6.0, h: 0.85, fontSize: 17, color: C.text2 });
  const d = text(s, [{ text: "≈100 years ", options: { bold: true, color: C.text1 } },
    { text: "of output left at today's rate", options: { color: C.text2 } }],
    { x: MX, y: 5.55, w: 6.0, h: 0.45, fontSize: 17 });
  anim.add(a, "zoom", 200, 1100); anim.add(b, "float", 600, 800); anim.add(c, "fade", 900, 800); anim.add(d, "fade", 1150, 800);
  const ch = `${SID}_share`;
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Share of world proven crude reserves", labels: ["Kuwait", "Rest of world"], values: [6.5, 93.5] }],
    Object.assign({ x: 7.6, y: 1.9, w: 4.5, h: 4.5, holeSize: 74, chartColors: [HEX.oil, HEX.card2], showLegend: false,
      showValue: false, dataBorder: { pt: 0, color: HEX.bg }, objectName: ch, firstSliceAng: 0,
      layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, chartFrame()));
  anim.add(ch, "zoom", 500, 1200);
  const e = text(s, "6.5%", { x: 8.35, y: 3.5, w: 3.0, h: 0.9, fontSize: 54, bold: true, align: "center" });
  const f = text(s, "of world reserves", { x: 8.35, y: 4.35, w: 3.0, h: 0.4, fontSize: 16, color: C.text2, align: "center" });
  anim.add(e, "fade", 1300, 700); anim.add(f, "fade", 1400, 700);
  source(s, "Sources: OPEC ASB 2025, 2026 (world 1,567–1,572 bn bbl); EIA (2023); bp (2021). Includes half of the Partitioned Zone.");
  homeButton(s);
  s.addNotes("OPEC's 2025 and 2026 bulletins both list Kuwait's proven crude reserves at 101.5 billion barrels, about 6.5% of the world's 1,567-1,572 billion barrels, which ranks Kuwait seventh in the world (EIA). The figure includes Kuwait's half of the Partitioned Zone shared with Saudi Arabia. Reserves jumped from about 68 billion barrels in 1980 to 97 billion in 1990 after OPEC-wide revisions and have stayed at 101.5 billion since about 2010. At about one billion barrels produced per year, that is roughly a century of output; bp's 2021 review gave a reserves-to-production ratio of 103 years.");
});

// =====================================================================
def("production", "Content", (s) => {
  header(s, "02 — RESOURCES & GROWTH", "Eight decades of output");
  const P = SERIES.production_kbd;
  const years = Object.keys(P).map(Number).sort((a, b) => a - b);
  const box = { x: 0.55, y: 1.9, w: 12.2, h: 4.5 }, L = { x: 0.075, y: 0.06, w: 0.9, h: 0.8 };
  const xmin = 1940, xmax = 2025, ymax = 3500;
  const ch = `${SID}_chart`;
  s.addChart(pres.charts.SCATTER, [{ name: "Year", values: years }, { name: "Oil production (kb/d)", values: years.map((y) => P[y]) }],
    Object.assign({}, chartText, chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, layout: L, objectName: ch,
      chartColors: [HEX.oil], lineSize: 4, lineDataSymbol: "none", showLegend: false,
      catAxisMinVal: xmin, catAxisMaxVal: xmax, catAxisMajorUnit: 10, valAxisMinVal: 0, valAxisMaxVal: ymax, valAxisMajorUnit: 1000,
      valAxisLabelFormatCode: "0", valGridLine: { color: "2C2C2E", size: 0.75 },
      catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
  anim.add(ch, "wipeL", 200, 2600);
  const px = (yr) => box.x + box.w * (L.x + L.w * (yr - xmin) / (xmax - xmin));
  const py = (v) => box.y + box.h * (L.y + L.h * (1 - v / ymax));
  // [year, value, line1, line2, label centre-x offset (in), label top offset from point (in), leader?]
  const notes = [
    [1946, P[1946], "1946", "first exports", 0.0, -1.95, true],
    [1972, P[1972], "1972 · 3.34 mb/d", "all-time peak", 0, -0.92, false],
    [1991, P[1991], "1991 · 0.19 mb/d", "invasion and fires", 1.32, -0.5, false],
    [2016, P[2016], "2016 · 3.15 mb/d", "post-war high", 0, -0.92, false],
    [2024, P[2024], "2024 · 2.7 mb/d", "OPEC+ cuts", -0.35, 0.22, false],
  ];
  notes.forEach(([yr, v, a, b, ox, oy, leader]) => {
    const t0 = 200 + 2600 * (px(yr) - box.x) / box.w;
    const cx = px(yr), cy = py(v);
    const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: HEX.text },
      line: { color: HEX.oil, width: 2.5 }, shadow: glow(HEX.oil, 10, 0.8) });
    const lw = 2.2, lx = Math.min(cx + ox - lw / 2, W - MX - lw);
    const lab = text(s, [{ text: a, options: { bold: true, color: C.text1, breakLine: true } }, { text: b, options: { color: C.text2 } }],
      { x: lx, y: cy + oy, w: lw, h: 0.62, fontSize: 16, align: "center" });
    anim.add(dot, "zoom", Math.round(t0), 500); anim.add(lab, "fade", Math.round(t0) + 100, 600);
    if (leader) {
      const ld = shape(s, pres.shapes.RECTANGLE, { x: cx - 0.007, y: cy + oy + 0.66, w: 0.014, h: -oy - 0.78, fill: { color: HEX.text3 } });
      anim.add(ld, "fade", Math.round(t0) + 100, 600);
    }
  });
  const unit = text(s, "thousand barrels per day", { x: box.x + 0.95, y: box.y - 0.05, w: 4, h: 0.3, fontSize: 14, color: C.text2 });
  anim.add(unit, "fade", 300, 600);
  source(s, "Sources: Energy Institute Statistical Review of World Energy (2025), total oil incl. NGLs (some years derived from EI energy data); 1946–55 from KOC/KPC records.");
  homeButton(s);
  s.addNotes("Output rose from about 16 thousand b/d in 1946 to an all-time peak of 3.34 million b/d in 1972 (Energy Institute, total oil including NGLs). After nationalisation, conservation policy and the 1980s price collapse it fell to around one million b/d. The 1990-91 invasion and fires cut it to only 185 thousand b/d in 1991. It recovered within four years and reached 3.15 million b/d in 2016. Since 2017 OPEC+ agreements have set Kuwait's production; in 2024 crude alone averaged about 2.4 million b/d (IMF/OPEC), or about 2.7 million b/d including NGLs.");
});

// =====================================================================
def("gasbalance", "Gas", (s) => {
  header(s, "02 — RESOURCES & GROWTH", "Burning more gas than it produces");
  const G = SERIES.gas;
  const yrs = []; for (let y = 2000; y <= 2024; y++) yrs.push(y);
  const ch = `${SID}_area`;
  s.addChart(pres.charts.AREA, [
    { name: "Domestic production", labels: yrs.map(String), values: yrs.map((y) => G[y].prod_bcm) },
    { name: "LNG imports", labels: yrs.map(String), values: yrs.map((y) => Math.round((G[y].cons_bcm - G[y].prod_bcm) * 10) / 10) },
  ], Object.assign({}, chartText, chartFrame(), { x: 0.5, y: 1.95, w: 8.3, h: 4.45, objectName: ch,
    layout: { x: 0.08, y: 0.05, w: 0.9, h: 0.8 }, chartColors: [HEX.gas, "5A5A5F"], chartColorsOpacity: 100,
    barGrouping: "stacked", showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 25, valAxisMajorUnit: 5,
    catAxisLabelFrequency: 4, valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false }));
  anim.add(ch, "wipeL", 200, 2000);
  const l1 = text(s, "LNG imports", { x: 6.15, y: 2.72, w: 2.4, h: 0.35, fontSize: 16, bold: true, color: C.text1 });
  const l2 = text(s, "Domestic production", { x: 5.6, y: 4.6, w: 2.9, h: 0.35, fontSize: 16, bold: true, color: C.bg });
  const l3 = text(s, "billion m³ per year", { x: 1.25, y: 1.95, w: 3, h: 0.3, fontSize: 14, color: C.text2 });
  [l1, l2, l3].forEach((o) => anim.add(o, "fade", 1800, 600));
  const big = text(s, "40%", { x: 9.3, y: 2.0, w: 3.4, h: 1.4, fontSize: 96, bold: true, color: C.accent2 });
  const bt = text(s, "of the gas Kuwait used in 2024 was imported as LNG", { x: 9.3, y: 3.45, w: 3.4, h: 0.95, fontSize: 19, bold: true });
  const bd = text(s, "≈15 bcm produced vs ≈25 bcm consumed. Imports began in 2009; the Al-Zour LNG terminal opened in 2021.",
    { x: 9.3, y: 4.5, w: 3.4, h: 1.4, fontSize: 16, color: C.text2 });
  anim.add(big, "zoom", 1500, 900); anim.add(bt, "float", 1800, 700); anim.add(bd, "fade", 2100, 700);
  source(s, "Source: Energy Institute Statistical Review of World Energy (2025), via Our World in Data; converted at 10 TWh ≈ 1 bcm.");
  homeButton(s);
  s.addNotes("Until 2008 Kuwait consumed exactly the gas it produced. Demand for power generation and desalination grew faster than associated-gas supply, so since 2009 the gap has been filled with imported LNG. In 2024 Kuwait produced about 15 billion cubic metres and consumed about 25 billion, so roughly 40% was imported. Gas now generates about 62% of Kuwait's electricity, up from 33% in 2000, replacing burning crude and fuel oil in power stations (Energy Institute data).");
});

// =====================================================================
def("chain", "Content", (s) => {
  header(s, "02 — RESOURCES & GROWTH", "One state company, the whole chain");
  const top = text(s, [{ text: "KUWAIT PETROLEUM CORPORATION (KPC)", options: { bold: true, color: C.text1 } },
    { text: "   ·   state-owned holding company, est. 1980", options: { color: C.text2 } }],
    { x: MX, y: 1.95, w: W - 2 * MX, h: 0.62, fontSize: 18, fill: { color: HEX.card }, shape: pres.shapes.ROUNDED_RECTANGLE,
      rectRadius: 0.12, margin: [20, 20, 0, 0], valign: "middle", align: "center" });
  anim.add(top, "fade", 200, 800);
  const stages = [
    ["TbDroplet", "Upstream", "KOC: Kuwait fields\nKGOC: Partitioned Zone\nKUFPEC: abroad"],
    ["TbShip", "Shipping", "KOTC tankers\n(since 1957)"],
    ["TbBuildingFactory", "Refining", "KNPC: two refineries\nKIPIC: Al-Zour"],
    ["TbFlask", "Petrochemicals", "PIC (since 1963)\nEQUATE group\n(with Dow)"],
    ["TbGasStation", "Marketing", "KPI: Q8 brand\nfuels and refining\nabroad"],
  ];
  const gap = 0.32, w = (W - 2 * MX - 4 * gap) / 5;
  stages.forEach(([ico, h, d], i) => {
    const x = MX + i * (w + gap), cx = x + w / 2, t0 = 600 + i * 320;
    const circ = shape(s, pres.shapes.OVAL, { x: cx - 0.55, y: 2.95, w: 1.1, h: 1.1, fill: { color: HEX.card2 },
      shadow: glow(HEX.oil, 16, 0.35) });
    const ii = img(s, ic(ico, HEX.oil), { x: cx - 0.3, y: 3.2, w: 0.6, h: 0.6 });
    const hh = text(s, h, { x, y: 4.25, w, h: 0.45, fontSize: 20, bold: true, align: "center" });
    const dd = text(s, d.split("\n").map((t, k, arr) => ({ text: t, options: { breakLine: k < arr.length - 1 } })),
      { x, y: 4.75, w, h: 1.3, fontSize: 15, color: C.text2, align: "center", paraSpaceAfter: 3 });
    anim.add(circ, "zoom", t0, 600); anim.add(ii, "zoom", t0, 600); anim.add(hh, "float", t0 + 100, 600); anim.add(dd, "fade", t0 + 200, 600);
    if (i < 4) {
      const ar = img(s, ic("TbChevronRight", HEX.text3), { x: x + w + gap / 2 - 0.17, y: 3.33, w: 0.34, h: 0.34 });
      anim.add(ar, "fade", t0 + 250, 400);
    }
  });
  source(s, "Sources: KPC (n.d.); KOC (n.d.); KNPC (n.d.); KIPIC (n.d.); KOTC (n.d.); PIC (n.d.); Britannica.");
  homeButton(s);
  s.addNotes("Since 1980 the Kuwait Petroleum Corporation has owned the whole chain. KOC explores and produces onshore and offshore Kuwait; KGOC manages Kuwait's share of the Partitioned Zone with Saudi Arabia; KUFPEC invests in upstream projects abroad. KOTC ships crude, products and LPG. KNPC runs the Mina Al-Ahmadi and Mina Abdullah refineries and KIPIC runs the new Al-Zour refinery. PIC, founded in 1963 as the region's first petrochemical company, holds stakes in the EQUATE group with Dow. Kuwait Petroleum International sells fuel under the Q8 brand and holds refining stakes abroad, including the Duqm refinery in Oman.");
});

// =====================================================================
def("refining", "Content", (s) => {
  header(s, "02 — RESOURCES & GROWTH", "Refining capacity more than doubled");
  const base = 5.6, maxH = 2.85;
  [["Jan 2021", 0.6, HEX.gray], ["Jul 2023", 1.4, HEX.oil]].forEach(([lab, v, col], i) => {
    const h = maxH * v / 1.4, x = 1.0 + i * 2.1, t0 = 300 + i * 500;
    const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y: base - h, w: 1.45, h, rectRadius: 0.1, fill: { color: col },
      shadow: i ? glow(HEX.oil, 18, 0.45) : undefined });
    const vv = text(s, `${v}`, { x: x - 0.3, y: base - h - 0.85, w: 2.05, h: 0.8, fontSize: 48, bold: true, align: "center",
      color: i ? C.accent1 : C.text1 });
    const ll = text(s, lab, { x: x - 0.3, y: base + 0.12, w: 2.05, h: 0.35, fontSize: 16, color: C.text2, align: "center" });
    anim.add(bar, "wipeB", t0, 900); anim.add(vv, "fade", t0 + 500, 600); anim.add(ll, "fade", t0, 600);
  });
  const unit = text(s, "million b/d", { x: 1.0, y: base + 0.5, w: 3.6, h: 0.35, fontSize: 15, color: C.text2, align: "center" });
  anim.add(unit, "fade", 300, 600);
  const rows = [["Al-Zour", "KIPIC · full capacity 2024", 615], ["Mina Abdullah", "KNPC · Clean Fuels Project", 454],
    ["Mina Al-Ahmadi", "KNPC · Clean Fuels Project", 346]];
  rows.forEach(([n, d, v], i) => {
    const y = 2.05 + i * 1.12, t0 = 1300 + i * 280, bw = 3.2 * v / 615;
    const a = text(s, n, { x: 5.6, y, w: 3.0, h: 0.42, fontSize: 21, bold: true });
    const b = text(s, d, { x: 5.6, y: y + 0.44, w: 3.4, h: 0.35, fontSize: 14, color: C.text2 });
    const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: 8.55, y: y + 0.13, w: bw, h: 0.42, rectRadius: 0.08,
      fill: { color: i === 0 ? HEX.oil : "8A5A12" } });
    const vv = text(s, `${v}`, { x: 8.55 + bw + 0.12, y: y + 0.06, w: 0.9, h: 0.55, fontSize: 22, bold: true, valign: "middle" });
    anim.add(a, "float", t0, 600); anim.add(b, "fade", t0 + 100, 600); anim.add(bar, "wipeL", t0 + 100, 800); anim.add(vv, "fade", t0 + 600, 500);
  });
  const tot = text(s, [{ text: "= 1,415 kb/d ", options: { bold: true, color: C.accent1 } }, { text: "of crude distillation in Kuwait", options: { color: C.text2 } }],
    { x: 5.6, y: 5.4, w: 7.1, h: 0.4, fontSize: 18 });
  const om = text(s, [{ text: "Plus Oman: ", options: { bold: true, color: C.text1 } },
    { text: "Kuwait (KPI) co-owns the 230 kb/d Duqm refinery with OQ.", options: { color: C.text2 } }],
    { x: 5.6, y: 5.85, w: 7.1, h: 0.4, fontSize: 16 });
  anim.add(tot, "fade", 2300, 700); anim.add(om, "fade", 2500, 700);
  source(s, "Sources: EIA, Today in Energy (2023); KNPC refinery pages; KIPIC (2024); S&P Global (2024). Capacities in thousand b/d.");
  homeButton(s);
  s.addNotes("According to the EIA, Kuwait's refining capacity rose from about 600,000 b/d in January 2021 to about 1.4 million b/d in July 2023. Two things drove this: the new Al-Zour refinery (615,000 b/d, three crude units, run by KIPIC) and KNPC's Clean Fuels Project, which upgraded and integrated Mina Al-Ahmadi (346,000 b/d) and Mina Abdullah (454,000 b/d). Al-Zour first ran at full capacity on 4 February 2024. As a result Kuwait now exports more refined products and less crude. Kuwait Petroleum International also co-owns the 230,000 b/d Duqm refinery in Oman with OQ.");
});

// =====================================================================
def("sec3", "Section", (s) => { section("03", "Where the Oil Lies", "Fields, regions and the rocks that hold them", 2)(s);
  s.addNotes("Chapter three: the location of Kuwait's oil and gas fields, grouped into four producing areas, and the reservoir rocks they produce from."); });

// =====================================================================
const MAPBOX = { full: { x: 1.0, y: 1.75, h: 4.75 }, small: { x: 0.3, y: 1.95, h: 4.3 } };
function mapPlace(mode) {
  const b = MAPBOX[mode], w = b.h * MAPF.px[0] / MAPF.px[1];
  return Object.assign({ w }, b);
}
function lonlat(mode, lon, lat) {
  const b = mapPlace(mode), K = Math.cos(29.2 * Math.PI / 180);
  const fx = (lon - MAPF.lon0) * K / MAPF.wu, fy = (MAPF.lat1 - lat) / MAPF.hu;
  return [b.x + fx * b.w, b.y + fy * b.h];
}
function drawMap(s, mode, opts = {}) {
  const b = mapPlace(mode);
  img(s, A("map_dark.png"), { x: b.x, y: b.y, w: b.w, h: b.h, name: "!!map" });
  const out = {};
  for (const f of FIELDS.fields) {
    const [x, y] = lonlat(mode, f.lon, f.lat);
    const col = f.kind === "gas" ? HEX.gas : f.kind === "infra" ? HEX.text : HEX.oil;
    const d = f.major ? 0.3 : f.kind === "infra" ? 0.16 : 0.2;
    const o = f.kind === "infra"
      ? shape(s, pres.shapes.RECTANGLE, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col }, name: `!!f_${f.id}`, rotate: 45 })
      : shape(s, pres.shapes.OVAL, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col }, name: `!!f_${f.id}`,
        shadow: glow(col, f.major ? 18 : 10, 0.9) });
    out[f.id] = { o, x, y, f };
  }
  return { b, out };
}

def("map", "Content", (s) => {
  header(s, "03 — RESERVOIR LOCATIONS", "Kuwait's oil and gas map");
  const { out } = drawMap(s, "full");
  anim.add("!!map", "fade", 200, 1200);
  let k = 0;
  for (const id of Object.keys(out)) anim.add(out[id].o, "zoom", 900 + (k++) * 70, 500);
  for (const f of FIELDS.fields) {
    if (!f.label) continue;
    const { x, y } = out[f.id];
    const [dx, dy, al] = f.label;
    const t = text(s, f.name, { x: x + dx, y: y + dy, w: 1.9, h: 0.3, fontSize: 13, color: f.kind === "infra" ? C.text2 : C.text1,
      bold: f.kind !== "infra", align: al || "left" });
    anim.add(t, "fade", 1700, 600);
  }
  // country / sea labels
  const lab = (str, lon, lat, o = {}) => {
    const [x, y] = lonlat("full", lon, lat);
    return text(s, str, Object.assign({ x: x - 1.2, y: y - 0.15, w: 2.4, h: 0.3, fontSize: 13, color: HEX.text3, align: "center", charSpacing: 4 }, o));
  };
  [lab("IRAQ", 46.75, 30.17), lab("SAUDI ARABIA", 46.95, 28.3), lab("ARABIAN GULF", 48.85, 29.2)].forEach((t) => anim.add(t, "fade", 600, 800));
  // region legend + click-to-reveal region cards on the right
  const rx = 8.45, rw = W - MX - rx;
  const legend = text(s, [{ text: "●  ", options: { color: C.accent1 } }, { text: "Oil   ", options: { color: C.text2 } },
    { text: "●  ", options: { color: C.accent2 } }, { text: "Gas   ", options: { color: C.text2 } },
    { text: "◆  ", options: { color: C.text1 } }, { text: "Refinery / port", options: { color: C.text2 } }],
    { x: rx, y: 1.95, w: rw, h: 0.35, fontSize: 15 });
  anim.add(legend, "fade", 1900, 600);
  const hint = text(s, "Click a region to see its fields", { x: rx, y: 2.38, w: rw, h: 0.32, fontSize: 14, color: C.text2, italic: true });
  anim.add(hint, "fade", 2100, 600);
  FIELDS.regions.forEach((r, i) => {
    const y = 2.82 + i * 0.64;
    const pill = text(s, r.name, { x: rx, y, w: rw, h: 0.52, fontSize: 17, bold: true, fill: { color: HEX.card },
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.26, margin: [34, 0, 0, 0], valign: "middle", name: `${SID}_reg${i}` });
    const dot = shape(s, pres.shapes.OVAL, { x: rx + 0.2, y: y + 0.165, w: 0.19, h: 0.19, fill: { color: r.color === "gas" ? HEX.gas : HEX.oil } });
    anim.add(pill, "float", 2000 + i * 150, 600); anim.add(dot, "zoom", 2000 + i * 150, 600);
    const pop = text(s, [{ text: r.name, options: { bold: true, color: C.text1, fontSize: 16, breakLine: true } },
      { text: r.fields, options: { color: C.text2, fontSize: 14 } }],
      { x: rx, y: 5.42, w: rw, h: 0.98, name: `${SID}_pop${i}`, fill: { color: HEX.card2 }, valign: "middle",
        shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.12, margin: [12, 10, 4, 4] });
  });
  FIELDS.regions.forEach((r, i) => anim.trigger(`${SID}_reg${i}`, [{ name: `${SID}_pop${i}`, effect: "zoom", dur: 400 },
    ...FIELDS.regions.map((_, j) => j).filter((j) => j !== i).map((j) => ({ name: `${SID}_pop${j}`, effect: "fadeOut", dur: 250 }))]));
  source(s, "Sources: KOC (n.d.); Naqi et al. (2023) Petroleum geology of Kuwait; EIA (2023); KGOC; field positions approximate. Base map: Natural Earth.");
  homeButton(s);
  s.addNotes(FIELDS.notes_map);
});

def("regions", "Content", (s) => {
  header(s, "03 — RESERVOIR LOCATIONS", "Four producing areas");
  drawMap(s, "small");
  const rx = 6.05, cw = W - MX - rx, ch = 1.02, gap = 0.12;
  FIELDS.regions.forEach((r, i) => {
    const x = rx, y = 1.95 + i * (ch + gap), t0 = 500 + i * 220;
    const col = r.color === "gas" ? HEX.gas : HEX.oil;
    const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: 0.14, fill: { color: HEX.card } });
    const dot = shape(s, pres.shapes.OVAL, { x: x + 0.25, y: y + 0.17, w: 0.2, h: 0.2, fill: { color: col } });
    const h = text(s, r.name, { x: x + 0.58, y: y + 0.1, w: cw - 0.8, h: 0.34, fontSize: 18, bold: true });
    const b = text(s, r.fields, { x: x + 0.58, y: y + 0.43, w: cw - 0.8, h: 0.27, fontSize: 15, color: C.text1 });
    const d = text(s, r.detail, { x: x + 0.58, y: y + 0.7, w: cw - 0.8, h: 0.25, fontSize: 14, color: C.text2 });
    [card, dot].forEach((o) => anim.add(o, "zoom", t0, 600)); anim.add(h, "float", t0 + 100, 600); anim.add(b, "fade", t0 + 200, 600); anim.add(d, "fade", t0 + 300, 600);
  });
  source(s, "Sources: KOC (n.d.); Naqi et al. (2023); EIA (2023); S&P Global (2018); KPC (2024).");
  homeButton(s);
  s.addNotes(FIELDS.notes_regions);
});

// =====================================================================
def("strata", "Content", (s) => {
  header(s, "03 — RESERVOIR LOCATIONS", "Reservoirs stacked from shallow to deep");
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
  const colX = 1.15, colW = 1.55;
  let y = 1.95;
  const fill = { sand: "C98A2E", carb: "4E6E86", jur: "2F5D7C" };
  const ar = img(s, A("depth_arrow.png"), { x: 0.6, y: 1.95, w: 0.3, h: 4.4 });
  anim.add(ar, "wipeT", 200, 1200);
  const span = {};
  layers.forEach(([n, d, h, lit, grp], i) => {
    const t0 = 300 + i * 140;
    span[grp] = span[grp] ? [span[grp][0], y + h] : [y, y + h];
    const band = shape(s, pres.shapes.RECTANGLE, { x: colX, y, w: colW, h: h - 0.03, fill: { color: fill[lit] } });
    const lab = text(s, [{ text: n + "  ", options: { bold: true, color: C.text1 } }, { text: d, options: { color: C.text2 } }],
      { x: colX + colW + 0.25, y: y + (h - 0.03) / 2 - 0.17, w: 5.0, h: 0.34, fontSize: 15, valign: "middle" });
    anim.add(band, "wipeL", t0, 500); anim.add(lab, "fade", t0 + 150, 500);
    y += h;
  });
  const groups = [
    ["Heavy oil", "Shallow Lower Fars sands of North Kuwait (Ratqa area)", "heavy", HEX.oil],
    ["Kuwait Export Crude", "Cretaceous sandstones and carbonates: Greater Burgan, Raudhatain, Sabriya, Minagish, Umm Gudair", "kec", HEX.oil],
    ["Super-light oil & sour gas", "Deep Jurassic carbonates of North Kuwait, high pressure and temperature", "jur", HEX.gas],
  ];
  groups.forEach(([h, d, key, col], i) => {
    const gy = span[key][0], gh = span[key][1] - span[key][0] - 0.03;
    const t0 = 1900 + i * 300, x = 8.35, w = W - MX - x;
    const br = shape(s, pres.shapes.RECTANGLE, { x: 8.05, y: gy + 0.04, w: 0.05, h: gh - 0.08, fill: { color: col } });
    const cardH = Math.min(Math.max(gh, 0.95), 1.6);
    const cy = gy + gh / 2 - cardH / 2;
    const t = text(s, [{ text: h, options: { bold: true, color: C.text1, fontSize: 18, breakLine: true } }, { text: d, options: { color: C.text2, fontSize: 14 } }],
      { x, y: Math.max(1.9, Math.min(cy, 6.35 - cardH)), w, h: cardH, valign: "middle" });
    anim.add(br, "wipeT", t0, 500); anim.add(t, "float", t0 + 100, 600);
  });
  source(s, "Sources: Naqi, Alsalem & Qabazard (2023) in The Geology of Kuwait (Springer); KOC; S&P Global (2018). Simplified, not to scale.");
  homeButton(s);
  s.addNotes("Kuwait's oil comes from a stack of reservoirs. Near the surface, the Miocene Lower Fars sands of North Kuwait hold heavy oil. Most production and the Kuwait Export Crude blend come from Cretaceous rocks: the Burgan Formation sandstones are the most important reservoir in the country, together with Wara, Mauddud, Mishrif, Zubair, Ratawi and the Minagish oolite, which is the main reservoir of the Minagish and Umm Gudair fields in the west. Deepest are the Jurassic Marrat, Najmah and Sargelu carbonates, which produce Kuwait Super Light crude and sour, high-pressure non-associated gas in the north. This diagram is simplified and not to scale.");
});

// =====================================================================
def("sec4", "Section", (s) => { section("04", "Exports & Costs", "Who buys Kuwait's oil, and what it costs", 3)(s);
  s.addNotes("Chapter four: where Kuwait's oil and gas exports go, what they earn, what they cost to produce, and how much the gas it imports costs."); });

// exports slides come from markets.json (see build_markets.js)
require("./build_markets")({ def, get: () => ({ pres, C, anim, SID, nm, text, shape, img, ic, glow, header, source, homeButton,
  chartText, chartFrame, fmt, MKT, IDX }) , setSID: () => {} });

// =====================================================================
def("takeaways", "Content", (s) => {
  header(s, "CONCLUSION", "What the numbers say");
  const items = MKT.takeaways;
  const gap = 0.3, w = (W - 2 * MX - gap) / 2, h = 1.85;
  items.forEach(([ico, col, hd, d], i) => {
    const x = MX + (i % 2) * (w + gap), y = 1.95 + Math.floor(i / 2) * (h + gap), t0 = 300 + i * 250;
    const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.16, fill: { color: HEX.card } });
    const circ = shape(s, pres.shapes.OVAL, { x: x + 0.35, y: y + 0.42, w: 0.95, h: 0.95, fill: { color: HEX.card2 } });
    const ii = img(s, ic(ico, col), { x: x + 0.59, y: y + 0.66, w: 0.47, h: 0.47 });
    const hh = text(s, hd, { x: x + 1.6, y: y + 0.32, w: w - 1.9, h: 0.5, fontSize: 23, bold: true });
    const dd = text(s, d, { x: x + 1.6, y: y + 0.85, w: w - 1.9, h: 0.85, fontSize: 16, color: C.text2 });
    [card, circ, ii].forEach((o) => anim.add(o, "zoom", t0, 600)); anim.add(hh, "float", t0 + 100, 600); anim.add(dd, "fade", t0 + 200, 600);
  });
  const fwd = text(s, [{ text: "Next: ", options: { bold: true, color: C.accent1 } },
    { text: MKT.next, options: { color: C.text2 } }], { x: MX, y: 6.12, w: 11.0, h: 0.36, fontSize: 16 });
  anim.add(fwd, "fade", 1500, 700);
  homeButton(s);
  s.addNotes(MKT.notes_takeaways);
});

// =====================================================================
def("refs", "Content", (s) => {
  header(s, "05 — REFERENCES", "Key sources");
  const refs = MKT.refs_slide;
  const half = Math.ceil(refs.length / 2), w = (W - 2 * MX - 0.4) / 2;
  [refs.slice(0, half), refs.slice(half)].forEach((col, j) => {
    const t = text(s, col.map((r, k) => ({ text: r, options: { breakLine: k < col.length - 1 } })),
      { x: MX + j * (w + 0.4), y: 1.95, w, h: 4.45, fontSize: 12.5, color: C.text2, paraSpaceAfter: 7 });
    anim.add(t, "fade", 200 + j * 250, 800);
  });
  source(s, "The full APA 7th-edition reference list is in the written report.");
  homeButton(s);
  s.addNotes("These are the main sources. The written report contains the complete APA reference list and in-text citations.");
});

// =====================================================================
def("thanks", "Title", (s) => {
  img(s, A("drop.png"), { x: 7.95, y: 1.2, w: 4.35, h: 5.49, name: "!!drop" });
  const a = text(s, "Thank you", { x: MX, y: 2.0, w: 7.2, h: 1.4, fontSize: 88, bold: true });
  const b = text(s, "Questions?", { x: MX, y: 3.45, w: 7.2, h: 0.8, fontSize: 40, color: C.text2 });
  const c = text(s, [
    { text: "Shahad Issa Obaid Alghriabi", options: { fontSize: 24, bold: true, color: C.text1, breakLine: true } },
    { text: "EGCH2230 · Petroleum and Petrochemical Processing", options: { fontSize: 16, color: C.text2, breakLine: true } },
    { text: "University of Technology and Applied Sciences", options: { fontSize: 16, color: C.text2 } },
  ], { x: MX, y: 4.85, w: 7.2, h: 1.3, paraSpaceAfter: 4 });
  const pill = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 6.4, w: 2.6, h: 0.5, rectRadius: 0.25, fill: { color: HEX.card2 } });
  const home = text(s, "Back to contents", { x: MX, y: 6.4, w: 2.6, h: 0.5, fontSize: 15, bold: true, align: "center", valign: "middle" });
  shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 6.4, w: 2.6, h: 0.5, rectRadius: 0.25, fill: { color: "000000", transparency: 100 },
    hyperlink: { slide: IDX.contents, tooltip: "Back to contents" } });
  anim.add(a, "float", 300, 900); anim.add(b, "fade", 700, 800); anim.add(c, "float", 1000, 800);
  anim.add(pill, "fade", 1400, 600); anim.add(home, "fade", 1400, 600);
  s.addNotes("Thank you. I am happy to take questions; the contents slide links to every chapter.");
});

// ---------- build ----------
async function main() {
  ({ pres, C } = await makePres());
  anim = new Anim();
  for (const [n, c] of ICONS) if (!ICON[`${n}:${c}`]) ICON[`${n}:${c}`] = await icon(n, "#" + c);
  ORDER.forEach((d, i) => { IDX[d.id] = i + 1; });
  const sections = { sec1: "01 History & Types", sec2: "02 Resources & Growth", sec3: "03 Reservoir Locations", sec4: "04 Exports & Costs", takeaways: "05 Conclusion & References" };
  let secTitle = "Introduction";
  pres.addSection({ title: secTitle });
  for (const d of ORDER) {
    if (sections[d.id]) { secTitle = sections[d.id]; pres.addSection({ title: secTitle }); }
    SID = d.id; NCOUNT = 0;
    anim.begin(IDX[d.id], d.transition, d.transition === "fade" ? 1000 : 1400);
    const s = pres.addSlide({ masterName: d.master, sectionTitle: secTitle });
    d.fn(s);
  }
  fs.mkdirSync(path.dirname(OUT_RAW), { recursive: true });
  await pres.writeFile({ fileName: OUT_RAW });
  await applyTheme(OUT_RAW, THEME);
  anim.write(path.join(__dirname, "out", "anim.json"));
  console.log("slides:", ORDER.length, ORDER.map((d) => d.id).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
