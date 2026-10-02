import { Router } from "express";
import { users, sessions, progress, applications, uploadedDocs } from "../state.js";

export function createUserRouter() {
  const r = Router();

  r.post("/api/login", (req, res) => {
    const { name, email, password } = req.body || {};
    const identifier = email || name;

    if (!identifier) return res.status(400).json({ error: "Email/name required" });

    let user = users.get(identifier.toLowerCase());

    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        name: name || identifier.split("@")[0],
        email: identifier,
        createdAt: new Date().toISOString()
      };
      users.set(identifier.toLowerCase(), user);
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessions.set(token, identifier.toLowerCase());

    res.json({ success: true, token, user, message: "Login successful" });
  });

  r.post("/api/register", (req, res) => {
    const { name, email, password, occupation, state, income, gender } = req.body || {};
    const identifier = (email || name || "").toLowerCase();

    if (!identifier || !name) return res.status(400).json({ error: "Name and email required" });

    const user = {
      id: `user_${Date.now()}`,
      name,
      email: identifier,
      occupation: occupation || "",
      state: state || "",
      income: income || 0,
      gender: gender || "",
      createdAt: new Date().toISOString()
    };

    users.set(identifier, user);

    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessions.set(token, identifier);

    res.json({ success: true, token, user, message: "Account created successfully" });
  });

  r.get("/api/progress/:userId", (req, res) => {
    const prog = progress.get(req.params.userId) || {
      profile: false, eligibility: false, documents: false, completed: false
    };
    res.json(prog);
  });

  r.post("/api/progress/:userId", (req, res) => {
    const existing = progress.get(req.params.userId) || {};
    const updated = { ...existing, ...req.body };
    progress.set(req.params.userId, updated);
    res.json({ success: true, progress: updated });
  });

  r.get("/api/docs/:userId", (req, res) => {
    res.json(uploadedDocs.get(req.params.userId) || []);
  });

  r.get("/api/applications/:userId", (req, res) => {
    res.json(applications.get(req.params.userId) || []);
  });

  r.post("/api/applications/:userId", (req, res) => {
    const { schemeId, schemeName, status } = req.body || {};
    if (!applications.has(req.params.userId)) applications.set(req.params.userId, []);

    const app_list = applications.get(req.params.userId);
    const existing = app_list.findIndex(a => a.schemeId === schemeId);

    const record = {
      schemeId,
      schemeName,
      status: status || "In Progress",
      progress: status === "Completed" ? 100 : 50,
      submittedAt: new Date().toISOString()
    };

    if (existing >= 0) {
      app_list[existing] = record;
    } else {
      app_list.push(record);
    }

    applications.set(req.params.userId, app_list);
    res.json({ success: true, application: record });
  });

  return r;
}
