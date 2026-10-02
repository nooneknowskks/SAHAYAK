import { Router } from "express";
import { callGroq } from "../groq.js";
import { searchSchemes, formatSchemeForFrontend } from "../scoring.js";

export function createChatRouter(schemes) {
  const r = Router();

  r.post("/api/chat", async (req, res) => {
    const { message, userProfile, language } = req.body || {};

    if (!message) return res.status(400).json({ error: "Message required" });

    const relevantSchemes = searchSchemes(schemes, message).slice(0, 3);

    let schemeContext = "";
    if (relevantSchemes.length > 0) {
      schemeContext = "\n\nRelevant Government Schemes in our database:\n" +
        relevantSchemes.map((s, i) =>
          `${i + 1}. ${s.scheme_name}: ${(s.details || "").substring(0, 200)}`
        ).join("\n");
    }

    const langInstruction = language === "hi"
      ? "Respond in Hindi."
      : language === "mr"
      ? "Respond in Marathi."
      : "Respond in English.";

    const systemPrompt = `You are Sahayak AI, a helpful government scheme assistant for Indian citizens. ${langInstruction}
Your job is to help citizens find and understand government welfare schemes.
Be concise, friendly, and accurate. If schemes are relevant, mention them by name.
Format your response clearly. Use simple language suitable for all education levels.
${schemeContext}`;

    const userContext = userProfile
      ? `User profile: Age ${userProfile.age || "unknown"}, Income ₹${userProfile.income || "unknown"}, Occupation: ${userProfile.occupation || "unknown"}, State: ${userProfile.state || "unknown"}.\n`
      : "";

    try {
      if (!process.env.GROQ_API_KEY) throw new Error("no groq");
      const aiReply = await callGroq(systemPrompt, `${userContext}User question: ${message}`);
      res.json({
        reply: aiReply,
        relatedSchemes: relevantSchemes.slice(0, 3).map(formatSchemeForFrontend)
      });
    } catch (err) {
      console.error("Groq error:", err.message);
      const fallback = relevantSchemes.length > 0
        ? `I found ${relevantSchemes.length} relevant scheme(s) for "${message}". The top match is: **${relevantSchemes[0].scheme_name}** — ${(relevantSchemes[0].details || "").substring(0, 200)}. Please check eligibility using the Eligibility Check section.`
        : `Thank you for your question about "${message}". Please use the Eligibility Check section to find schemes matching your profile, or search in the Explore section.`;

      res.json({
        reply: fallback,
        relatedSchemes: relevantSchemes.slice(0, 3).map(formatSchemeForFrontend)
      });
    }
  });

  r.post("/api/translate", async (req, res) => {
    const { text, target } = req.body || {};
    if (!text || !target) return res.status(400).json({ error: "text and target language required" });

    const languageMap = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi"
    };
    const targetName = languageMap[target] || target;

    const systemPrompt = `You are Sahayak AI translation engine. Translate the following user text into ${targetName}. Keep meaning and tone and do not add extra non-related content.`;

    try {
      if (!process.env.GROQ_API_KEY) throw new Error("no groq");
      const translation = await callGroq(systemPrompt, `Translate this text:\n${text}`);
      res.json({ translated: translation });
    } catch (err) {
      console.error("Groq translation error:", err.message);
      res.status(500).json({ error: "Translation failed (set GROQ_API_KEY or use offline copy)" });
    }
  });

  return r;
}
