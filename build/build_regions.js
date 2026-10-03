// Map slides: the field map (hub), the four-area overview, and hidden zoom slides for each producing area.
// Zoom works by Morph: the same high-resolution map picture (!!map) is shown whole on the map slide and
// cropped/enlarged to a viewport on each zoom slide, and every field marker (!!f_<id>) moves with it.
const fs = require("fs");
const path = require("path");
const { HEX, W, MX, A, CARD_R } = require("./deck_base");

const F = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "fields.json")));
const MAPF = JSON.parse(fs.readFileSync(A("map_frame.json")));
const KLAT = Math.cos(29.2 * Math.PI / 180);
const FULL = { x: 1.0, y: 1.75, h: 4.75 };
FULL.w = FULL.h * MAPF.px[0] / MAPF.px[1];
const SMALL = { x: 0.3, y: 1.95, h: 4.3 };
SMALL.w = SMALL.h * MAPF.px[0] / MAPF.px[1];
const VIEW = { x: MX, y: 1.95, w: 7.45, h: 3.88 }; // zoom viewport (area switcher sits below it)

// image box (x, y, w, h of the whole map picture) -> slide position of a lon/lat
const proj = (box, lon, lat) => [box.x + (lon - MAPF.lon0) * KLAT / MAPF.wu * box.w, box.y + (MAPF.lat1 - lat) / MAPF.hu * box.h];
function zoomBox(bbox) {
  const [lo0, lo1, la0, la1] = bbox;
  const s = Math.min(VIEW.w / ((lo1 - lo0) * KLAT), VIEW.h / (la1 - la0)); // inches per map unit
  const w = MAPF.wu * s, h = MAPF.hu * s;
  const cx = VIEW.x + VIEW.w / 2, cy = VIEW.y + VIEW.h / 2;
  const clon = (lo0 + lo1) / 2, clat = (la0 + la1) / 2;
  return { x: cx - (clon - MAPF.lon0) * KLAT * s, y: cy - (MAPF.lat1 - clat) * s, w, h, s };
}
const inView = (x, y, pad = 0.12) => x > VIEW.x + pad && x < VIEW.x + VIEW.w - pad && y > VIEW.y + pad && y < VIEW.y + VIEW.h - pad;
const colorOf = (f) => (f.kind === "gas" ? HEX.gas : f.kind === "infra" || f.kind === "city" ? HEX.text : HEX.oil);
// field = disc, refinery/port = diamond, town = ring
function marker(K, pres, s, f, x, y, d, col, glowSize) {
  const name = `!!f_${f.id}`;
  if (f.kind === "infra") return K.shape(s, pres.shapes.RECTANGLE, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col }, rotate: 45, name });
  if (f.kind === "city") return K.shape(s, pres.shapes.OVAL, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: "000000", transparency: 100 },
    line: { color: col, width: 1.75 }, name });
  return K.shape(s, pres.shapes.OVAL, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: col },
    shadow: glowSize ? K.glow(col, glowSize, 0.9) : undefined, name });
}
const sizeOf = (f, base) => (f.major ? base * 1.5 : f.kind === "infra" ? base * 0.8 : f.kind === "city" ? base * 0.8 : base);

module.exports.mainSlides = function (state, ctx) {
  const def = state.def;

  // ---- the map (also used as the hub the zoom slides return to) ----
  function mapSlide(s, animated) {
    const { K, C, pres } = ctx();
    const { text, shape, img, m, ambient, header, source, homeButton, glow } = K;
    ambient(s, ["amber", 3.9, 4.2, 8.5], ["blue", 11.5, 6.9, 6]);
    header(s, "03 — RESERVOIR LOCATIONS", "Kuwait's oil and gas map");
    img(s, A("map_dark.png"), { x: FULL.x, y: FULL.y, w: FULL.w, h: FULL.h, name: "!!map", altText: "Map of Kuwait with its main oil and gas fields" });
    if (animated) m.scale("!!map", 200, 1300, 0.97);
    let k = 0;
    const majors = [];
    for (const f of F.fields) {
      if (f.zoomOnly) continue;
      const [x, y] = proj(FULL, f.lon, f.lat), col = colorOf(f);
      const d = sizeOf(f, 0.2);
      const o = marker(K, pres, s, f, x, y, d, col, f.kind === "oil" || f.kind === "gas" ? (f.major ? 18 : 10) : 0);
      const tm = 900 + (k++) * 55;
      if (animated) m.land(o, tm, 650, 1.9);
      if (f.major) majors.push(o);
      if (f.label) {
        const [dx, dy, al] = f.label;
        // dark halo keeps border lines from cutting through the names
        const t = text(s, f.name, { x: x + dx, y: y + dy, w: 1.9, h: 0.3, fontSize: 13, color: f.kind === "oil" || f.kind === "gas" ? C.text1 : C.text2,
          bold: f.kind === "oil" || f.kind === "gas", align: al || "left", glow: { size: 6, opacity: 0.85, color: "141416" }, name: `!!fl_${f.id}` });
        if (animated) m.fade(t, Math.max(1800, tm + 450), 700);
        if (f.leader) {
          const [x1, y1, x2, y2] = f.leader;
          const ln = shape(s, pres.shapes.LINE, { x: x + x1, y: y + y1, w: x2 - x1, h: y2 - y1, line: { color: HEX.text3, width: 0.75 }, name: `!!fk_${f.id}` });
          if (animated) m.fade(ln, Math.max(1800, tm + 450), 700);
        }
      }
    }
    majors.forEach((o, i) => m.breathe(o, (animated ? 2600 : 300) + i * 320, 1700, 1.22));
    const lab = (str, lon, lat, name) => {
      const [x, y] = proj(FULL, lon, lat);
      return text(s, str, { x: x - 1.2, y: y - 0.15, w: 2.4, h: 0.3, fontSize: 13, color: HEX.text3, align: "center", charSpacing: 4, name });
    };
    [lab("IRAQ", 46.75, 30.17, "!!c_iraq"), lab("SAUDI ARABIA", 46.95, 28.3, "!!c_saudi"), lab("ARABIAN GULF", 48.85, 29.2, "!!c_gulf")]
      .forEach((t) => animated && m.fade(t, 600, 900));
    const rx = 8.45, rw = W - MX - rx;
    const legend = text(s, [{ text: "●  ", options: { color: C.accent1 } }, { text: "Oil   ", options: { color: C.text2 } },
      { text: "●  ", options: { color: C.accent2 } }, { text: "Gas   ", options: { color: C.text2 } },
      { text: "◆  ", options: { color: C.text1 } }, { text: "Refinery / port   ", options: { color: C.text2 } },
      { text: "○  ", options: { color: C.text1 } }, { text: "Town", options: { color: C.text2 } }],
      { x: rx, y: 1.95, w: rw, h: 0.35, fontSize: 15, name: "!!legend" });
    const hint = text(s, "Click an area to zoom in", { x: rx, y: 2.38, w: rw, h: 0.32, fontSize: 14, color: C.text2, italic: true, name: "!!hint" });
    if (animated) { m.fade(legend, 1900, 700); m.fade(hint, 2050, 700); }
    F.zoom.forEach((z, i) => {
      const y = 2.85 + i * 0.66;
      const bg = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: rx, y, w: rw, h: 0.54, rectRadius: 0.27, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 }, name: `!!pill${i}` });
      const dot = shape(s, pres.shapes.OVAL, { x: rx + 0.22, y: y + 0.17, w: 0.2, h: 0.2, fill: { color: HEX.oil }, name: `!!pilld${i}` });
      const tx = text(s, z.name, { x: rx + 0.58, y, w: rw - 1.0, h: 0.54, fontSize: 17, bold: true, valign: "middle", name: `!!pillt${i}` });
      const ar = img(s, state.ic("TbArrowRight", HEX.text2), { x: rx + rw - 0.45, y: y + 0.14, w: 0.26, h: 0.26, name: `!!pilla${i}` });
      shape(s, pres.shapes.ROUNDED_RECTANGLE, { x: rx, y, w: rw, h: 0.54, rectRadius: 0.27, fill: { color: "000000", transparency: 100 },
        hyperlink: { slide: state.IDX[z.id], tooltip: `Zoom into ${z.name}` }, name: `!!pillh${i}` });
      if (animated) { const t0 = 2100 + i * 140; m.rise(bg, t0); m.rise(dot, t0); m.rise(tx, t0); m.glide(ar, t0 + 200, 700, -0.01); }
    });
    if (!animated) K.button(s, "Continue", rx, 5.6, 2.2, 0.48, state.IDX.regions, { fill: HEX.oil, color: C.background1, name: "hub_next",
      icon: ["TbArrowRight", HEX.bg, "right"] });
    source(s, "Sources: KPC (n.d.-a); Horn (2014); Naqi et al. (2023); EIA (2023a). Field positions approximate. Base map: Natural Earth (n.d.).");
    homeButton(s, state.IDX.contents);
    s.addNotes(animated ? F.notes_map : "Map hub: choose another area to zoom into, or press Continue to move on to the overview of the four producing areas.");
  }
  state.mapSlide = mapSlide;
  def("map", "Content", (s) => mapSlide(s, true));

  // ---- the four areas on one slide; each card also zooms in ----
  def("regions", "Content", (s) => {
    const { K, C, pres } = ctx();
    const { text, shape, img, m, ambient, header, source, homeButton } = K;
    ambient(s, ["amber", 3.0, 4.1, 7.5], ["gold", 11.0, 2.0, 6]);
    header(s, "03 — RESERVOIR LOCATIONS", "Four producing areas");
    img(s, A("map_dark.png"), { x: SMALL.x, y: SMALL.y, w: SMALL.w, h: SMALL.h, name: "!!map", altText: "Map of Kuwait with its main oil and gas fields" });
    for (const f of F.fields) {
      if (f.zoomOnly) continue;
      const [x, y] = proj(SMALL, f.lon, f.lat), col = colorOf(f);
      marker(K, pres, s, f, x, y, sizeOf(f, 0.175), col, f.kind === "oil" || f.kind === "gas" ? 10 : 0);
    }
    const rx = 6.05, cw = W - MX - rx, ch = 1.02, gap = 0.12;
    F.regions.forEach((r, i) => {
      const x = rx, y = 1.95 + i * (ch + gap), t0 = 400 + i * 200;
      const col = r.color === "gas" ? HEX.gas : HEX.oil;
      const card = shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: CARD_R, fill: { color: HEX.card }, line: { color: "FFFFFF", transparency: 90, width: 0.75 } });
      const dot = shape(s, pres.shapes.OVAL, { x: x + 0.25, y: y + 0.17, w: 0.2, h: 0.2, fill: { color: col } });
      const h = text(s, r.name, { x: x + 0.58, y: y + 0.1, w: cw - 1.2, h: 0.34, fontSize: 18, bold: true });
      const b = text(s, r.fields, { x: x + 0.58, y: y + 0.43, w: cw - 0.8, h: 0.27, fontSize: 15 });
      const d = text(s, r.detail, { x: x + 0.58, y: y + 0.7, w: cw - 0.8, h: 0.25, fontSize: 14, color: C.text2 });
      const ar = img(s, state.ic("TbArrowRight", HEX.text2), { x: x + cw - 0.45, y: y + 0.13, w: 0.26, h: 0.26 });
      shape(s, pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: CARD_R, fill: { color: "000000", transparency: 100 },
        hyperlink: { slide: state.IDX[F.zoom[i].id], tooltip: `Zoom into ${r.name}` } });
      m.scale(card, t0, 900, 0.96); m.scale(dot, t0 + 60, 700, 0.7); m.rise(h, t0 + 100); m.rise(b, t0 + 180); m.rise(d, t0 + 260);
      m.glide(ar, t0 + 300, 700, -0.01);
    });
    source(s, "Sources: KPC (n.d.-a); Naqi et al. (2023); EIA (2013, 2023a); S&P Global (2018a); KUNA (2024). Click a card to zoom in.");
    homeButton(s, state.IDX.contents);
    s.addNotes(F.notes_regions);
  });
};

module.exports.hiddenSlides = function (state, ctx) {
  const def = state.def;
  F.zoom.forEach((z, zi) => {
    def(z.id, "Content", (s) => {
      const { K, C, pres } = ctx();
      const { text, shape, img, m, ambient, header, source, homeButton, glow } = K;
      ambient(s, ["amber", 3.9, 4.2, 8.5], ["blue", 11.5, 6.9, 6]);
      header(s, "03 — RESERVOIR LOCATIONS  ·  ZOOM", z.name);
      const box = zoomBox(z.bbox);
      // the same picture, cropped to the viewport: Morph turns the change into a smooth zoom
      img(s, A("map_dark.png"), { x: VIEW.x, y: VIEW.y, w: box.w, h: box.h, name: "!!map", altText: "Zoomed map of a Kuwaiti producing area",
        sizing: { type: "crop", x: VIEW.x - box.x, y: VIEW.y - box.y, w: VIEW.w, h: VIEW.h } });
      shape(s, pres.shapes.RECTANGLE, { x: VIEW.x, y: VIEW.y, w: VIEW.w, h: VIEW.h,
        fill: { color: "000000", transparency: 100 }, line: { color: HEX.line, width: 1 }, name: "!!mapframe" });
      const mine = new Set(z.fields);
      for (const f of F.fields) {
        const [x, y] = proj(box, f.lon, f.lat);
        const focus = mine.has(f.id), col = focus ? colorOf(f) : "4A4A4F";
        const d = sizeOf(f, 0.25) * (focus ? 1 : 0.8);
        if (!inView(x, y, 0.08 + d * 0.71)) continue;
        const o = marker(K, pres, s, f, x, y, d, col, focus && (f.kind === "oil" || f.kind === "gas") ? 18 : 0);
        if (focus && f.zlabel) {
          const [dx, dy, al] = f.zlabel;
          const t = text(s, f.zname || f.name, { x: x + dx, y: y + dy, w: 1.95, h: 0.34, fontSize: 15, bold: f.kind === "oil" || f.kind === "gas",
            color: C.text1, align: al, glow: { size: 6, opacity: 0.85, color: "141416" }, name: `!!fl_${f.id}` });
          // labels share names with the map labels and carry no entrance: Morph glides them with the zoom
          if (f.major) m.breathe(o, 1000, 1700, 1.2);
        }
      }
      // area switcher under the map; field list and back button on the right
      const pw = (VIEW.w - 3 * 0.12) / 4, sy = VIEW.y + VIEW.h + 0.13;
      F.zoom.forEach((o, i) => {
        const cur = i === zi;
        K.button(s, o.short, VIEW.x + i * (pw + 0.12), sy, pw, 0.4, cur ? state.IDX[z.id] : state.IDX[o.id],
          { fontSize: 14, fill: cur ? HEX.oil : HEX.card2, color: cur ? C.background1 : C.text1, name: `!!zsw${i}`,
            tooltip: cur ? z.name : `Zoom to ${o.name}` });
      });
      const rx = 8.45, rw = W - MX - rx;
      const rows = [];
      z.rows.forEach(([n, d], i) => {
        rows.push({ text: n, options: { bold: true, color: C.text1, fontSize: 16, breakLine: true, paraSpaceBefore: i ? 9 : 0 } });
        rows.push({ text: d, options: { color: C.text2, fontSize: 14, breakLine: i < z.rows.length - 1 } });
      });
      // one persistent list object: switching areas crossfades it in place instead of blinking
      text(s, rows, { x: rx, y: VIEW.y + 0.02, w: rw, h: VIEW.h - 0.02, name: "!!zlist" });
      K.button(s, "Back to map", rx, sy, 2.3, 0.4, state.IDX.maphub, { name: "!!zback", fontSize: 14, line: HEX.line, icon: ["TbArrowLeft", HEX.text, "left"] });
      source(s, "Sources: KPC (n.d.-a), KOC field map; Horn (2014); Naqi et al. (2023); KUNA (2024); Offshore Engineer (2025). Positions approximate.");
      homeButton(s, state.IDX.contents);
      s.addNotes(`Zoomed view of ${z.name}. Use the area buttons under the map to switch to another area, or Back to map on the right to return.`);
    }, { hidden: true, partner: "map", advClick: false });
  });
  def("maphub", "Content", (s) => state.mapSlide(s, false), { hidden: true, partner: "zoom_se", advClick: false });
};
