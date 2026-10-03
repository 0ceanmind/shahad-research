#!/usr/bin/env bash
# Rebuild both deliverables. Needs: node (pptxgenjs, docx, sharp, react-icons), python3 (matplotlib, numpy, pillow),
# LibreOffice (writer) and poppler-utils (pdftotext/pdfinfo) for the report's page-number pass.
set -euo pipefail
cd "$(dirname "$0")"
npm install --silent
python3 data/series.py >/dev/null
python3 render_assets.py >/dev/null
python3 render_logo.py >/dev/null
python3 render_map.py >/dev/null
python3 render_flowmap.py >/dev/null
python3 charts_doc.py >/dev/null
# presentation
node build_deck.js
python3 animate.py out/deck_raw.pptx out/anim.json out/deck.pptx
python3 qa/qa_check.py out/deck.pptx
cp out/deck.pptx ../Kuwait_Oil_and_Gas_Presentation.pptx
# report (two passes so the contents pages carry real page numbers)
node build_doc.js
(cd out && soffice --headless --convert-to pdf report.docx >/dev/null)
python3 toc_pages.py out/report.pdf out/toc_index.json out/pages.json
node build_doc.js out/pages.json
cp out/report.docx ../Kuwait_Oil_and_Gas_Research_Report.docx
echo "done"
