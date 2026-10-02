export const occupationKeywords = {
  farmer:       ["farmer", "agriculture", "agricultural", "crop", "kisan", "horticulture", "fishermen", "aquaculture"],
  student:      ["student", "education", "scholarship", "study", "school", "college", "university"],
  entrepreneur: ["business", "startup", "entrepreneur", "msme", "enterprise", "self-employed"],
  woman:        ["women", "female", "mahila", "girl", "widow", "mothers"],
  senior:       ["elderly", "senior", "pension", "old age", "aged"],
  worker:       ["labour", "worker", "artisan", "craftsmen", "weaver"],
  any:          []
};

export function calculateScore(scheme, user) {
  let score = 0;
  const schemeText = JSON.stringify(scheme).toLowerCase();

  const keywords = occupationKeywords[user.occupation] || occupationKeywords.any;
  keywords.forEach(word => {
    if (schemeText.includes(word)) score += 4;
  });

  if (user.occupation && schemeText.includes(user.occupation)) score += 3;
  if (user.state && user.state !== "any" && schemeText.includes(user.state)) score += 3;
  if (user.gender && schemeText.includes(user.gender)) score += 2;
  if (user.income && scheme.Income_Limit && user.income <= scheme.Income_Limit) score += 2;
  if (user.age) {
    if (user.age >= 60 && schemeText.includes("senior")) score += 2;
    if (user.age <= 30 && schemeText.includes("youth")) score += 2;
    if (user.age <= 18 && schemeText.includes("student")) score += 2;
  }

  return score;
}

export function checkEligibility(scheme, user) {
  const schemeText = JSON.stringify(scheme).toLowerCase();
  const reasons = [];

  const keywords = occupationKeywords[user.occupation] || [];
  const hasOccMatch = keywords.some(k => schemeText.includes(k)) || schemeText.includes(user.occupation);
  if (hasOccMatch) reasons.push(`Matches your occupation (${user.occupation})`);
  if (user.state && user.state !== "any" && schemeText.includes(user.state)) reasons.push(`Available in ${user.state}`);
  if (user.gender && schemeText.includes(user.gender)) reasons.push("Applicable for your gender");
  if (scheme.Income_Limit && user.income <= scheme.Income_Limit) reasons.push("Within income eligibility");

  return { eligible: reasons.length > 0, reasons };
}

export function searchSchemes(schemes, query) {
  const q = query.toLowerCase();
  return schemes.filter(s =>
    (s.scheme_name && s.scheme_name.toLowerCase().includes(q)) ||
    (s.details && s.details.toLowerCase().includes(q)) ||
    (s.benefits && s.benefits.toLowerCase().includes(q)) ||
    (s.tags && JSON.stringify(s.tags).toLowerCase().includes(q))
  );
}

export function formatSchemeForFrontend(s, index) {
  return {
    id: s.slug || `scheme-${index}`,
    name: s.scheme_name || "Government Scheme",
    desc: (s.details || "").substring(0, 160) + "...",
    benefits: s.benefits || s.benefit_types || "Benefits as per scheme guidelines",
    eligibility: s.eligibility || "As per scheme guidelines",
    documents: s.documents ? (Array.isArray(s.documents) ? s.documents : [s.documents]) : ["Aadhaar Card", "Income Certificate"],
    category: (s.tags && s.tags[0]) || "Government",
    tag: s.level || "Central",
    slug: s.slug || "",
    applyUrl: s.application_process_url || null,
    level: s.level || "",
    score: s.score || 0,
    eligibilityResult: s.eligibility_result || null
  };
}
