/**
 * Sahayak AI — API Server
 * Standalone Express server using Gemini + real 3400-scheme dataset (CSV).
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDOx-hqzZYsLUpPt7BN_EdBq8R7OwCZaaU";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// File upload storage
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─────────────────────────────────────────────
// LOAD DATASET (CSV)
// ─────────────────────────────────────────────
let schemes = [];
const csvPath = path.join(__dirname, "gov_scheme_backend", "backend", "data", "schemes_data.csv");

function loadSchemesFromCSV() {
  const results = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      schemes = results;
      console.log(`✅ Loaded ${schemes.length} government schemes from CSV`);
    })
    .on("error", (err) => {
      console.error("❌ Error loading CSV:", err.message);
    });
}

loadSchemesFromCSV();

// ─────────────────────────────────────────────
// IN-MEMORY STORES
// ─────────────────────────────────────────────
const users = new Map();
const sessions = new Map();
const progress = new Map();
const applications = new Map();
const uploadedDocs = new Map();

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatSchemeForFrontend(s, index) {
  // Mapping CSV fields to Frontend expected fields
  // Headers: scheme_name,slug,details,benefits,eligibility,application,documents,level,schemeCategory,tags
  return {
    id: s.slug || `scheme-${index}`,
    name: s.scheme_name || "Government Scheme",
    details: s.details || "",
    benefits: s.benefits || "",
    eligibility: s.eligibility || "",
    documents: s.documents || "",
    application: s.application || "",
    apply_link: s.apply_link || s.application_process_url || "", // Use apply_link or application_process_url
    category: s.schemeCategory || "General",
    tag: s.level || "Central"
  };
}

function searchSchemes(query) {
  const q = query.toLowerCase();
  return schemes.filter(s =>
    (s.scheme_name && s.scheme_name.toLowerCase().includes(q)) ||
    (s.details && s.details.toLowerCase().includes(q)) ||
    (s.benefits && s.benefits.toLowerCase().includes(q))
  );
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

app.get("/", (req, res) => res.json({ status: "Sahayak AI API is running", schemes: schemes.length }));

// ── GET /api/schemes
app.get("/api/schemes", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageSchemes = schemes.slice(start, end).map((s, i) => formatSchemeForFrontend(s, start + i));

  res.json({
    data: pageSchemes,
    total: schemes.length,
    page,
    totalPages: Math.ceil(schemes.length / limit)
  });
});

// ── GET /api/search
app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) return res.json({ data: [] });
  const results = searchSchemes(query).slice(0, 50);
  res.json({ data: results.map((s, i) => formatSchemeForFrontend(s, i)) });
});

// ── GET /api/explain/:slug
app.get("/api/explain/:slug", (req, res) => {
  const slug = req.params.slug;
  const scheme = schemes.find(s => s.slug === slug);
  if (!scheme) return res.status(404).json({ error: "Scheme not found" });
  res.json(formatSchemeForFrontend(scheme, 0));
});

// ── POST /api/chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are Sahayak AI, a helpful government scheme assistant. 
    Help the user with their question: "${message}". 
    Be concise and professional. If you mention schemes, use information from our context if possible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.json({ reply: "AI not available. Try again." });
  }
});

// ── AUTH (Simple)
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  const user = { id: Date.now(), name: email.split('@')[0], email };
  res.json({ success: true, user, token: "demo-token" });
});

app.post("/api/register", (req, res) => {
  const { name, email } = req.body;
  const user = { id: Date.now(), name, email };
  res.json({ success: true, user, token: "demo-token" });
});

// ── UPLOAD
app.post("/api/upload", upload.single("document"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ success: true, message: "Upload success", filename: req.file.filename });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Sahayak AI API Server running at http://localhost:${PORT}`);
  console.log(`📊 Serving ${schemes.length} schemes from CSV`);
});
