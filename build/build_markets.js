// Chapter 04 slides: export markets, prices and costs. Data from data/markets.json and data/routes.json.
const fs = require("fs");
const path = require("path");
const { HEX, W, H, MX, A, CARD_R } = require("./deck_base");

const ROUTES = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "routes.json")));
const ASIA = JSON.parse(fs.readFileSync(A("asia_frame.json")));

// Catmull-Rom through the waypoints -> cubic Bezier segments
function bez(pts) {
  const P = [pts[0], ...pts, pts[pts.length - 1]], segs = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    segs.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return segs;
}
const at = ([a, b, c, d], t) => [0, 1].map((k) => (1 - t) ** 3 * a[k] + 3 * (1 - t) ** 2 * t * b[k] + 3 * (1 - t) * t * t * c[k] + t ** 3 * d[k]);

module.exports = function (state, ctx) {
  const def = state.def, MKT = state.MKT, KK = "04 — EXPORTS & COSTS";

  // ---------------------------------------------------------------
  def("destinations", "Content", (s) => {
    const { K, C, pres, anim } = ctx();
    const { text, shape, img, m, ambient, header, source, homeButton, glow } = K;
    ambient(s, ["amber", 2.2, 4.0, 7.5], ["blue", 10.5, 4.2, 8]);
    header(s, KK, "Nine in ten barrels sail to Asia");
    const big = text(s, "93%", { x: MX, y: 1.95, w: 3.9, h: 1.55, fontSize: 110, bold: true, color: C.accent1 });
    const bl = text(s, "of crude exports by volume went to Asia-Pacific in 2024", { x: MX, y: 3.6, w: 3.9, h: 1.05, fontSize: 20, bold: true });
    const bd = text(s, "OPEC as a whole sent about 72% to Asia. China alone took 27% of the volume and a third of the value.",
      { x: MX, y: 4.75, w: 3.9, h: 1.0, fontSize: 16, color: C.text2 });
    m.scale(big, 250, 1300, 0.88); m.rise(bl, 600); m.rise(bd, 800);
    // flow map
    const mb = { x: 4.75, y: 2.2, w: 8.0 }; mb.h = mb.w * ASIA.px[1] / ASIA.px[0];
    img(s, A("asia_dark.png"), { x: mb.x, y: mb.y, w: mb.w, h: mb.h, name: "fm_map", altText: "Map of the Gulf and Asia with Kuwait crude export routes" });
    m.fade("fm_map", 300, 1200);
    const P = ([lon, lat]) => [mb.x + (lon - ASIA.lon0) * ASIA.k / ASIA.wu * mb.w, mb.y + (ASIA.lat1 - lat) / ASIA.hu * mb.h];
    const widthOf = (share) => Math.max(1.25, share / 94.8 * 8.5);
    const drawRoute = (pts, share, t0, dur, name) => {
      const sp = pts.map(P), segs = bez(sp);
      const xs = sp.map((p) => p[0]).concat(segs.flatMap((g) => [g[1][0], g[2][0]]));
      const ys = sp.map((p) => p[1]).concat(segs.flatMap((g) => [g[1][1], g[2][1]]));
      const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(0.02, Math.max(...xs) - x0), h = Math.max(0.02, Math.max(...ys) - y0);
      const R = (p) => ({ x: p[0] - x0, y: p[1] - y0 });
      const points = [R(segs[0][0]), ...segs.map((g) => Object.assign(R(g[3]), { curve: { type: "cubic", x1: g[1][0] - x0, y1: g[1][1] - y0, x2: g[2][0] - x0, y2: g[2][1] - y0 } }))];
      shape(s, pres.shapes.CUSTOM_GEOMETRY, { x: x0, y: y0, w, h, points, fill: { type: "none" }, line: { color: HEX.oil, width: widthOf(share) }, name });
      m.wipe(name, "L", t0, dur);
      anim.roundCaps(name);
      return segs;
    };
    const trunk = drawRoute(ROUTES.trunk, 94.8, 750, 700, "fm_trunk");
    const east = drawRoute(ROUTES.east, 84.2, 1100, 900, "fm_east");
    const br = {};
    ROUTES.branches.forEach((b, i) => {
      const t0 = b.from === "trunk" ? 1150 : 1850 + i * 60;
      br[b.name] = drawRoute(b.pts, b.share, t0, b.from === "trunk" ? 900 : 800, `fm_b${i}`);
    });
    // destination dots and labels after all routes, so no line paints over a marker
    ROUTES.branches.forEach((b, i) => {
      const [x, y] = P(b.pts[b.pts.length - 1]);
      const dot = shape(s, pres.shapes.OVAL, { x: x - 0.11, y: y - 0.11, w: 0.22, h: 0.22, fill: { color: HEX.text }, line: { color: HEX.oil, width: 2.5 },
        shadow: glow(HEX.oil, 12, 0.9), name: `fm_d${i}` });
      const lab = b.label[2];
      const [nm, pc] = [lab.slice(0, lab.lastIndexOf(" ")), lab.slice(lab.lastIndexOf(" ") + 1)];
      const side = { India: "right", Taiwan: "left", China: "left", "South Korea": "left", Japan: "above" }[b.name];
      const lw = 1.75, pos = {
        right: [x + 0.2, y - 0.17, "left"], left: [x - 0.24 - lw, y - 0.17, "right"],
        above: x - lw / 2 > W - MX - lw ? [W - MX - lw, y - 0.52, "right"] : [x - lw / 2, y - 0.52, "center"],
        below: [Math.min(x - lw / 2, W - MX - lw), y + 0.17, "center"] }[side];
      const t = text(s, [{ text: nm + " ", options: { bold: true, color: C.text1 } }, { text: pc, options: { bold: true, color: C.accent1 } }],
        { x: pos[0], y: pos[1], w: lw, h: 0.34, fontSize: 15, align: pos[2], name: `fm_l${i}` });
      const td = (b.from === "trunk" ? 1850 : 2350 + i * 60);
      m.land(dot, td, 600, 1.8); m.fade(t, td + 150, 500);
    });
    // Kuwait + Hormuz
    const [kx, ky] = P(ROUTES.origin), [hx, hy] = P(ROUTES.hormuz);
    const hz = shape(s, pres.shapes.OVAL, { x: hx - 0.07, y: hy - 0.07, w: 0.14, h: 0.14, fill: { color: HEX.red }, name: "fm_hz" });
    const hl = text(s, "Strait of Hormuz", { x: hx + 0.1, y: hy - 0.5, w: 1.8, h: 0.3, fontSize: 13, color: C.accent4, name: "fm_hzl" });
    m.land(hz, 1200, 600, 2.0); m.fade(hl, 1300, 700);
    // tankers keep travelling the main routes while the slide is shown
    const travel = (segs, n, t0, dur) => {
      const pts = segs.flatMap((g, k) => (k === 0 ? [0, 0.25, 0.5, 0.75, 1] : [0.25, 0.5, 0.75, 1]).map((t) => at(g, t)));
      const [sx, sy] = pts[0];
      const path = "M 0 0 " + pts.slice(1).map(([x, y]) => `L ${((x - sx) / W).toFixed(4)} ${((y - sy) / H).toFixed(4)}`).join(" ") + " E";
      const tk = shape(s, pres.shapes.OVAL, { x: sx - 0.07, y: sy - 0.07, w: 0.14, h: 0.14, fill: { color: "FFFFFF" }, shadow: glow(HEX.gold, 10, 1), name: `fm_tk${n}` });
      m.appear(tk, t0); anim.add(tk, "travel", t0, dur, { path });
    };
    // one shared 7 s rhythm, staggered, so the tankers never blink at unrelated tempos
    travel([...trunk, ...east, ...br["China"]], 0, 3300, 7000);
    travel([...trunk, ...br["India"]], 2, 4500, 7000);
    travel([...trunk, ...east, ...br["South Korea"]], 1, 6800, 7000);
    // Kuwait disc on top: parked tankers stay hidden under it in static views and during Morph
    const kd = shape(s, pres.shapes.OVAL, { x: kx - 0.15, y: ky - 0.15, w: 0.3, h: 0.3, fill: { color: HEX.oil }, shadow: glow(HEX.oil, 18, 0.95), name: "fm_kw" });
    const kl = text(s, "Kuwait", { x: kx - 1.45, y: ky - 0.42, w: 1.3, h: 0.32, fontSize: 15, bold: true, align: "right", name: "fm_kwl" });
    m.land(kd, 600, 700, 2.0); m.fade(kl, 700, 700); m.breathe(kd, 1500, 1700, 1.12);
    const lg = text(s, "Labels and line widths: share of 2024 crude export value (OEC)", { x: mb.x, y: 6.12, w: 6.5, h: 0.3, fontSize: 13, color: C.text2, name: "fm_lg" });
    m.fade(lg, 2300, 700);
    source(s, "Sources: Energy Institute (2025), by volume; OEC (n.d.), 2024 data by value; OPEC (2025b). Routes stylised; map: Natural Earth (n.d.).");
    homeButton(s, state.IDX.contents);
    s.addNotes("Kuwait's crude goes almost entirely east. In 2024, 93% of its crude exports by volume went to the Asia-Pacific region (Energy Institute): China 27%, Japan 14%, India 10% and the rest of Asia-Pacific, mainly South Korea and Taiwan, 43%. By value (OEC), China took 33%, South Korea 23%, Japan 17%, Taiwan 11% and India 11%, so the top five buyers, all Asian, account for about 95%. For comparison, OPEC as a whole sent about 72% of its crude to Asia (OPEC, 2025b). Notice that every route starts in the Gulf and passes through the Strait of Hormuz.");
  });

  // ---------------------------------------------------------------
  def("crudeproducts", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, m, ambient, header, source, homeButton, glow } = K;
    ambient(s, ["amber", 4.5, 3.6, 9], ["gold", 11.5, 4.0, 6]);
    header(s, KK, "Exporting fuels, not just crude");
    const E = MKT.exports_kbd;
    const box = { x: 0.5, y: 2.3, w: 8.4, h: 4.1 }, L = { x: 0.1, y: 0.04, w: 0.86, h: 0.82 };
    const ch = `${K.sid()}_lines`;
    s.addChart(pres.charts.LINE, [
      { name: "Crude oil", labels: E.years.map(String), values: E.crude },
      { name: "Refined products (incl. LPG)", labels: E.years.map(String), values: E.products },
    ], Object.assign(state.chartText(), state.chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, objectName: ch, layout: L,
      chartColors: [HEX.oil, HEX.text], lineSize: 4, lineDataSymbol: "circle", lineDataSymbolSize: 10, showLegend: false,
      valAxisMinVal: 0, valAxisMaxVal: 2500, valAxisMajorUnit: 500, valAxisLabelFormatCode: "#,##0",
      valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
    m.wipe(ch, "L", 250, 1900);
    const n = E.years.length, px = (i) => box.x + box.w * (L.x + L.w * (i + 0.5) / n), py = (v) => box.y + box.h * (L.y + L.h * (1 - v / 2500));
    const l1 = text(s, "Crude oil", { x: px(0) - 0.4, y: py(E.crude[0]) - 0.55, w: 2, h: 0.35, fontSize: 17, bold: true, color: C.accent1 });
    const l2 = text(s, "Refined products (incl. LPG)", { x: px(0) - 0.4, y: py(E.products[0]) + 0.2, w: 3.8, h: 0.35, fontSize: 17, bold: true });
    const un = text(s, "Exports, kb/d (thousand barrels per day)", { x: MX, y: 1.7, w: 4.5, h: 0.3, fontSize: 14, color: C.text2 });
    m.fade(un, 300, 700); m.fade(l1, 500, 700); m.fade(l2, 600, 700);
    const i24 = E.years.indexOf(2024);
    const ring = shape(s, pres.shapes.OVAL, { x: px(i24) - 0.32, y: py(1186) - 0.32, w: 0.64, h: 0.64, fill: { color: HEX.bg, transparency: 100 },
      line: { color: HEX.gold, width: 2.5 }, shadow: glow(HEX.gold, 14, 0.7) });
    m.land(ring, 250 + K.wipeTime((px(i24) - box.x) / box.w, 1900), 700, 1.8); m.breathe(ring, 3200, 1500, 1.15);
    const a = text(s, "2024", { x: 9.35, y: 2.0, w: 3.4, h: 1.2, fontSize: 80, bold: true, color: C.accent3 });
    const b = text(s, "the first year product exports (1,196\u00a0kb/d) beat crude exports (1,176\u00a0kb/d)",
      { x: 9.35, y: 3.25, w: 3.4, h: 1.3, fontSize: 18, bold: true });
    const c = text(s, "Al-Zour ran at full capacity, so crude went to Kuwaiti refineries instead of tankers. Crude led again in 2025.",
      { x: 9.35, y: 4.35, w: 3.4, h: 1.4, fontSize: 15, color: C.text2 });
    m.scale(a, 1750, 1000, 0.88); m.rise(b, 2000); m.rise(c, 2200);
    source(s, "Sources: JODI (2026), annual averages of monthly data; MEES (2026); EIA (2023b).");
    homeButton(s, state.IDX.contents);
    s.addNotes("The new refining capacity changed what Kuwait sells. According to JODI data, crude exports fell from about 2.0 million b/d in 2017-2019 to 1.18 million b/d in 2024, while exports of refined products, mainly diesel, jet fuel, naphtha and very-low-sulfur fuel oil from Al-Zour, rose to a record 1.20 million b/d. 2024 was the first year in which Kuwait exported more products than crude (MEES). In 2025 the mix swung back towards crude, partly because of an outage at Al-Zour in October 2025.");
  });

  // ---------------------------------------------------------------
  def("prices", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, m, ambient, header, source, homeButton } = K;
    ambient(s, ["amber", 5.0, 3.2, 9], ["red", 12.5, 6.9, 5]);
    header(s, KK, "The price of a barrel, 2000–2025");
    const B = MKT.brent_annual;
    const box = { x: 0.5, y: 1.95, w: 8.6, h: 4.45 }, L = { x: 0.09, y: 0.06, w: 0.88, h: 0.8 }, ymax = 150, WD = 2600;
    const ch = `${K.sid()}_brent`;
    s.addChart(pres.charts.LINE, [{ name: "Brent, annual average (US$/bbl)", labels: B.years.map(String), values: B.values }],
      Object.assign(state.chartText(), state.chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, objectName: ch, layout: L,
        chartColors: [HEX.oil], lineSize: 4, lineDataSymbol: "none", showLegend: false, catAxisHidden: true,
        valAxisMinVal: 0, valAxisMaxVal: ymax, valAxisMajorUnit: 50, valAxisLabelFormatCode: '"$"0',
        valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
    m.wipe(ch, "L", 250, WD);
    m.fade(text(s, "Brent crude, annual average (US$ per barrel)", { x: MX, y: 1.7, w: 6, h: 0.3, fontSize: 14, color: C.text2 }), 300, 700);
    const n = B.years.length;
    const px = (yr) => box.x + box.w * (L.x + L.w * (B.years.indexOf(yr) + 0.5) / n);
    const py = (v) => box.y + box.h * (L.y + L.h * (1 - v / ymax));
    // year labels drawn as text (the chart's own skip-every-5 labels are not honoured by every renderer)
    const yl = [2000, 2005, 2010, 2015, 2020, 2025].map((yr) => text(s, String(yr), { x: px(yr) - 0.4, y: box.y + box.h * (L.y + L.h) + 0.14,
      w: 0.8, h: 0.3, fontSize: 16, color: C.text2, align: "center" }));
    yl.forEach((t, i) => m.fade(t, 250 + K.wipeTime(i / 5, WD) * 0.9, 600));
    // placement: a = above/below the point, side = which way the label extends from it; labels in a row share a baseline
    const ev = [[2008, "above"], [2016, "below"], [2020, "below"], [2022, "above"]].map(([yr, p]) => [p, B.values[B.years.indexOf(yr)]]);
    const rowY = { above: py(Math.max(...ev.filter((e) => e[0] === "above").map((e) => e[1]))) - 0.82,
      below: py(Math.min(...ev.filter((e) => e[0] === "below").map((e) => e[1]))) + 0.2 };
    [[2008, "2008", "$97 average, $144 peak", "above", "left"], [2016, "2016", "$44 average, $26 low", "below", "left"],
      [2020, "2020", "COVID-19: $42", "below", "right"], [2022, "2022", "war in Ukraine: $101", "above", "centre"]]
      .forEach(([yr, a, b, vpos, side]) => {
        const v = B.values[B.years.indexOf(yr)], cx = px(yr), cy = py(v), t0 = 250 + K.wipeTime((cx - box.x) / box.w, WD);
        const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.09, y: cy - 0.09, w: 0.18, h: 0.18, fill: { color: HEX.text }, line: { color: HEX.oil, width: 2.5 } });
        const lw = 2.5, lx = side === "left" ? cx + 0.2 - lw : side === "right" ? cx - 0.2 : cx - lw / 2;
        const lab = text(s, [{ text: a, options: { bold: true, color: C.text1, breakLine: true } }, { text: b, options: { color: C.text2 } }],
          { x: lx, y: rowY[vpos], w: lw, h: 0.62, fontSize: 15,
            align: side === "left" ? "right" : side === "right" ? "left" : "center" });
        m.land(dot, t0, 600, 1.8);
        if (vpos === "above") m.drop(lab, t0 + 100, 700, 0.012); else m.rise(lab, t0 + 100, 700, 0.012);
      });
    const k = MKT.kec;
    const card = text(s, [
      { text: "Kuwait Export Crude", options: { bold: true, fontSize: 19, color: C.text1, breakLine: true } },
      { text: `$${k["2023"]}  (2023)`, options: { bold: true, fontSize: 24, color: C.accent1, breakLine: true } },
      { text: `$${k["2024"]}  (2024)`, options: { bold: true, fontSize: 24, color: C.accent1, breakLine: true } },
      { text: "Medium-sour; KPC sets a monthly official selling price for each grade.", options: { fontSize: 15, color: C.text2 } },
    ], { x: 9.45, y: 1.95, w: 3.28, h: 2.5, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 }, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: CARD_R,
      margin: [14, 12, 10, 10], paraSpaceAfter: 6 });
    const y26 = text(s, [{ text: "2026 so far: ", options: { bold: true, color: C.accent4 } },
      { text: `Brent averaged $${B.ytd_2026} up to 29 September, peaking at $138 on 7 April.`, options: { color: C.text2 } }],
      { x: 9.45, y: 4.65, w: 3.28, h: 1.2, fontSize: 15 });
    m.scale(card, 2000, 900, 0.95); m.rise(y26, 2250, 700);
    source(s, "Sources: EIA (2026), annual averages of daily Brent prices; OPEC (2025a), Kuwait Export Crude.");
    homeButton(s, state.IDX.contents);
    s.addNotes("Kuwait sells its crude at prices linked to Middle East benchmarks, so its income follows the world oil price. Brent averaged $97 in 2008, with a daily peak of $144, stayed above $100 in 2011-2013, fell to a $44 average in 2016 (low: $26 in January) and $42 in 2020 during COVID-19, then jumped to $101 in 2022 after Russia invaded Ukraine (EIA). Kuwait Export Crude averaged $84.26 in 2023 and $80.65 in 2024 (OPEC), close to the OPEC Reference Basket ($82.95 and $79.89) because it is a medium-sour grade. In 2026, the Hormuz disruption pushed Brent to $138 on 7 April.");
  });

  // ---------------------------------------------------------------
  def("cost", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, m, ambient, header, source, homeButton, glow } = K;
    ambient(s, ["gold", 2.0, 3.0, 7], ["amber", 9.0, 6.6, 8]);
    header(s, KK, "One of the cheapest barrels on Earth");
    const rows = [
      ["Kuwait: cost per barrel", 8.5, "≈ $8.50", HEX.oil, "Rystad Energy via WSJ, 2016 estimate"],
      ["UK North Sea: cost per barrel", 44.3, "≈ $44", HEX.gray, "same study, for comparison"],
      ["Kuwait crude: selling price", 80.65, `$${MKT.kec["2024"]}`, HEX.gold, "Kuwait Export Crude, OPEC, 2024"],
    ];
    const x0 = 4.75, scale = 6.6 / 85;
    rows.forEach(([lab, v, vs, col, note], i) => {
      const y = 2.15 + i * 1.3, t0 = 300 + i * 380;
      const a = text(s, lab, { x: MX, y: y - 0.02, w: 4.0, h: 0.42, fontSize: 18, bold: true });
      const b = text(s, note, { x: MX, y: y + 0.42, w: 4.0, h: 0.32, fontSize: 14, color: C.text2 });
      const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: x0, y: y + 0.05, w: v * scale, h: 0.58, rectRadius: 0.1, fill: { color: col },
        shadow: i === 0 ? glow(HEX.oil, 16, 0.6) : undefined });
      const vv = text(s, vs, { x: x0 + v * scale + 0.15, y: y + 0.02, w: 1.6, h: 0.64, fontSize: 28, bold: true, valign: "middle", color: i === 0 ? C.accent1 : C.text1 });
      m.rise(a, t0); m.fade(b, t0 + 100); m.wipe(bar, "L", t0 + 100, 900); m.rise(vv, t0 + 800, 600, 0.012);
    });
    const mg = text(s, [{ text: "≈ $72 ", options: { bold: true, color: C.accent1, fontSize: 30 } },
      { text: "per barrel above cost: 2024 price minus the 2016 cost estimate, before taxes", options: { color: C.text2, fontSize: 17 } }],
      { x: MX, y: 5.6, w: 12.0, h: 0.6, valign: "middle" });
    m.rise(mg, 2300, 800);
    source(s, "Sources: Wall Street Journal (2016), Rystad Energy data; OPEC (2025a).");
    homeButton(s, state.IDX.contents);
    s.addNotes("Kuwait's oil is among the cheapest in the world to produce. Rystad Energy data published by the Wall Street Journal in 2016 put Kuwait's total cost, capital plus operating spending, at about $8.50 per barrel, the lowest of the countries compared; the UK North Sea was about $44. In 2024 Kuwait Export Crude sold for $80.65 on average (OPEC), leaving a gross margin of roughly $72 per barrel. The real constraint is fiscal: because oil pays for most of the state budget, Kuwait needs high prices to balance its budget even though production itself is cheap. Note that the cost figure is a 2016 estimate.");
  });

  // ---------------------------------------------------------------
  def("lng", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, m, ambient, header, source, homeButton } = K;
    ambient(s, ["blue", 2.8, 4.1, 8.5], ["blue", 11.0, 3.0, 7]);
    header(s, KK, "Where Kuwait's LNG comes from");
    const G = MKT.lng_2024;
    const ch = `${K.sid()}_lng`;
    const cols = [HEX.gas, "3A8FB7", "2B6A88", "5A7C99", HEX.gold, "8E8E93", "5A5A5F"];
    s.addChart(pres.charts.DOUGHNUT, [{ name: "LNG imports by supplier, 2024 (%)", labels: G.labels, values: G.values }],
      Object.assign({ x: 0.6, y: 1.95, w: 4.3, h: 4.3, holeSize: 70, chartColors: cols, showLegend: false, showValue: false,
        dataBorder: { pt: 1.5, color: HEX.bg }, objectName: ch, firstSliceAng: 0, layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, state.chartFrame()));
    m.wheel(ch, 250, 1700);
    const c1 = text(s, `${G.bcm}`, { x: 1.55, y: 3.3, w: 2.4, h: 0.9, fontSize: 52, bold: true, align: "center" });
    const c2 = text(s, "bcm imported, 2024", { x: 1.6, y: 4.2, w: 2.3, h: 0.35, fontSize: 14, color: C.text2, align: "center" });
    m.scale(c1, 1400, 900, 0.85); m.fade(c2, 1550, 700);
    G.labels.forEach((l, i) => {
      const y = 2.0 + i * 0.47, t0 = 700 + i * 90;
      const d = shape(s, pres.shapes.OVAL, { x: 5.25, y: y + 0.1, w: 0.2, h: 0.2, fill: { color: cols[i] } });
      const t = text(s, [{ text: l + "  ", options: { bold: true, color: l === "Oman" ? C.accent3 : C.text1 } },
        { text: `${G.values[i].toFixed(1)}%`, options: { color: C.text2 } }], { x: 5.6, y, w: 2.6, h: 0.4, fontSize: 16, valign: "middle" });
      m.scale(d, t0, 600, 0.6); m.rise(t, t0, 700, 0.012);
    });
    const stats = [
      [`≈ ${G.mt} Mt`, `of LNG (= ${G.bcm} bcm of gas), about 40% of all the gas Kuwait used in 2024`],
      [`$${G.jkm_2022} → $${G.jkm_2024}`, "Asian spot LNG price (JKM) per MMBtu, 2022 → 2024"],
      ["≈ $4 bn", "estimated 2024 import bill at spot prices"],
    ];
    stats.forEach(([v, l], i) => {
      const y = 2.0 + i * 1.45, t0 = 1500 + i * 220;
      const a = text(s, v, { x: 8.6, y, w: 4.1, h: 0.7, fontSize: 36, bold: true, color: C.accent2 });
      const b = text(s, l, { x: 8.6, y: y + 0.7, w: 4.1, h: 0.62, fontSize: 15, color: C.text2 });
      m.rise(a, t0, 900); m.fade(b, t0 + 150, 700);
    });
    source(s, "Source: Energy Institute (2025), LNG trade and JKM prices; shares rounded. Bill = 7.15 Mt × 46.4 million MMBtu/Mt × $11.91 (estimate).");
    homeButton(s, state.IDX.contents);
    s.addNotes("Because associated gas cannot keep up with demand for power and water desalination, Kuwait imported 9.7 billion cubic metres of LNG in 2024, about 7.2 million tonnes or 40% of its gas use (Energy Institute). Qatar supplied 61.4%, Nigeria 16.6% and the United States 9.5%; Oman supplied 3.0%. Gas is bought at international prices: the Asian spot benchmark JKM averaged $33.98 per MMBtu in 2022 and $11.91 in 2024. At 2024 spot prices the import bill would be roughly $4 billion; Kuwait's actual contract prices are not published, so this is only an estimate.");
  });

  // ---------------------------------------------------------------
  def("hormuz", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, m, ambient, header, source, homeButton, glow } = K;
    ambient(s, ["red", 4.5, 8.4, 11], ["amber", 12.0, 7.6, 6], { flicker: true });
    header(s, "2026 — A LIVE STRESS TEST", "When the Strait of Hormuz closed");
    const Y = MKT.y2026;
    const base = 5.05, maxV = 1400, maxH = 2.45, bw = 0.66, gx = 0.42, x0 = 0.9;
    const un = text(s, "Kuwait crude exports, 2026 (kb/d = thousand barrels per day)", { x: MX, y: 1.7, w: 6, h: 0.32, fontSize: 14, color: C.text2 });
    m.fade(un, 250, 700);
    Y.months.forEach((mo, i) => {
      const v = Y.crude_exports[i], h = Math.max(0.04, maxH * v / maxV), x = x0 + i * (bw + gx), t0 = 350 + i * 140;
      const red = i >= 2 && i <= 4;
      const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y: base - h, w: bw, h, rectRadius: Math.min(0.08, h / 2), fill: { color: red ? HEX.red : HEX.oil },
        shadow: red ? glow(HEX.red, 14, 0.6) : undefined });
      const val = text(s, v.toLocaleString("en-US"), { x: x - 0.25, y: base - h - 0.42, w: bw + 0.5, h: 0.36, fontSize: 16, bold: true, align: "center" });
      const lab = text(s, mo, { x: x - 0.25, y: base + 0.1, w: bw + 0.5, h: 0.38, fontSize: 18, align: "center" });
      const p = Y.brent[i];
      const chip = text(s, `$${Math.round(p)}`, { x: x - 0.25, y: base + 0.5, w: bw + 0.5, h: 0.32, fontSize: 15, bold: true,
        color: p > 100 ? C.accent4 : C.text2, align: "center" });
      m.wipe(bar, "B", t0, 900); m.rise(val, t0 + 600, 600, 0.01); m.fade(lab, t0, 600); m.fade(chip, 1500 + i * 70, 600);
    });
    const bl = text(s, "Row above: Brent, monthly average (US$ per barrel)", { x: MX, y: base + 0.9, w: 5, h: 0.28, fontSize: 13, color: C.text2 });
    m.fade(bl, 1400, 600);
    // bracket over the disruption months
    const bx = x0 + 2 * (bw + gx) - 0.1, bwid = 3 * bw + 2 * gx + 0.2;
    const brk = shape(s, pres.shapes.RECTANGLE, { x: bx, y: 2.68, w: bwid, h: 0.03, fill: { color: HEX.red } });
    const brl = text(s, "Hormuz disruption", { x: bx, y: 2.32, w: bwid, h: 0.32, fontSize: 14, bold: true, color: C.accent4, align: "center" });
    m.wipe(brk, "L", 1200, 700); m.fade(brl, 1300, 700);
    const facts = [
      ["7 March", "KPC declares force majeure as tankers stop transiting Hormuz"],
      ["−98%", "crude exports from 1,213\u00a0kb/d (Feb) to 24\u00a0kb/d (May)"],
      ["$138", "Brent peak on 7 April 2026"],
      ["0", "export routes that bypass the Gulf: every terminal is inside it"],
    ];
    const fy = [1.98, 3.06, 4.14, 5.0]; // the third fact has a one-line body
    facts.forEach(([v, l], i) => {
      const y = fy[i], t0 = 1700 + i * 220;
      const a = text(s, v, { x: 8.85, y, w: 3.9, h: 0.56, fontSize: 32, bold: true, color: i === 3 ? C.accent1 : C.accent4 });
      const b = text(s, l, { x: 8.85, y: y + 0.54, w: 3.9, h: 0.5, fontSize: 14, color: C.text2 });
      m.rise(a, t0, 800); m.fade(b, t0 + 150, 700);
    });
    source(s, "Sources: JODI (2026), monthly data; EIA (2026), Brent spot prices; CNBC (2026), Reuters report. 2026 data are preliminary.");
    homeButton(s, state.IDX.contents);
    s.addNotes("2026 tested Kuwait's export model. During the U.S.–Iran conflict, tanker traffic through the Strait of Hormuz stopped and on 7 March 2026 KPC declared force majeure and cut output (Reuters). Official JODI data show crude exports collapsing from 1.21 million b/d in February to only 41,000 b/d in April and 24,000 b/d in May, before recovering to about 1.1 million b/d by July. Brent rose from $71 in February to a monthly average of $117 in April, peaking at $138 on 7 April (EIA). Kuwait has no pipeline that bypasses the Gulf, so every export cargo must pass through Hormuz. These 2026 figures are preliminary.");
  });
};
