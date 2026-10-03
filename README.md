# Kuwait's Oil and Gas Industry — EGCH2230 research project

University of Technology and Applied Sciences · EGCH2230 Petroleum and Petrochemical Processing
Prepared by **Shahad Issa Obaid Alghriabi**

## Deliverables

| File | What it is |
|---|---|
| `Kuwait_Oil_and_Gas_Research_Report.docx` | 32-page research report (cover, abstract, contents, 6 chapters, 10 figures, 14 tables, APA 7 references, data-notes appendix) |
| `Kuwait_Oil_and_Gas_Presentation.pptx` | 28-slide 16:9 presentation: dark keynote style, Morph transitions, auto-playing builds, clickable navigation, click-to-reveal map regions, speaker notes on every slide |

Both cover the five required points: (1) history and types of oil and gas, (2) resources and industrial growth,
(3) locations of oil and gas reservoirs, (4) export markets and the cost of oil and gas, (5) references.

## Presenting the deck

- Open in **PowerPoint 2019 / Microsoft 365** (Windows or Mac) for Morph transitions; older versions fall back to fades.
- Slide 2 is a menu: click any chapter tile to jump there. The small grid button at the bottom-right of every slide returns to it.
- Slide 16 (map): click a region pill on the right to show its fields. Pressing → / Space simply moves on.
- Every slide has speaker notes with the full talking points and sources.

## Adding the UTAS logo

The university website and Wikimedia Commons were blocked from the build environment, so the logo position holds a
dashed "UTAS logo" placeholder on the slide layouts and on the report cover. Either:

- **Rebuild:** save the official logo as `build/assets/utas_logo.png` and run `build/build.sh`. The logo is then placed on every slide and on the report cover automatically; or
- **Replace by hand:**
  - **PowerPoint:** View → Slide Master. In each of the five layouts (Title, Section, Content, Gas and Fire), right-click the placeholder → Change Picture.
  - **Word:** on the cover page, right-click the placeholder → Change Picture.

## Rebuilding

`build/build.sh` regenerates everything from the scripts and data in `build/`:

- `data/`: Energy Institute (via Our World in Data), JODI-Oil, EIA Brent and Natural Earth extracts, plus the curated field, market and series files.
- `build_deck.js` / `build_markets.js` / `deck_base.js`: the presentation (pptxgenjs).
- `animate.py`: adds the Morph transitions, entrance builds, click triggers and slide links.
- `build_doc.js` / `doc_lib.js` / `charts_doc.py` / `toc_pages.py`: the report (docx), its figures, and the page-number pass.
