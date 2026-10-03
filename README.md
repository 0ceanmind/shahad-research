# Kuwait's Oil and Gas Industry — EGCH2230 research project

University of Technology and Applied Sciences – Salalah · EGCH2230 Petroleum and Petrochemical Processing
Prepared by **Shahad Issa Obaid Alghriabi**

## Deliverables

| File | What it is |
|---|---|
| `Kuwait_Oil_and_Gas_Research_Report.docx` | 32-page research report (cover with the UTAS Salalah logo, abstract, contents, 6 chapters, 10 figures, 14 tables, APA 7 references, data-notes appendix) |
| `Kuwait_Oil_and_Gas_Presentation.pptx` | 28-slide 16:9 presentation plus 5 hidden map-zoom slides: dark keynote style, UTAS logo on every slide, Morph transitions, auto-playing builds with ambient motion, clickable navigation, speaker notes on every slide |

Both cover the five required points: (1) history and types of oil and gas, (2) resources and industrial growth,
(3) locations of oil and gas reservoirs, (4) export markets and the cost of oil and gas, (5) references.

## Presenting the deck

- Present from **PowerPoint for Microsoft 365 / 2021 / 2019** (Windows or Mac) or PowerPoint for the web, in Slide Show mode.
  Morph and the motion loops only play in a slide show. Google Slides, Keynote and file previewers show static slides.
- Every slide builds itself automatically; press → / Space / click to move on.
- Slide 2 is the contents hub: click any chapter tile to jump there. The small grid button at the bottom right of every slide returns to it.
- Slide 16 (field map) and slide 17 (four producing areas): click an area on the map, a pill or a card to zoom in. The map zooms in smoothly (Morph) to a
  hidden detail slide. From there, the pills under the map switch between areas, **← Back to map** returns to the map,
  and **Continue →** on the map carries on with slide 17. In normal running order the hidden zoom slides are skipped.
- Every slide has speaker notes with the full talking points and sources.

## Rebuilding

`build/build.sh` regenerates everything from the scripts and data in `build/`:

- `data/`: Energy Institute (via Our World in Data), JODI-Oil, EIA Brent and Natural Earth extracts, plus the curated field, route, market and series files.
- `render_logo.py`, `render_assets.py`, `render_map.py`, `render_flowmap.py`: logo badge, ambient light, maps and other images.
- `build_deck.js`, `build_regions.js`, `build_markets.js`, `deck_kit.js`, `deck_base.js`: the presentation (pptxgenjs).
- `animate.py`: adds Morph transitions, the choreographed builds, ambient loops, tanker motion paths and hidden slides.
- `qa/qa_check.py`: layout checker (text overflow, collisions, logo and footer zones, minimum font size, alt text); `qa/render.sh` renders every slide.
- `build_doc.js`, `doc_lib.js`, `charts_doc.py`, `toc_pages.py`: the report (docx), its figures and the page-number pass.
