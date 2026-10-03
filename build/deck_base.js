// Design system for the Kuwait deck: theme, layouts with the UTAS logo badge, animation registry.
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

// UTAS logo badge (white tile, logo inside) — top-right of every slide; larger on the title slide.
// The badge and footer are added to each slide last (see deck_kit chrome) so the drifting ambient light never tints them.
const BADGE = { w: 2.15, y: 0.3 };
const BADGE_TITLE = { w: 3.0, y: 0.45 };
const TITLE_W = 9.55; // title/kicker width: ends 0.28" before the badge
const CARD_R = 0.14;  // corner radius shared by every card

async function badgeObject(spec) {
  const meta = await sharp(A("logo_badge.png")).metadata();
  const h = spec.w * meta.height / meta.width;
  return { image: { path: A("logo_badge.png"), x: W - MX - spec.w, y: spec.y, w: spec.w, h } };
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
  const badge = await badgeObject(BADGE), badgeTitle = await badgeObject(BADGE_TITLE);
  const bg = { path: A("bg_base.jpg") };

  pres.defineSlideMaster({ title: "Title", background: bg, objects: [] });
  // slide numbers are static text (deck_kit chrome): the hidden zoom slides sit inside the running order, and a
  // field would make the visible numbering jump over them
  pres.defineSlideMaster({ title: "Section", background: bg, objects: [] });
  pres.defineSlideMaster({
    title: "Content", background: bg,
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 0.42, w: TITLE_W, h: 0.36, fontSize: 15, bold: true,
        color: C.accent1, charSpacing: 3, margin: 0, valign: "top", align: "left" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.8, w: TITLE_W, h: 0.86, fontSize: 38, bold: true,
        color: C.text1, margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
  });
  return { pres, C, chrome: { badge: badge.image, badgeTitle: badgeTitle.image } };
}

// Animation registry -> anim.json consumed by animate.py
class Anim {
  constructor() { this.slides = {}; }
  begin(n, opts) { this.cur = Object.assign({ transition: "morph", dur: 1400, anims: [], triggers: [] }, opts); this.slides[n] = this.cur; }
  add(name, effect, delay = 0, dur = 800, params = {}) { this.cur.anims.push(Object.assign({ name, effect, delay: Math.round(delay), dur: Math.round(dur) }, params)); return name; }
  hang(name, emu) { (this.cur.hang = this.cur.hang || {})[name] = emu; }
  roundCaps(...names) { (this.cur.roundCaps = this.cur.roundCaps || []).push(...names); }
  trigger(trigger, targets) { this.cur.triggers.push({ trigger, targets }); }
  write(file) { fs.writeFileSync(file, JSON.stringify({ slides: this.slides }, null, 1)); }
}

module.exports = { makePres, THEME, HEX, W, H, MX, A, Anim, BADGE, TITLE_W, CARD_R };
