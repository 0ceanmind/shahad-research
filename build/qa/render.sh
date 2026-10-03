#!/bin/bash
# Render every slide (hidden ones included). Env: DECK (default ../out/deck.pptx), PNG output dir (default png), DPI.
set -e
cd "$(dirname "$0")"
SK=/root/.claude/skills/synced/8d44c61e-ec2a-41da-b998-745aa919b75c_651158c5-b892-494f-81fc-386b0b78bd93/pptx/scripts
PNG=${PNG:-png}; rm -rf tmp "$PNG" && mkdir -p tmp "$PNG"
DECK="$DECK" python3 - <<'PY'
import zipfile, re
import os; zin = zipfile.ZipFile(os.environ.get("DECK") or "../out/deck.pptx"); zout = zipfile.ZipFile("tmp/all.pptx", "w", zipfile.ZIP_DEFLATED)
for i in zin.infolist():
    b = zin.read(i.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$", i.filename):
        b = b.replace(b'<p:sld show="0" ', b'<p:sld ')
    zout.writestr(i, b)
zout.close()
PY
(cd tmp && timeout 300 python3 $SK/office/soffice.py --headless --convert-to pdf all.pptx >/dev/null 2>&1)
pdftoppm -png -r ${DPI:-96} tmp/all.pdf "$PNG"/slide
PNG="$PNG" python3 - <<'PY'
from PIL import Image, ImageDraw
import glob
import os
fs = sorted(glob.glob((os.environ.get("PNG") or "png") + "/slide-*.png"))
for k in range(0, len(fs), 9):
    ims = [Image.open(f).convert("RGB").resize((640, 360)) for f in fs[k:k+9]]
    sheet = Image.new("RGB", (3*650, 3*380), (60, 60, 60))
    for j, im in enumerate(ims):
        x, y = (j % 3)*650+5, (j//3)*380+5
        sheet.paste(im, (x, y)); ImageDraw.Draw(sheet).text((x+4, y+362), fs[k+j].split("/")[-1], fill=(255,255,0))
    sheet.save((os.environ.get("PNG") or "png") + f"_sheet-{k//9+1}.jpg", quality=85)
print(len(fs), "slides rendered")
PY
