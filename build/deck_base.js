// Design system for the Kuwait deck: theme, layouts, logo badge, helpers, animation registry.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

const A = (f) => path.join(__dirname, "assets", f);
const W = 13.333, H = 7.5, MX = 0.6;

// Dark keynote theme. dk1/lt1 are swapped on purpose: text1 = light text and background1 = near-black,
// so text and shapes added later in PowerPoint default to the same dark look.
const THEME = {
  name: "Kuwait Crude",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "F5F5F7", lt1: "0B0B0F", dk2: "A1A1A6", lt2: "1C1C1E",
    accent1: "FF9F0A", accent2: "64D2FF", accent3: "FFD60A",
    accent4: "FF453A", accent5: "30D158", accent6: "636366",
    hlink: "64D2FF", folHlink: "BF5AF2",
  },
};
const HEX = {
  text: "F5F5F7", text2: "A1A1A6", text3: "8E8E93", bg: "0B0B0F", card: "1C1C1E", card2: "2C2C2E",
  line: "3A3A3C", oil: "FF9F0A", gas: "64D2FF", gold: "FFD60A", red: "FF453A", green: "30D158", gray: "636366",
};

// Logo badge (top-right on every layout). Uses assets/utas_logo.png when present.
const BADGE = { w: 1.05, h: 1.05, y: 0.3 };
BADGE.x = W - MX - BADGE.w;

async function logoObjects() {
  const tile = { text: { text: "", options: { shape: "roundRect", x: BADGE.x, y: BADGE.y, w: BADGE.w, h: BADGE.h,
    fill: { color: "FFFFFF" }, rectRadius: 0.14, line: { type: "none" } } } };
  const file = fs.existsSync(A("utas_logo.png")) ? A("utas_logo.png") : A("logo_placeholder.png");
  if (!fs.existsSync(file)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect x="40" y="40" width="520" height="520" rx="40" fill="none" stroke="#8E8E93" stroke-width="10" stroke-dasharray="30 20"/>
      <text x="300" y="285" font-family="Arial" font-size="92" font-weight="bold" fill="#636366" text-anchor="middle">UTAS</text>
      <text x="300" y="390" font-family="Arial" font-size="64" fill="#8E8E93" text-anchor="middle">logo</text></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(file);
  }
  const meta = await sharp(file).metadata();
  const pad = 0.1, bw = BADGE.w - 2 * pad, bh = BADGE.h - 2 * pad;
  const s = Math.min(bw / meta.width, bh / meta.height);
  const w = meta.width * s, h = meta.height * s;
  return [tile, { image: { path: file, x: BADGE.x + (BADGE.w - w) / 2, y: BADGE.y + (BADGE.h - h) / 2, w, h } }];
}

async function makePres() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = "Shahad Issa Obaid Alghriabi";
  pres.company = "University of Technology and Applied Sciences";
  pres.subject = "EGCH2230 Petroleum and Petrochemical Processing";
  pres.title = "Kuwait: A Century of Oil and Gas";
  const C = pres.SchemeColor;
  const logo = await logoObjects();
  const footer = [{ text: { text: "Kuwait Oil & Gas  ·  EGCH2230", options: { x: MX, y: 6.92, w: 6, h: 0.32,
    fontSize: 12, color: C.text2, margin: 0, valign: "middle" } } }];
  const num = { x: W - MX - 0.6, y: 6.92, w: 0.6, h: 0.32, fontSize: 12, color: C.text2, align: "right", margin: 0, valign: "middle" };

  pres.defineSlideMaster({ title: "Title", background: { path: A("bg_title.jpg") }, objects: [...logo] });
  pres.defineSlideMaster({ title: "Section", background: { path: A("bg_section.jpg") }, objects: [...logo, ...footer], slideNumber: num });
  for (const [name, bg] of [["Content", "bg_content.jpg"], ["Gas", "bg_gas.jpg"], ["Fire", "bg_fire.jpg"]]) {
    pres.defineSlideMaster({
      title: name, background: { path: A(bg) },
      objects: [
        ...logo, ...footer,
        { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 0.42, w: 9.8, h: 0.36, fontSize: 15, bold: true,
          color: C.accent1, charSpacing: 3, margin: 0, valign: "top", align: "left" }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.8, w: 10.4, h: 0.86, fontSize: 38, bold: true,
          color: C.text1, margin: 0, valign: "top", align: "left" }, text: "" } },
      ],
      slideNumber: num,
    });
  }
  return { pres, C };
}

// Animation registry -> anim.json consumed by animate.py
class Anim {
  constructor() { this.slides = {}; }
  begin(n, transition = "morph", dur = 1400) {
    this.cur = { transition, dur, anims: [], triggers: [] }; this.slides[n] = this.cur;
  }
  add(name, effect = "float", delay = 0, dur = 700) { this.cur.anims.push({ name, effect, delay, dur }); return name; }
  trigger(trigger, targets) { this.cur.triggers.push({ trigger, targets }); }
  write(file) { fs.writeFileSync(file, JSON.stringify({ slides: this.slides }, null, 1)); }
}

module.exports = { makePres, THEME, HEX, W, H, MX, A, Anim, BADGE };
