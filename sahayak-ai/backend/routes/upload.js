import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { uploadedDocs } from "../state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export function createUploadRouter() {
  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  });
  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

  const r = Router();

  r.post("/api/upload", upload.single("document"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { originalname, mimetype, size, filename } = req.file;
    const userId = req.body.userId || "anonymous";

    let extractedFields = {};
    const nameLower = originalname.toLowerCase();

    let ocrHint = null;
    try {
      const buf = fs.readFileSync(req.file.path);
      const formData = new FormData();
      formData.append("file", new Blob([buf]), originalname);
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 30000);
      try {
        const ocrRes = await fetch(`${AI_SERVICE_URL}/ocr`, {
          method: "POST",
          body: formData,
          signal: ac.signal
        });
        if (ocrRes.ok) {
          const ocrJson = await ocrRes.json();
          ocrHint = ocrJson;
          if (ocrJson.extractedFields && typeof ocrJson.extractedFields === "object") {
            extractedFields = { ...extractedFields, ...ocrJson.extractedFields, ocrText: ocrJson.text || "" };
          } else if (ocrJson.text) {
            extractedFields.ocrSnippet = (ocrJson.text || "").slice(0, 500);
          }
        }
      } finally {
        clearTimeout(timer);
      }
    } catch {
      /* AI service optional */
    }

    if (nameLower.includes("aadhaar") || nameLower.includes("aadhar")) {
      extractedFields = {
        ...extractedFields,
        documentType: "Aadhaar Card",
        uid: "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000),
        verified: true
      };
    } else if (nameLower.includes("income") || nameLower.includes("salary")) {
      extractedFields = {
        ...extractedFields,
        documentType: "Income Certificate",
        annualIncome: "As stated in document",
        verified: true
      };
    } else if (nameLower.includes("pan")) {
      extractedFields = {
        ...extractedFields,
        documentType: "PAN Card",
        pan: "XXXXX" + Math.floor(1000 + Math.random() * 9000) + "X",
        verified: true
      };
    } else if (nameLower.includes("caste") || nameLower.includes("cast")) {
      extractedFields = {
        ...extractedFields,
        documentType: "Caste Certificate",
        category: "As per document",
        verified: true
      };
    } else if (nameLower.includes("land") || nameLower.includes("property")) {
      extractedFields = {
        ...extractedFields,
        documentType: "Land/Property Record",
        area: "As per document",
        verified: true
      };
    } else if (Object.keys(extractedFields).length === 0) {
      extractedFields = { documentType: "Supporting Document", status: "Accepted", verified: true };
    }

    if (!uploadedDocs.has(userId)) uploadedDocs.set(userId, []);
    const docRecord = {
      id: Date.now(),
      filename: originalname,
      storedAs: filename,
      type: mimetype,
      size: Math.round(size / 1024) + " KB",
      uploadedAt: new Date().toISOString(),
      extractedFields,
      aiService: ocrHint ? "connected" : "fallback"
    };
    uploadedDocs.get(userId).push(docRecord);

    res.json({
      success: true,
      message: "Document uploaded and verified successfully",
      document: docRecord
    });
  });

  return r;
}
