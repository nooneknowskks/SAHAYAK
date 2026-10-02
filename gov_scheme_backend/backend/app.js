const express = require("express");
const fs = require("fs");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Load schemes dataset
const schemes = JSON.parse(
    fs.readFileSync("./data/schemes.json", "utf8")
);

// ---------------- OCCUPATION KEYWORDS ----------------
const occupationKeywords = {
    farmer: ["farmer", "agriculture", "agricultural", "crop", "kisan"],
    student: ["student", "education", "scholarship", "study"],
    entrepreneur: ["business", "startup", "entrepreneur", "msme"],
    woman: ["women", "female", "mahila"]
};

// ---------------- SCORING FUNCTION ----------------
function calculateScore(scheme, user) {
    let score = 0;
    const schemeText = JSON.stringify(scheme).toLowerCase();

    const keywords = occupationKeywords[user.occupation] || [];
    keywords.forEach((word) => {
        if (schemeText.includes(word)) {
            score += 4;
        }
    });

    if (user.state && schemeText.includes(user.state)) {
        score += 3;
    }

    if (user.gender && schemeText.includes(user.gender)) {
        score += 2;
    }

    return score;
}

// ---------------- ELIGIBILITY FUNCTION ----------------
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

    return {
        eligible: reasons.length > 0,
        reasons
    };
}

// ---------------- EXPLANATION FUNCTION ----------------
function generateExplanation(scheme, user, eligibility) {
    return {
        scheme: scheme.scheme_name,
        details: scheme.details,
        benefits: scheme.benefits,
        eligibility: scheme.eligibility,
        documents: scheme.documents,
        howToApply: scheme.application,
        whyRecommended: eligibility.reasons || []
    };
}

// ---------------- HOME ----------------
app.get("/", (req, res) => {
    res.send("AI Government Scheme Assistant API is running");
});

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
    const { username } = req.body || {};

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (results.length > 0) {
                return res.json({
                    message: "Login successful",
                    user: results[0]
                });
            }

            db.query(
                "INSERT INTO users (username) VALUES (?)",
                [username],
                (err2, insertResult) => {
                    if (err2) {
                        return res.status(500).json({ message: err2.message });
                    }

                    res.json({
                        message: "User created and logged in",
                        user: {
                            id: insertResult.insertId,
                            username
                        }
                    });
                }
            );
        }
    );
});

// ---------------- SAVE PROFILE ----------------
app.post("/api/profile", (req, res) => {
    const { username, occupation, state, income, gender } = req.body || {};

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    db.query(
        "SELECT id FROM users WHERE username = ?",
        [username],
        (err, userResults) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const userId = userResults[0].id;

            db.query(
                "SELECT * FROM user_profiles WHERE user_id = ?",
                [userId],
                (err2, profileResults) => {
                    if (err2) {
                        return res.status(500).json({ message: err2.message });
                    }

                    if (profileResults.length > 0) {
                        db.query(
                            "UPDATE user_profiles SET occupation=?, state=?, income=?, gender=? WHERE user_id=?",
                            [occupation, state, income, gender, userId],
                            (err3) => {
                                if (err3) {
                                    return res.status(500).json({ message: err3.message });
                                }

                                res.json({ message: "Profile updated successfully" });
                            }
                        );
                    } else {
                        db.query(
                            "INSERT INTO user_profiles (user_id, occupation, state, income, gender) VALUES (?, ?, ?, ?, ?)",
                            [userId, occupation, state, income, gender],
                            (err4) => {
                                if (err4) {
                                    return res.status(500).json({ message: err4.message });
                                }

                                res.json({ message: "Profile saved successfully" });
                            }
                        );
                    }
                }
            );
        }
    );
});

// ---------------- GET USER + PROFILE + LATEST RECOMMENDATIONS ----------------
app.get("/api/user/:username", (req, res) => {
    const { username } = req.params;

    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, userResults) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = userResults[0];

            db.query(
                "SELECT occupation, state, income, gender FROM user_profiles WHERE user_id = ?",
                [user.id],
                (err2, profileResults) => {
                    if (err2) {
                        return res.status(500).json({ message: err2.message });
                    }

                    db.query(
                        "SELECT * FROM recommendation_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                        [user.id],
                        (err3, recResults) => {
                            if (err3) {
                                return res.status(500).json({ message: err3.message });
                            }

                            let latestRecommendations = [];

                            if (recResults.length > 0) {
                                latestRecommendations = JSON.parse(recResults[0].recommended_schemes);
                            }

                            res.json({
                                user,
                                profile: profileResults[0] || null,
                                latestRecommendations
                            });
                        }
                    );
                }
            );
        }
    );
});

// ---------------- GET ALL SCHEMES ----------------
app.get("/api/schemes", (req, res) => {
    res.json(schemes);
});

// ---------------- SEARCH SCHEMES ----------------
app.get("/api/search", (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.json({ message: "Provide search query" });
    }

    const results = schemes.filter((scheme) =>
        JSON.stringify(scheme).toLowerCase().includes(query.toLowerCase())
    );

    res.json(results);
});

// ---------------- RECOMMEND SCHEMES + SAVE TO MYSQL ----------------
app.get("/api/recommend", (req, res) => {
    const user = {
        occupation: req.query.occupation?.toLowerCase() || "",
        state: req.query.state?.toLowerCase() || "",
        income: parseInt(req.query.income) || 0,
        gender: req.query.gender?.toLowerCase() || ""
    };

    const username = req.query.username || "";
    const queryText = req.query.query || "";

    const rankedSchemes = schemes.map((scheme) => {
        const score = calculateScore(scheme, user);
        const eligibility = checkEligibility(scheme, user);

        return {
            ...scheme,
            score,
            eligibility
        };
    });

    rankedSchemes.sort((a, b) => b.score - a.score);

    const bestMatches = rankedSchemes.slice(0, 5);
    const recommended = rankedSchemes.slice(5, 20);

    if (!username) {
        return res.json({
            bestMatches,
            recommended,
            allSchemes: rankedSchemes
        });
    }

    db.query(
        "SELECT id FROM users WHERE username = ?",
        [username],
        (err, userResults) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (userResults.length === 0) {
                return res.json({
                    bestMatches,
                    recommended,
                    allSchemes: rankedSchemes
                });
            }

            const userId = userResults[0].id;

            db.query(
                "INSERT INTO recommendation_history (user_id, query_text, recommended_schemes) VALUES (?, ?, ?)",
                [userId, queryText, JSON.stringify(bestMatches)],
                (err2) => {
                    if (err2) {
                        return res.status(500).json({ message: err2.message });
                    }

                    res.json({
                        bestMatches,
                        recommended,
                        allSchemes: rankedSchemes
                    });
                }
            );
        }
    );
});

// ---------------- EXPLAIN SCHEME ----------------
app.get("/api/explain/:schemeName", (req, res) => {
    const schemeName = req.params.schemeName.toLowerCase();

    const user = {
        occupation: req.query.occupation?.toLowerCase() || "",
        state: req.query.state?.toLowerCase() || "",
        income: parseInt(req.query.income) || 0,
        gender: req.query.gender?.toLowerCase() || ""
    };

    const scheme = schemes.find((s) =>
        JSON.stringify(s).toLowerCase().includes(schemeName)
    );

    if (!scheme) {
        return res.json({ message: "Scheme not found" });
    }

    const eligibility = checkEligibility(scheme, user);
    const explanation = generateExplanation(scheme, user, eligibility);

    res.json(explanation);
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});