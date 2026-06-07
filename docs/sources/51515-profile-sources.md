# 51515 Profile Sources

The 51515 build PDFs in `PDF_manuals/51515` are mostly image-only. `pypdf` can count pages and extract embedded page images, but it does not extract useful step text from the five main robot manuals.

## Parsed Local Manuals

| Manual | Pages | Text status | Profile |
| --- | ---: | --- | --- |
| `PDF_manuals/51515/51515_Blast.pdf` | 333 | image-only | `examples/profiles/51515/blast.json` |
| `PDF_manuals/51515/51515_Charlie.pdf` | 315 | image-only | `examples/profiles/51515/charlie.json` |
| `PDF_manuals/51515/51515_Gelo.pdf` | 226 | image-only | `examples/profiles/51515/gelo.json` |
| `PDF_manuals/51515/51515_MVP.pdf` | 422 | image-only | `examples/profiles/51515/mvp.json` |
| `PDF_manuals/51515/51515_Tricky.pdf` | 356 | image-only | `examples/profiles/51515/tricky.json` |
| `PDF_manuals/51515/6447738.pdf` | 40 | partial text | manual index only |

Manual metadata is stored in `examples/manuals/51515-manual-index.json`.

## Online Sources Used For Port Maps

Pybricks provides clean, source-level Robot Inventor examples for four of the five main 51515 robots:

- Blast: https://pybricks.com/projects/sets/mindstorms-robot-inventor/main-models/blast/
- Gelo: https://pybricks.com/projects/sets/mindstorms-robot-inventor/main-models/gelo/basic/
- M.V.P.: https://pybricks.com/projects/sets/mindstorms-robot-inventor/main-models/mvp/
- Tricky: https://pybricks.com/projects/sets/mindstorms-robot-inventor/main-models/tricky/

Charlie is not currently covered by the Pybricks main-model pages. Its profile is marked `manual-image-inferred` and `needsConfirmation`.

## Current Port Map Summary

| Robot | Motors | Sensors | Source confidence |
| --- | --- | --- | --- |
| Blast | A right drive, B action, C left drive, D arm lift | E color, F distance | Pybricks |
| Charlie | A/B/E/F inferred motion motors | hub IMU only confirmed | manual image inferred |
| Gelo | A rear right leg, B rear left leg, C front right leg, D front left leg | E distance, F color | Pybricks |
| M.V.P. | A steering, B drive | hub IMU | Pybricks basic buggy |
| Tricky | A/B drive pair, C kicker/attachment | D distance, E color | Pybricks activity variants |

## Parser Notes

The parser path should stay in this order:

1. Use local `PDF_manuals/51515` for page counts and extracted page previews.
2. Use Pybricks for source-level port maps where available.
3. Use manual image inspection for robots not covered by Pybricks.
4. Mark uncertain fields with `confidence` or `needsConfirmation`.

Run the local manual inventory:

```powershell
python -m pip install -r requirements.txt
python scripts\extract-51515-manuals.py
```
