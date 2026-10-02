const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 5000;
const cors = require("cors");
app.use(cors());

// --------------------
// LOAD DATASET
// --------------------
const schemes = JSON.parse(
  fs.readFileSync("./database/schemes.json", "utf8")
);


// --------------------
// OCCUPATION KEYWORDS
// --------------------
const occupationKeywords = {
  farmer: ["farmer", "agriculture", "agricultural", "crop", "kisan"],
  student: ["student", "education", "scholarship", "study"],
  entrepreneur: ["business", "startup", "entrepreneur", "msme"],
  woman: ["women", "female", "mahila"]
};

function extractUserInfo(query) {

  const text = query.toLowerCase();

  let user = {
    occupation: "",
    state: "",
    gender: "",
    income: 0
  };

  // Detect occupation
  Object.keys(occupationKeywords).forEach(occ => {
    occupationKeywords[occ].forEach(keyword => {
      if (text.includes(keyword)) {
        user.occupation = occ;
      }
    });
  });

  // Detect gender
  if (text.includes("women") || text.includes("female") || text.includes("mahila")) {
    user.gender = "female";
  }

  // Detect some states
  const states = [
    "maharashtra",
    "gujarat",
    "rajasthan",
    "bihar",
    "madhya pradesh",
    "uttar pradesh",
    "karnataka",
    "tamil nadu"
  ];

  states.forEach(state => {
    if (text.includes(state)) {
      user.state = state;
    }
  });

  return user;
}
// --------------------
// SCORING FUNCTION
// --------------------
function calculateScore(scheme, user) {

  let score = 0;

  const schemeText = JSON.stringify(scheme).toLowerCase();

  // Occupation keywords
  const keywords = occupationKeywords[user.occupation] || [];

  keywords.forEach(word => {
    if (schemeText.includes(word)) {
      score += 4;
    }
  });

  // State match
  if (user.state && schemeText.includes(user.state)) {
    score += 3;
  }

  // Gender match
  if (user.gender && schemeText.includes(user.gender)) {
    score += 2;
  }

  // Income eligibility
  if (scheme.Income_Limit && user.income <= scheme.Income_Limit) {
    score += 2;
  }

  return score;
}


// --------------------
// ELIGIBILITY FUNCTION
// --------------------
function checkEligibility(scheme, user) {

  const schemeText = JSON.stringify(scheme).toLowerCase();

  let reasons = [];

  if (user.occupation && schemeText.includes(user.occupation)) {
    reasons.push("Matches your occupation");
  }

  if (user.state && schemeText.includes(user.state)) {
    reasons.push("Available in your state");
  }

  if (user.gender && schemeText.includes(user.gender)) {
    reasons.push("Applicable for your gender");
  }

  if (scheme.Income_Limit && user.income <= scheme.Income_Limit) {
    reasons.push("Within income eligibility");
  }

  return {
    eligible: reasons.length > 0,
    reasons
  };
}

function generateExplanation(scheme, user, eligibility) {

  let explanation = {
    scheme: scheme.scheme_name,

    details: scheme.details,

    benefits: scheme.benefits,

    eligibility: scheme.eligibility,

    documents: scheme.documents,

    howToApply: scheme.application,

    whyRecommended: []
  };

  // Recommendation logic
  if (user.occupation && scheme.tags?.includes(user.occupation)) {
    explanation.whyRecommended.push(`Relevant for ${user.occupation}s`);
  }

  if (user.state && scheme.levels?.toLowerCase().includes(user.state)) {
    explanation.whyRecommended.push(`Available in ${user.state}`);
  }

  if (eligibility.reasons && eligibility.reasons.length > 0) {
    explanation.whyRecommended.push(...eligibility.reasons);
  }

  return explanation;
}
// --------------------
// HOME ROUTE
// --------------------
app.get("/", (req, res) => {
  res.send("AI Government Scheme Assistant API is running");
});


// --------------------
// GET ALL SCHEMES
// --------------------
app.get("/api/schemes", (req, res) => {
  res.json(schemes);
});


// --------------------
// SEARCH SCHEMES
// --------------------
app.get("/api/search", (req, res) => {

  const query = req.query.q;

  if (!query) {
    return res.json({ message: "Provide search query" });
  }

  const results = schemes.filter(scheme =>
    JSON.stringify(scheme).toLowerCase().includes(query.toLowerCase())
  );

  res.json(results);

});


// --------------------
// RECOMMEND SCHEMES
// --------------------
app.get("/api/recommend", (req, res) => {

  const user = {
    occupation: req.query.occupation?.toLowerCase() || "",
    state: req.query.state?.toLowerCase() || "",
    income: parseInt(req.query.income) || 0,
    gender: req.query.gender?.toLowerCase() || ""
  };

  const rankedSchemes = schemes.map(scheme => {

    const score = calculateScore(scheme, user);

    const eligibility = checkEligibility(scheme, user);

    return {
      ...scheme,
      score,
      eligibility
    };

  });

  rankedSchemes.sort((a, b) => b.score - a.score);

  res.json({
    bestMatches: rankedSchemes.slice(0, 5),
    recommended: rankedSchemes.slice(5, 20),
    allSchemes: rankedSchemes
  });

});


// --------------------
// NATURAL LANGUAGE ASK
// --------------------
app.get("/api/ask", (req, res) => {

  const query = req.query.q;

  if (!query) {
    return res.json({ message: "Please ask a question" });
  }

  const user = extractUserInfo(query);

  const rankedSchemes = schemes.map(scheme => {

    const score = calculateScore(scheme, user);

    const eligibility = checkEligibility(scheme, user);

    return {
      ...scheme,
      score,
      eligibility
    };

  });

  rankedSchemes.sort((a, b) => b.score - a.score);

  res.json({
    question: query,
    detectedUser: user,
    topSchemes: rankedSchemes.slice(0, 5)
  });

});


// --------------------
// EXPLAIN SCHEME
// --------------------
app.get("/api/explain/:schemeName", (req, res) => {

  const schemeName = req.params.schemeName.toLowerCase();

  const user = {
    occupation: req.query.occupation?.toLowerCase() || "",
    state: req.query.state?.toLowerCase() || "",
    income: parseInt(req.query.income) || 0,
    gender: req.query.gender?.toLowerCase() || ""
  };

  const scheme = schemes.find(s =>
    JSON.stringify(s).toLowerCase().includes(schemeName)
  );

  if (!scheme) {
    return res.json({ message: "Scheme not found" });
  }

  const eligibility = checkEligibility(scheme, user);

  const explanation = generateExplanation(scheme, user, eligibility);

  res.json(explanation);

});


// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});