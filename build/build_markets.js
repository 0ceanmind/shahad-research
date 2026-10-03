// Chapter 04 slides: export markets, prices and costs. Data from data/markets.json (sources noted per slide).
module.exports = function ({ def, get }) {
  const K = "04 — EXPORTS & COSTS";

  // ---------------------------------------------------------------
  def("destinations", "Content", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, chartText, chartFrame, MKT, SID } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, K, "Nine in ten barrels sail to Asia");
    const big = text(s, "93%", { x: MX, y: 1.95, w: 4.6, h: 1.6, fontSize: 120, bold: true, color: C.accent1 });
    const bl = text(s, "of crude exports went to Asia-Pacific (2024, by volume)", { x: MX, y: 3.75, w: 4.5, h: 0.8,
      fontSize: 20, bold: true });
    const bd = text(s, "The OPEC average is about 72%. China alone took 27% of the volume and a third of the value.",
      { x: MX, y: 4.7, w: 4.3, h: 0.95, fontSize: 16, color: C.text2 });
    anim.add(big, "zoom", 200, 1000); anim.add(bl, "float", 500, 800); anim.add(bd, "fade", 800, 800);
    const D = MKT.dest_value_2024;
    const ttl = text(s, `Top buyers by value, 2024 (total US$ ${D.total_bn} bn)`, { x: 5.6, y: 1.95, w: 7.1, h: 0.36, fontSize: 16,
      bold: true, color: C.text2 });
    anim.add(ttl, "fade", 400, 700);
    const ch = `${SID}_bars`;
    s.addChart(pres.charts.BAR, [{ name: "Share of crude export value (%)", labels: D.labels, values: D.values }],
      Object.assign({}, chartText, chartFrame(), { x: 5.45, y: 2.35, w: 7.3, h: 4.0, barDir: "bar", objectName: ch,
        chartColors: [HEX.oil, "F2A33A", "E5A85A", "D8AD7A", "CBB29A", HEX.gray], catAxisOrientation: "maxMin",
        valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false,
        valAxisMinVal: 0, valAxisMaxVal: 40, barGapWidthPct: 45, showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0.0"%"', catAxisLabelFontSize: 18, catAxisLabelColor: HEX.text, showLegend: false,
        layout: { x: 0.2, y: 0.02, w: 0.72, h: 0.96 } }));
    anim.add(ch, "wipeL", 700, 1400);
    source(s, "Sources: Energy Institute (2025), crude trade by volume; OEC (2024 data) by value; OPEC ASB 2025.");
    homeButton(s);
    s.addNotes("Kuwait's crude goes almost entirely east. In 2024, 93% of its crude exports by volume went to the Asia-Pacific region (Energy Institute): China 27%, Japan 13.5%, India 10% and the rest of Asia-Pacific, mainly South Korea and Taiwan, 43%. By value (OEC), China took 33%, South Korea 23%, Japan 17%, Taiwan 11% and India 11%, so the top five buyers, all Asian, account for about 95%. For comparison, OPEC as a whole sent about 72% of its crude to Asia (OPEC ASB 2025). Refined products are more diversified: about a third went to Europe in 2024.");
  });

  // ---------------------------------------------------------------
  def("crudeproducts", "Content", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, chartText, chartFrame, MKT, SID, glow } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, K, "Kuwait now exports fuels, not just crude");
    const E = MKT.exports_kbd;
    const box = { x: 0.5, y: 1.95, w: 8.4, h: 4.45 }, L = { x: 0.1, y: 0.05, w: 0.86, h: 0.8 };
    const ch = `${SID}_lines`;
    s.addChart(pres.charts.LINE, [
      { name: "Crude oil", labels: E.years.map(String), values: E.crude },
      { name: "Refined products", labels: E.years.map(String), values: E.products },
    ], Object.assign({}, chartText, chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, objectName: ch, layout: L,
      chartColors: [HEX.oil, HEX.text], lineSize: 4, lineDataSymbol: "circle", lineDataSymbolSize: 10, showLegend: false,
      valAxisMinVal: 0, valAxisMaxVal: 2500, valAxisMajorUnit: 500, valAxisLabelFormatCode: "#,##0",
      valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
    anim.add(ch, "wipeL", 200, 2200);
    const n = E.years.length, px = (i) => box.x + box.w * (L.x + L.w * (i + 0.5) / n), py = (v) => box.y + box.h * (L.y + L.h * (1 - v / 2500));
    const l1 = text(s, "Crude oil", { x: px(0) - 0.4, y: py(E.crude[0]) - 0.55, w: 2, h: 0.35, fontSize: 17, bold: true, color: C.accent1 });
    const l2 = text(s, "Refined products", { x: px(0) - 0.4, y: py(E.products[0]) + 0.2, w: 2.6, h: 0.35, fontSize: 17, bold: true });
    const un = text(s, "thousand barrels per day", { x: box.x + 0.9, y: box.y - 0.05, w: 3.5, h: 0.3, fontSize: 14, color: C.text2 });
    [l1, l2, un].forEach((o) => anim.add(o, "fade", 600, 700));
    const i24 = E.years.indexOf(2024);
    const ring = shape(s, pres.shapes.OVAL, { x: px(i24) - 0.32, y: py(1186) - 0.32, w: 0.64, h: 0.64, fill: { color: HEX.bg, transparency: 100 },
      line: { color: HEX.gold, width: 2.5 }, shadow: glow(HEX.gold, 14, 0.7) });
    anim.add(ring, "zoom", 2100, 600);
    const a = text(s, "2024", { x: 9.35, y: 2.0, w: 3.4, h: 1.2, fontSize: 80, bold: true, color: C.accent3 });
    const b = text(s, "the first year Kuwait's product exports (1.20 mb/d) beat its crude exports (1.18 mb/d)",
      { x: 9.35, y: 3.25, w: 3.4, h: 1.3, fontSize: 18, bold: true });
    const c = text(s, "Al-Zour ran at full capacity, so crude went to Kuwaiti refineries instead of tankers. Crude regained the lead in 2025.",
      { x: 9.35, y: 4.6, w: 3.4, h: 1.4, fontSize: 15, color: C.text2 });
    anim.add(a, "zoom", 2300, 800); anim.add(b, "float", 2500, 700); anim.add(c, "fade", 2700, 700);
    source(s, "Sources: JODI-Oil World Database (annual averages of monthly data); MEES (2024, 2026); EIA, Today in Energy (2023).");
    homeButton(s);
    s.addNotes("The new refining capacity changed what Kuwait sells. According to JODI data, crude exports fell from about 2.0 million b/d in 2017-2019 to 1.18 million b/d in 2024, while exports of refined products, mainly diesel, jet fuel, naphtha and very-low-sulfur fuel oil from Al-Zour, rose to a record 1.20 million b/d. 2024 was the first and so far only year in which Kuwait exported more products than crude (MEES). In 2025 the mix swung back towards crude, partly because of an outage at Al-Zour in October 2025.");
  });

  // ---------------------------------------------------------------
  def("prices", "Content", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, chartText, chartFrame, MKT, SID, glow } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, K, "The price of a barrel, 2000–2025");
    const B = MKT.brent_annual;
    const box = { x: 0.5, y: 1.95, w: 8.6, h: 4.45 }, L = { x: 0.09, y: 0.06, w: 0.88, h: 0.8 }, ymax = 125;
    const ch = `${SID}_brent`;
    s.addChart(pres.charts.LINE, [{ name: "Brent, annual average (US$/bbl)", labels: B.years.map(String), values: B.values }],
      Object.assign({}, chartText, chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, objectName: ch, layout: L,
        chartColors: [HEX.oil], lineSize: 4, lineDataSymbol: "none", showLegend: false, catAxisLabelFrequency: 5,
        valAxisMinVal: 0, valAxisMaxVal: ymax, valAxisMajorUnit: 25, valAxisLabelFormatCode: '"$"0',
        valGridLine: { color: "2C2C2E", size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false }));
    anim.add(ch, "wipeL", 200, 2400);
    const n = B.years.length;
    const px = (yr) => box.x + box.w * (L.x + L.w * (B.years.indexOf(yr) + 0.5) / n);
    const py = (v) => box.y + box.h * (L.y + L.h * (1 - v / ymax));
    const ev = [[2008, "2008", "$97 avg, $144 peak", -0.85], [2016, "2016", "crash to $44", 0.18],
      [2020, "2020", "COVID: $42", 0.18], [2022, "2022", "war in Ukraine: $101", -0.85]];
    ev.forEach(([yr, a, b, oy]) => {
      const v = B.values[B.years.indexOf(yr)], cx = px(yr), cy = py(v), t0 = 200 + 2400 * (cx - box.x) / box.w;
      const dot = shape(s, pres.shapes.OVAL, { x: cx - 0.09, y: cy - 0.09, w: 0.18, h: 0.18, fill: { color: HEX.text },
        line: { color: HEX.oil, width: 2.5 } });
      const lab = text(s, [{ text: a, options: { bold: true, color: C.text1, breakLine: true } }, { text: b, options: { color: C.text2 } }],
        { x: cx - 1.05, y: cy + oy, w: 2.1, h: 0.62, fontSize: 15, align: "center" });
      anim.add(dot, "zoom", Math.round(t0), 500); anim.add(lab, "fade", Math.round(t0) + 100, 600);
    });
    const k = MKT.kec;
    const card = text(s, [
      { text: "Kuwait Export Crude", options: { bold: true, fontSize: 19, color: C.text1, breakLine: true } },
      { text: `US$ ${k["2023"]}  (2023)`, options: { bold: true, fontSize: 24, color: C.accent1, breakLine: true } },
      { text: `US$ ${k["2024"]}  (2024)`, options: { bold: true, fontSize: 24, color: C.accent1, breakLine: true } },
      { text: "Medium-sour; KPC sets a monthly official selling price for each grade.", options: { fontSize: 15, color: C.text2 } },
    ], { x: 9.45, y: 1.95, w: 3.28, h: 2.75, fill: { color: HEX.card }, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.14,
      margin: [14, 12, 10, 10], paraSpaceAfter: 6 });
    const y26 = text(s, [{ text: "2026 so far: ", options: { bold: true, color: C.accent4 } },
      { text: `Brent averaged US$ ${MKT.brent_annual.ytd_2026} to September, peaking at $138 on 7 April.`, options: { color: C.text2 } }],
      { x: 9.45, y: 4.9, w: 3.28, h: 1.2, fontSize: 15 });
    anim.add(card, "float", 900, 800); anim.add(y26, "fade", 1300, 700);
    source(s, "Sources: EIA Brent spot price (annual averages of daily data); OPEC Annual Report 2024 (Kuwait Export Crude).");
    homeButton(s);
    s.addNotes("Kuwait sells its crude at prices linked to Middle East benchmarks, so its income follows the world oil price. Brent averaged $97 in 2008, with a daily peak of $144, stayed above $100 in 2011-2013, crashed to $44 in 2016 and $42 in 2020 during COVID-19, then jumped to $101 in 2022 after Russia invaded Ukraine (EIA). Kuwait Export Crude averaged $84.26 in 2023 and $80.65 in 2024 (OPEC), close to Dubai and Oman prices because it is a medium-sour grade. In 2026, the Hormuz disruption pushed Brent to $138 on 7 April.");
  });

  // ---------------------------------------------------------------
  def("cost", "Content", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, MKT, glow } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, K, "One of the cheapest barrels on Earth");
    const rows = [
      ["Kuwait: cost per barrel", 8.5, "≈ $8.50", HEX.oil, "Rystad Energy via WSJ, 2016 estimate"],
      ["UK North Sea: cost per barrel", 44.3, "≈ $44", HEX.gray, "same study, for comparison"],
      ["Kuwait crude: selling price", 80.65, `$${MKT.kec["2024"]}`, HEX.gold, "Kuwait Export Crude, OPEC, 2024"],
    ];
    const x0 = 4.75, maxW = 6.6, scale = maxW / 85;
    rows.forEach(([lab, v, vs, col, note], i) => {
      const y = 2.15 + i * 1.3, t0 = 300 + i * 450;
      const a = text(s, lab, { x: MX, y: y - 0.02, w: 4.0, h: 0.42, fontSize: 18, bold: true });
      const b = text(s, note, { x: MX, y: y + 0.42, w: 4.0, h: 0.32, fontSize: 14, color: C.text2 });
      const bar = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: x0, y: y + 0.05, w: v * scale, h: 0.58, rectRadius: 0.1,
        fill: { color: col }, shadow: i === 0 ? glow(HEX.oil, 16, 0.6) : undefined });
      const vv = text(s, vs, { x: x0 + v * scale + 0.15, y: y + 0.02, w: 1.6, h: 0.64, fontSize: 28, bold: true, valign: "middle",
        color: i === 0 ? C.accent1 : C.text1 });
      anim.add(a, "fade", t0, 600); anim.add(b, "fade", t0 + 100, 600); anim.add(bar, "wipeL", t0, 900); anim.add(vv, "fade", t0 + 700, 500);
    });
    const m = text(s, [{ text: "≈ $72 ", options: { bold: true, color: C.accent1, fontSize: 30 } },
      { text: "gross margin on each barrel in 2024, before taxes and the state budget's needs", options: { color: C.text2, fontSize: 17 } }],
      { x: MX, y: 5.6, w: 12.0, h: 0.6, valign: "middle" });
    anim.add(m, "float", 1900, 800);
    source(s, "Sources: Wall Street Journal (2016), Barrel breakdown (Rystad Energy data); OPEC Annual Report 2024.");
    homeButton(s);
    s.addNotes("Kuwait's oil is among the cheapest in the world to produce. Rystad Energy data published by the Wall Street Journal in 2016 put Kuwait's total cost, capital plus operating spending, at about $8.50 per barrel, the lowest of the countries compared; the UK North Sea was about $44. In 2024 Kuwait Export Crude sold for $80.65 on average (OPEC), leaving a gross margin of roughly $72 per barrel. The real constraint is fiscal: because oil pays for most of the state budget, Kuwait needs high prices to balance its budget even though production itself is cheap. Note that the cost figure is a 2016 estimate.");
  });

  // ---------------------------------------------------------------
  def("lng", "Gas", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, chartFrame, MKT, SID } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, K, "Where Kuwait's LNG comes from");
    const G = MKT.lng_2024;
    const ch = `${SID}_lng`;
    const cols = [HEX.gas, "3A8FB7", "2B6A88", "46566A", HEX.gold, "5E5E63", "48484A"];
    s.addChart(pres.charts.DOUGHNUT, [{ name: "LNG imports by supplier, 2024 (%)", labels: G.labels, values: G.values }],
      Object.assign({ x: 0.6, y: 1.95, w: 4.3, h: 4.3, holeSize: 70, chartColors: cols, showLegend: false, showValue: false,
        dataBorder: { pt: 1.5, color: HEX.bg }, objectName: ch, firstSliceAng: 0, layout: { x: 0.03, y: 0.03, w: 0.94, h: 0.94 } }, chartFrame()));
    anim.add(ch, "zoom", 200, 1100);
    const c1 = text(s, `${G.bcm}`, { x: 1.55, y: 3.3, w: 2.4, h: 0.9, fontSize: 52, bold: true, align: "center" });
    const c2 = text(s, "bcm imported, 2024", { x: 1.6, y: 4.2, w: 2.3, h: 0.35, fontSize: 14, color: C.text2, align: "center" });
    anim.add(c1, "fade", 800, 600); anim.add(c2, "fade", 900, 600);
    // legend
    G.labels.forEach((l, i) => {
      const y = 2.0 + i * 0.47, t0 = 900 + i * 90;
      const d = shape(s, pres.shapes.OVAL, { x: 5.25, y: y + 0.1, w: 0.2, h: 0.2, fill: { color: cols[i] } });
      const t = text(s, [{ text: l + "  ", options: { bold: true, color: l === "Oman" ? C.accent3 : C.text1 } },
        { text: `${G.values[i]}%`, options: { color: C.text2 } }], { x: 5.6, y, w: 2.6, h: 0.4, fontSize: 16, valign: "middle" });
      anim.add(d, "zoom", t0, 400); anim.add(t, "fade", t0, 500);
    });
    const stats = [
      [`≈${G.mt} Mt`, "of LNG in 2024, about 40% of all the gas Kuwait used"],
      [`$${G.jkm_2022} → $${G.jkm_2024}`, "Asian spot LNG price (JKM) per MMBtu, 2022 → 2024"],
      ["≈ $4 bn", "estimated 2024 import bill at spot prices (illustrative)"],
    ];
    stats.forEach(([v, l], i) => {
      const y = 2.0 + i * 1.45, t0 = 1400 + i * 300;
      const a = text(s, v, { x: 8.6, y, w: 4.1, h: 0.7, fontSize: 36, bold: true, color: C.accent2 });
      const b = text(s, l, { x: 8.6, y: y + 0.7, w: 4.1, h: 0.62, fontSize: 15, color: C.text2 });
      anim.add(a, "float", t0, 700); anim.add(b, "fade", t0 + 150, 600);
    });
    source(s, "Source: Energy Institute Statistical Review (2025): LNG trade, JKM prices. Bill = 7.15 Mt × 46.4 million MMBtu/Mt × $11.91 (estimate).");
    homeButton(s);
    s.addNotes("Because associated gas cannot keep up with demand for power and water desalination, Kuwait imported 9.7 billion cubic metres of LNG in 2024, about 7.2 million tonnes or 40% of its gas use (Energy Institute). Qatar supplied 61%, Nigeria 17% and the United States 9.5%; Oman supplied about 3%. Gas is bought at international prices: the Asian spot benchmark JKM averaged $33.98 per million BTU in 2022 and $11.91 in 2024. At 2024 spot prices the import bill would be roughly $4 billion; Kuwait's actual contract prices are not published, so this is only an estimate.");
  });

  // ---------------------------------------------------------------
  def("hormuz", "Fire", (s) => {
    const { pres, C, anim, text, shape, header, source, homeButton, chartText, chartFrame, MKT, SID } = get();
    const { HEX, W, MX } = require("./deck_base");
    header(s, "2026 — A LIVE STRESS TEST", "When the Strait of Hormuz closed");
    const Y = MKT.y2026;
    const box = { x: 0.5, y: 2.0, w: 7.9, h: 3.85 }, L = { x: 0.04, y: 0.12, w: 0.92, h: 0.76 };
    const ch = `${SID}_months`;
    s.addChart(pres.charts.BAR, [{ name: "Kuwait crude exports, 2026 (kb/d)", labels: Y.months, values: Y.crude_exports }],
      Object.assign({}, chartText, chartFrame(), { x: box.x, y: box.y, w: box.w, h: box.h, barDir: "col", objectName: ch, layout: L,
        chartColors: [HEX.oil, HEX.oil, HEX.red, HEX.red, HEX.red, HEX.oil, HEX.oil], valAxisHidden: true, valGridLine: { style: "none" },
        catGridLine: { style: "none" }, catAxisLineShow: false, valAxisMinVal: 0, valAxisMaxVal: 1400, barGapWidthPct: 40,
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", catAxisLabelFontSize: 18, catAxisLabelColor: HEX.text,
        showLegend: false }));
    anim.add(ch, "wipeB", 300, 1500);
    const un = text(s, "Kuwait crude exports, thousand b/d, 2026", { x: box.x + 0.2, y: 1.95, w: 6, h: 0.32, fontSize: 15, color: C.text2 });
    anim.add(un, "fade", 300, 600);
    const n = Y.months.length;
    Y.brent.forEach((p, i) => {
      const cx = box.x + box.w * (L.x + L.w * (i + 0.5) / n);
      const t = text(s, `$${Math.round(p)}`, { x: cx - 0.5, y: 5.9, w: 1.0, h: 0.32, fontSize: 15, bold: true,
        color: p > 100 ? C.accent4 : C.text2, align: "center" });
      anim.add(t, "fade", 1600 + i * 80, 500);
    });
    const bl = text(s, "Brent, monthly average (US$/bbl)", { x: box.x + box.w * L.x + 0.15, y: 6.2, w: 4, h: 0.28, fontSize: 12, color: C.text2 });
    anim.add(bl, "fade", 1600, 500);
    const facts = [
      ["7 Mar", "KPC declares force majeure as tankers stop transiting Hormuz"],
      ["−98%", "crude exports from 1,213 kb/d (Feb) to 24 kb/d (May)"],
      ["$138", "Brent peak on 7 April 2026"],
      ["0", "export routes that bypass the Gulf: every terminal is inside it"],
    ];
    facts.forEach(([v, l], i) => {
      const y = 1.98 + i * 1.08, t0 = 1200 + i * 300;
      const a = text(s, v, { x: 8.85, y, w: 3.9, h: 0.56, fontSize: 32, bold: true, color: i === 3 ? C.accent1 : C.accent4 });
      const b = text(s, l, { x: 8.85, y: y + 0.54, w: 3.9, h: 0.5, fontSize: 14, color: C.text2 });
      anim.add(a, "float", t0, 700); anim.add(b, "fade", t0 + 150, 600);
    });
    source(s, "Sources: JODI-Oil World Database (monthly, 2026); EIA Brent spot prices; Reuters via CNBC (7 Mar 2026). 2026 data are preliminary.");
    homeButton(s);
    s.addNotes("2026 tested Kuwait's export model. During the U.S.-Iran conflict, tanker traffic through the Strait of Hormuz stopped and on 7 March 2026 KPC declared force majeure and cut output (Reuters). Official JODI data show crude exports collapsing from 1.21 million b/d in February to only 41,000 b/d in April and 24,000 b/d in May, before recovering to about 1.1 million b/d by July. Brent rose from $71 in February to a monthly average of $117 in April, peaking at $138 on 7 April (EIA). Unlike Saudi Arabia and the UAE, Kuwait has no pipeline that bypasses the Strait, so all of its exports depend on Hormuz. These 2026 figures are preliminary.");
  });
};
