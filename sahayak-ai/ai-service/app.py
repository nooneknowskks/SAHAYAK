"""
Sahayak AI — Python microservice (OCR + optional helpers).
The Node backend POSTs uploaded files here for text extraction.
"""
import os
import re
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sahayak AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _fallback_extract(text: str) -> dict:
    """Lightweight field hints from raw text (when Tesseract is unavailable)."""
    t = text.lower()
    out = {}
    if re.search(r"\d{4}\s?\d{4}\s?\d{4}", text):
        out["documentType"] = "Possible Aadhaar / ID"
    if "income" in t or "salary" in t:
        out["documentType"] = out.get("documentType", "Income-related document")
    if "pan" in t or re.search(r"[A-Z]{5}\d{4}[A-Z]", text):
        out["documentType"] = "Possible PAN"
    return out


@app.get("/")
def root():
    return {"service": "sahayak-ai-service", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    text = ""
    try:
        from PIL import Image
        import pytesseract

        img = Image.open(BytesIO(raw))
        text = pytesseract.image_to_string(img) or ""
    except Exception:
        try:
            text = raw.decode("utf-8", errors="ignore")[:8000]
        except Exception:
            text = ""

    if not text.strip():
        text = "(no text extracted — try a clearer image or install Tesseract for OCR)"

    extracted = _fallback_extract(text)
    return {
        "text": text.strip()[:8000],
        "extractedFields": extracted,
        "filename": file.filename,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
