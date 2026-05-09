from pathlib import Path
import json

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
MANUAL_DIR = ROOT / "PDF_manuals" / "51515"
OUT = ROOT / "examples" / "manuals" / "51515-manual-index.generated.json"


def text_status(reader):
    sample = []
    for page in reader.pages[: min(5, len(reader.pages))]:
        text = (page.extract_text() or "").strip()
        if text:
            sample.append(text)
    return "partial-text" if sample else "image-only"


def main():
    manuals = []
    for pdf in sorted(MANUAL_DIR.glob("*.pdf")):
        reader = PdfReader(str(pdf))
        manuals.append(
            {
                "name": pdf.stem,
                "file": str(pdf.relative_to(ROOT)).replace("\\", "/"),
                "pages": len(reader.pages),
                "textExtraction": text_status(reader),
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "kit": "LEGO MINDSTORMS Robot Inventor 51515",
                "manualRoot": "PDF_manuals/51515",
                "manuals": manuals,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
