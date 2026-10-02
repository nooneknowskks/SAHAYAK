import React, { useState } from "react";
import "./App.css";

function App() {
    const [username, setUsername] = useState("");
    const [occupation, setOccupation] = useState("");
    const [stateName, setStateName] = useState("");
    const [income, setIncome] = useState("");
    const [gender, setGender] = useState("");

    const [profile, setProfile] = useState(null);
    const [previousRecommendations, setPreviousRecommendations] = useState([]);
    const [bestMatches, setBestMatches] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" | "error"

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const handleLogin = async () => {
        try {
            const loginRes = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
            const loginData = await loginRes.json();
            showMessage(loginData.message || "Login done", "success");

            const userRes = await fetch(`http://localhost:5000/api/user/${username}`);
            const userData = await userRes.json();

            if (userData.profile) {
                setProfile(userData.profile);
                setOccupation(userData.profile.occupation || "");
                setStateName(userData.profile.state || "");
                setIncome(userData.profile.income || "");
                setGender(userData.profile.gender || "");
            } else {
                setProfile(null);
                setOccupation("");
                setStateName("");
                setIncome("");
                setGender("");
            }

            setPreviousRecommendations(userData.latestRecommendations || []);
        } catch (error) {
            showMessage("Login failed — is the backend running?", "error");
            console.error(error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    occupation,
                    state: stateName,
                    income: Number(income),
                    gender
                })
            });
            const data = await res.json();
            showMessage(data.message || "Profile saved", "success");
        } catch (error) {
            showMessage("Profile save failed", "error");
            console.error(error);
        }
    };

    const handleRecommend = async () => {
        try {
            const url = `http://localhost:5000/api/recommend?username=${encodeURIComponent(
                username
            )}&occupation=${encodeURIComponent(occupation)}&state=${encodeURIComponent(
                stateName
            )}&income=${encodeURIComponent(income)}&gender=${encodeURIComponent(
                gender
            )}&query=${encodeURIComponent("basic frontend test query")}`;

            const res = await fetch(url);
            const data = await res.json();
            setBestMatches(data.bestMatches || []);
            setSelectedScheme(null);
            showMessage("Recommendations fetched successfully", "success");
        } catch (error) {
            showMessage("Recommendation failed", "error");
            console.error(error);
        }
    };

    const handleExplain = async (schemeName) => {
        try {
            const url = `http://localhost:5000/api/explain/${encodeURIComponent(
                schemeName
            )}?occupation=${encodeURIComponent(
                occupation
            )}&state=${encodeURIComponent(stateName)}&gender=${encodeURIComponent(gender)}`;

            const res = await fetch(url);
            const data = await res.json();
            setSelectedScheme(data);
        } catch (error) {
            showMessage("Explain API failed", "error");
            console.error(error);
        }
    };

    return (
        <div className="app-container">
            {/* ---- HEADER ---- */}
            <header className="app-header">
                <div className="header-inner">
                    <div className="header-icon">🏛️</div>
                    <div>
                        <h1>AI Government Scheme Assistant</h1>
                        <p className="header-sub">Find schemes you're eligible for — in seconds</p>
                    </div>
                </div>
            </header>

            <main className="main-content">

                {/* ---- STATUS BANNER ---- */}
                {message && (
                    <div className={`status-banner ${messageType}`}>
                        {messageType === "success" ? "✅" : "❌"} {message}
                    </div>
                )}

                <div className="grid-layout">

                    {/* ---- LEFT PANEL ---- */}
                    <div className="left-panel">

                        {/* LOGIN */}
                        <div className="card">
                            <h2 className="card-title">👤 Login</h2>
                            <div className="input-row">
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                />
                                <button className="btn btn-primary" onClick={handleLogin}>
                                    Login
                                </button>
                            </div>
                            {profile && (
                                <p className="profile-badge">✔ Profile loaded for <strong>{username}</strong></p>
                            )}
                        </div>

                        {/* PROFILE */}
                        <div className="card">
                            <h2 className="card-title">📋 Profile</h2>
                            <div className="input-grid">
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Occupation (e.g. farmer)"
                                    value={occupation}
                                    onChange={(e) => setOccupation(e.target.value)}
                                />
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="State (e.g. Maharashtra)"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                />
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="Annual Income (₹)"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                />
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Gender (male / female)"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-secondary full-width" onClick={handleSaveProfile}>
                                💾 Save Profile
                            </button>
                        </div>

                        {/* FIND SCHEMES */}
                        <div className="card">
                            <h2 className="card-title">🔍 Find Schemes</h2>
                            <p className="card-desc">Click below to get scheme recommendations based on your profile.</p>
                            <button className="btn btn-accent full-width" onClick={handleRecommend}>
                                🚀 Find Schemes
                            </button>
                        </div>

                        {/* PREVIOUS RECOMMENDATIONS */}
                        {previousRecommendations.length > 0 && (
                            <div className="card">
                                <h2 className="card-title">🕒 Previous Recommendations</h2>
                                {previousRecommendations.map((scheme, index) => (
                                    <div key={index} className="scheme-item">
                                        <span className="scheme-name">{scheme.scheme_name}</span>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleExplain(scheme.scheme_name)}
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ---- RIGHT PANEL ---- */}
                    <div className="right-panel">

                        {/* BEST MATCHES */}
                        <div className="card">
                            <h2 className="card-title">⭐ Best Matches</h2>
                            {bestMatches.length === 0 ? (
                                <div className="empty-state">
                                    <span>🔎</span>
                                    <p>Enter your profile details and click <strong>Find Schemes</strong> to see results.</p>
                                </div>
                            ) : (
                                <div className="schemes-list">
                                    {bestMatches.map((scheme, index) => (
                                        <div
                                            key={index}
                                            className={`scheme-card ${selectedScheme?.scheme === scheme.scheme_name ? "selected" : ""}`}
                                        >
                                            <div className="scheme-card-header">
                                                <div>
                                                    <h4 className="scheme-card-title">{scheme.scheme_name}</h4>
                                                    <span className="score-badge">Score: {scheme.score}</span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleExplain(scheme.scheme_name)}
                                                >
                                                    Details →
                                                </button>
                                            </div>
                                            {scheme.eligibility?.reasons?.length > 0 && (
                                                <div className="reasons-list">
                                                    {scheme.eligibility.reasons.map((r, i) => (
                                                        <span key={i} className="reason-tag">{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SCHEME DETAILS */}
                        {selectedScheme && (
                            <div className="card detail-card">
                                <h2 className="card-title">📄 Scheme Details</h2>
                                <h3 className="detail-scheme-name">{selectedScheme.scheme}</h3>
                                <div className="detail-grid">
                                    {selectedScheme.details && (
                                        <div className="detail-item">
                                            <span className="detail-label">About</span>
                                            <p>{selectedScheme.details}</p>
                                        </div>
                                    )}
                                    {selectedScheme.benefits && (
                                        <div className="detail-item">
                                            <span className="detail-label">Benefits</span>
                                            <p>{selectedScheme.benefits}</p>
                                        </div>
                                    )}
                                    {selectedScheme.eligibility && (
                                        <div className="detail-item">
                                            <span className="detail-label">Eligibility</span>
                                            <p>{selectedScheme.eligibility}</p>
                                        </div>
                                    )}
                                    {selectedScheme.documents && (
                                        <div className="detail-item">
                                            <span className="detail-label">Documents Required</span>
                                            <p>{selectedScheme.documents}</p>
                                        </div>
                                    )}
                                    {selectedScheme.howToApply && (
                                        <div className="detail-item">
                                            <span className="detail-label">How to Apply</span>
                                            <p>{selectedScheme.howToApply}</p>
                                        </div>
                                    )}
                                    {selectedScheme.whyRecommended?.length > 0 && (
                                        <div className="detail-item">
                                            <span className="detail-label">Why Recommended</span>
                                            <div className="reasons-list">
                                                {selectedScheme.whyRecommended.map((r, i) => (
                                                    <span key={i} className="reason-tag">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setSelectedScheme(null)}
                                    style={{ marginTop: "12px" }}
                                >
                                    ✕ Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;