// Small helpers on top of docx-js for an APA-style academic report.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const {
  Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  HeadingLevel, BorderStyle, Bookmark, InternalHyperlink, TabStopType, PageBreak, VerticalAlign,
} = require("docx");

const CW = 9026; // A4 content width in DXA with 1" margins
const COL = { ink: "1F2937", muted: "6B7280", rule: "D1D5DB", head: "1F2937", zebra: "F7F7F8", accent: "9A3412" };

// "**bold**" and "*italic*" inline markup -> TextRuns
function runs(txt, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(txt))) {
    if (m.index > last) out.push(new TextRun({ text: txt.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < txt.length) out.push(new TextRun({ text: txt.slice(last), ...base }));
  return out;
}

const body = { line: 360, after: 140 };
const P = (txt, o = {}) => new Paragraph({ children: runs(txt), alignment: AlignmentType.JUSTIFIED, spacing: body, ...o });

let anchorN = 0;
const TOC = []; // {level, text, anchor}
function H(level, text) {
  const anchor = `_h${++anchorN}`;
  TOC.push({ level, text, anchor });
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    children: [new Bookmark({ id: anchor, children: [new TextRun(text)] })],
  });
}
const H1 = (t) => H(1, t);
const H2 = (t) => H(2, t);

function bullets(items) {
  return items.map((t) => new Paragraph({ children: runs(t), numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.LEFT, spacing: { line: 320, after: 80 } }));
}

const FIGS = [], TABS = [];
function caption(kind, title) {
  const list = kind === "Figure" ? FIGS : TABS;
  const n = list.length + 1;
  const anchor = `_${kind[0].toLowerCase()}${n}`;
  list.push({ n, title, anchor });
  return [
    new Paragraph({ keepNext: true, spacing: { before: 200, after: 40 }, children: [new Bookmark({ id: anchor,
      children: [new TextRun({ text: `${kind} ${n}`, bold: true, font: "Times New Roman" })] })] }),
    new Paragraph({ keepNext: true, spacing: { after: 100 }, children: [new TextRun({ text: title, italics: true })] }),
  ];
}
const note = (txt) => new Paragraph({ spacing: { before: 60, after: 220, line: 276 }, alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text: "Note. ", italics: true, size: 20 }), ...runs(txt, { size: 20 })] });

async function figure(file, title, noteTxt, widthIn = 6.2) {
  const meta = await sharp(file).metadata();
  const w = widthIn * 96, h = w * meta.height / meta.width;
  return [
    ...caption("Figure", title),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 40 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w), height: Math.round(h) },
        altText: { title, description: title, name: path.basename(file) } })] }),
    note(noteTxt),
  ];
}

function table(title, headers, rows, widths, noteTxt, opts = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const scale = CW / total;
  const w = widths.map((x) => Math.round(x * scale));
  w[w.length - 1] += CW - w.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: COL.rule };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (txt, i, head, zebra) => new TableCell({
    width: { size: w[i], type: WidthType.DXA }, borders,
    shading: { fill: head ? COL.head : zebra ? COL.zebra : "FFFFFF", type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 60, bottom: 60, left: 90, right: 90 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: (opts.align && opts.align[i]) || AlignmentType.LEFT, spacing: { line: 252 },
      children: runs(String(txt), { font: "Arial", size: 18, bold: head, color: head ? "FFFFFF" : COL.ink }) })],
  });
  const t = new Table({
    width: { size: CW, type: WidthType.DXA }, columnWidths: w,
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r, k) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, k % 2 === 1)) }))],
  });
  return [...caption("Table", title), t, noteTxt ? note(noteTxt) : new Paragraph({ spacing: { after: 200 }, children: [] })];
}

// Static table of contents / lists with dot leaders, internal links and page numbers resolved in a second pass
function tocLines(entries, pages, kind) {
  return entries.map((e) => {
    const label = kind === "toc" ? e.text : `${kind} ${e.n}. ${e.title}`;
    const pg = pages[label] || "";
    return new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CW, leader: "dot" }],
      indent: { left: kind === "toc" && e.level === 2 ? 440 : 0, hanging: kind === "toc" ? 0 : 0 },
      spacing: { after: kind === "toc" && e.level === 1 ? 80 : 40, before: kind === "toc" && e.level === 1 ? 120 : 0, line: 276 },
      children: [new InternalHyperlink({ anchor: e.anchor, children: [
        new TextRun({ text: label, bold: kind === "toc" && e.level === 1, size: 22 }),
        new TextRun({ text: `\t${pg}`, bold: kind === "toc" && e.level === 1, size: 22 })] })],
    });
  });
}

module.exports = { runs, P, H1, H2, bullets, figure, table, note, tocLines, TOC, FIGS, TABS, CW, COL, PageBreak };
