// Render react-icons (Tabler line set) to PNG data URIs for pptxgenjs.
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const tb = require("react-icons/tb");

async function icon(name, color = "#F5F5F7", size = 512) {
  const Comp = tb[name];
  if (!Comp) throw new Error("icon not found: " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size), strokeWidth: 1.6 })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
module.exports = { icon };
