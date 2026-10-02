import { Router } from "express";
import {
  searchSchemes,
  formatSchemeForFrontend,
  calculateScore,
  checkEligibility
} from "../scoring.js";

export function createSchemesRouter(schemes) {
  const r = Router();

  r.get("/", (req, res) =>
    res.json({ status: "Sahayak AI API is running", version: "2.0", schemes: schemes.length })
  );

  r.get("/api/schemes", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageSchemes = schemes.slice(start, end).map(formatSchemeForFrontend);

    res.json({
      data: pageSchemes,
      total: schemes.length,
      page,
      totalPages: Math.ceil(schemes.length / limit)
    });
  });

  r.get("/api/schemes/featured", (req, res) => {
    const knownPopular = ["pm-kisan", "pmay", "ayushman", "scholarship", "mudra", "standup", "svanidhi", "ujjwala", "beti"];
    const featured = [];

    knownPopular.forEach(keyword => {
      const match = schemes.find(s => s.slug && s.slug.includes(keyword));
      if (match && featured.length < 12) featured.push(match);
    });

    let i = 0;
    while (featured.length < 12 && i < schemes.length) {
      if (!featured.includes(schemes[i])) featured.push(schemes[i]);
      i++;
    }

    res.json(featured.slice(0, 12).map(formatSchemeForFrontend));
  });

  r.get("/api/search", (req, res) => {
    const query = (req.query.q || "").trim();
    const limit = parseInt(req.query.limit) || 20;

    if (!query) return res.json({ data: [], message: "Provide search query" });

    const results = searchSchemes(schemes, query).slice(0, limit);
    res.json({ data: results.map(formatSchemeForFrontend), total: results.length, query });
  });

  r.post("/api/recommend", (req, res) => {
    const { age, income, occupation, state, gender } = req.body || {};

    const user = {
      age: parseInt(age) || 0,
      income: parseInt(income) || 0,
      occupation: (occupation || "any").toLowerCase(),
      state: (state || "any").toLowerCase(),
      gender: (gender || "").toLowerCase()
    };

    const ranked = schemes.map((s, i) => {
      const score = calculateScore(s, user);
      const eligible = checkEligibility(s, user);
      return { ...s, score, eligibility_result: eligible };
    });

    ranked.sort((a, b) => b.score - a.score);

    const bestMatches = ranked.filter(s => s.score > 0).slice(0, 10);
    const others = ranked.filter(s => s.score === 0).slice(0, 10);
    const display = bestMatches.length > 0 ? bestMatches : others;

    res.json({
      bestMatches: display.map(formatSchemeForFrontend),
      totalFound: bestMatches.length,
      userProfile: user
    });
  });

  r.get("/api/explain/:slug", (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const scheme = schemes.find(s => s.slug && s.slug.toLowerCase() === slug)
      || schemes.find(s => JSON.stringify(s).toLowerCase().includes(slug));

    if (!scheme) return res.status(404).json({ error: "Scheme not found" });

    const formatted = formatSchemeForFrontend(scheme, 0);
    res.json({
      ...formatted,
      fullDetails: scheme.details,
      applicationProcess: scheme.application_process,
      applicationUrl: scheme.application_process_url,
      tags: scheme.tags
    });
  });

  return r;
}
