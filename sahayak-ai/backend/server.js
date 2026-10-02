/**
 * Sahayak AI — Node.js API
 * Serves the React/HTML client, Groq chat (optional), and optional Python OCR service.
 */
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { loadSchemes, getSchemesPath } from "./data.js";
import { createSchemesRouter } from "./routes/schemes.js";
import { createChatRouter } from "./routes/chat.js";
import { createUploadRouter } from "./routes/upload.js";
import { createUserRouter } from "./routes/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from monorepo root (sahayak-ai/.env)
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

let schemes = [];
try {
  schemes = loadSchemes();
  console.log(`✅ Loaded ${schemes.length} schemes from ${getSchemesPath()}`);
} catch (e) {
  console.error("❌ Could not load schemes:", e.message);
}

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(createSchemesRouter(schemes));
app.use(createChatRouter(schemes));
app.use(createUploadRouter());
app.use(createUserRouter());

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Sahayak AI backend http://localhost:${PORT}`);
  console.log(`   OCR service: ${process.env.AI_SERVICE_URL || "http://127.0.0.1:8000"} (optional)`);
  console.log(`   Groq chat: ${process.env.GROQ_API_KEY ? "enabled" : "disabled (fallback replies)"}\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} in use. Set PORT in .env to another value.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
