const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "exam.sid",
  secret: process.env.SESSION_SECRET || "local-development-secret-change-before-deploy",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 4 }
}));
app.use(express.static(path.join(__dirname, "public")));

function readDb() {
  if (!fs.existsSync(DATA_FILE)) return { users: [], exams: [], attempts: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
function safeUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Please log in first." });
  const db = readDb();
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) { req.session.destroy(() => {}); return res.status(401).json({ error: "Session expired. Please log in again." }); }
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
}
function cleanExam(exam, includeAnswers = false) {
  const result = { id: exam.id, title: exam.title, description: exam.description, durationMinutes: exam.durationMinutes,
    questions: exam.questions.map(q => includeAnswers ? q : ({ id: q.id, text: q.text, options: q.options })) };
  return result;
}
function seed() {
  if (fs.existsSync(DATA_FILE)) return;
  const adminHash = bcrypt.hashSync("Admin@123", 10);
  const studentHash = bcrypt.hashSync("Student@123", 10);
  const exam = {
    id: "exam_cloud_basics", title: "Cloud Computing Fundamentals",
    description: "A short practice exam on cloud concepts, service models, and deployment.",
    durationMinutes: 10, createdAt: new Date().toISOString(),
    questions: [
      { id: "q1", text: "Which of the following is an example of cloud computing?", options: ["Saving a file only on a USB drive", "Using a web-based storage service", "Printing a document", "Turning off a computer"], correctIndex: 1, points: 1 },
      { id: "q2", text: "What does IaaS stand for?", options: ["Internet as an App Service", "Infrastructure as a Service", "Integration as a Software", "Information and Security"], correctIndex: 1, points: 1 },
      { id: "q3", text: "Which cloud model is dedicated to one organization?", options: ["Public cloud", "Community Wi-Fi", "Private cloud", "Hybrid browser"], correctIndex: 2, points: 1 },
      { id: "q4", text: "What is a key benefit of cloud elasticity?", options: ["Resources can scale with demand", "Internet is never needed", "All data becomes public", "Hardware never fails"], correctIndex: 0, points: 1 },
      { id: "q5", text: "Which service model commonly provides a managed runtime for deploying applications?", options: ["PaaS", "LAN", "BIOS", "USB"], correctIndex: 0, points: 1 },
      { id: "q6", text: "Why should secrets not be committed to GitHub?", options: ["They slow down CSS", "They can expose accounts and services", "GitHub cannot store text", "They change HTML tags"], correctIndex: 1, points: 1 },
      { id: "q7", text: "What does high availability aim to improve?", options: ["Application uptime", "Font size", "Keyboard layout", "File naming"], correctIndex: 0, points: 1 },
      { id: "q8", text: "Which protocol is normally used to secure web traffic?", options: ["FTP only", "HTTP without encryption", "HTTPS", "SMTP only"], correctIndex: 2, points: 1 },
      { id: "q9", text: "What is a database backup used for?", options: ["Changing a password automatically", "Recovering data after loss", "Increasing screen brightness", "Removing all logs"], correctIndex: 1, points: 1 },
      { id: "q10", text: "Which is a good access-control practice?", options: ["Share one admin password with everyone", "Use least privilege", "Publish credentials in README", "Disable authentication"], correctIndex: 1, points: 1 }
    ]
  };
  writeDb({
    users: [
      { id: "user_admin", name: "System Admin", email: "admin@example.com", passwordHash: adminHash, role: "admin", createdAt: new Date().toISOString() },
      { id: "user_student", name: "Demo Student", email: "student@example.com", passwordHash: studentHash, role: "student", createdAt: new Date().toISOString() }
    ],
    exams: [exam],
    attempts: []
  });
}
seed();

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "Cloud-Based Online Examination System" }));
app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = readDb().users.find(u => u.id === req.session.userId);
  res.json({ user: user ? safeUser(user) : null });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: "Name must be 2–60 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 8 || password.length > 72) return res.status(400).json({ error: "Password must be 8–72 characters." });
  const db = readDb();
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: "An account with this email already exists." });
  const user = { id: id("user"), name, email, passwordHash: await bcrypt.hash(password, 10), role: "student", createdAt: new Date().toISOString() };
  db.users.push(user); writeDb(db);
  req.session.userId = user.id;
  res.status(201).json({ user: safeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = readDb().users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Email or password is incorrect." });
  req.session.userId = user.id;
  res.json({ user: safeUser(user) });
});
app.post("/api/auth/logout", (req, res) => req.session.destroy(() => res.json({ ok: true })));

app.get("/api/exams", requireAuth, (req, res) => {
  const db = readDb();
  const exams = db.exams.map(e => ({
    ...cleanExam(e),
    questionCount: e.questions.length,
    attempted: db.attempts.some(a => a.examId === e.id && a.userId === req.user.id)
  }));
  res.json({ exams });
});
app.get("/api/exams/:id", requireAuth, (req, res) => {
  const exam = readDb().exams.find(e => e.id === req.params.id);
  if (!exam) return res.status(404).json({ error: "Exam not found." });
  if (req.user.role === "admin") return res.json({ exam: cleanExam(exam, true) });
  const db = readDb();
  if (db.attempts.some(a => a.examId === exam.id && a.userId === req.user.id)) return res.status(409).json({ error: "You have already submitted this exam." });
  res.json({ exam: cleanExam(exam) });
});
app.post("/api/exams/:id/submit", requireAuth, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Only student accounts can submit exams." });
  const db = readDb();
  const exam = db.exams.find(e => e.id === req.params.id);
  if (!exam) return res.status(404).json({ error: "Exam not found." });
  if (db.attempts.some(a => a.examId === exam.id && a.userId === req.user.id)) return res.status(409).json({ error: "This exam has already been submitted." });
  const answers = req.body.answers && typeof req.body.answers === "object" ? req.body.answers : {};
  let score = 0;
  const review = exam.questions.map(q => {
    const selected = Number.isInteger(answers[q.id]) ? answers[q.id] : null;
    const correct = selected === q.correctIndex;
    if (correct) score += q.points;
    return { questionId: q.id, selectedIndex: selected, correctIndex: q.correctIndex, correct };
  });
  const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0);
  const attempt = { id: id("attempt"), examId: exam.id, userId: req.user.id, score, maxScore, percentage: maxScore ? Math.round(score / maxScore * 100) : 0, submittedAt: new Date().toISOString(), review };
  db.attempts.push(attempt); writeDb(db);
  res.status(201).json({ result: { ...attempt, examTitle: exam.title } });
});
app.get("/api/results", requireAuth, (req, res) => {
  const db = readDb();
  const attempts = db.attempts.filter(a => req.user.role === "admin" || a.userId === req.user.id)
    .map(a => ({ ...a, examTitle: db.exams.find(e => e.id === a.examId)?.title || "Deleted exam", studentName: db.users.find(u => u.id === a.userId)?.name || "Unknown student", studentEmail: db.users.find(u => u.id === a.userId)?.email || "" }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json({ results: attempts });
});

app.post("/api/admin/exams", requireAuth, requireAdmin, (req, res) => {
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const durationMinutes = Number(req.body.durationMinutes);
  const rawQuestions = req.body.questions;
  if (title.length < 3 || title.length > 100) return res.status(400).json({ error: "Title must be 3–100 characters." });
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 180) return res.status(400).json({ error: "Duration must be between 1 and 180 minutes." });
  if (!Array.isArray(rawQuestions) || rawQuestions.length < 1 || rawQuestions.length > 100) return res.status(400).json({ error: "Add between 1 and 100 questions." });
  const questions = [];
  for (const [i, q] of rawQuestions.entries()) {
    const text = String(q.text || "").trim();
    const options = Array.isArray(q.options) ? q.options.map(o => String(o || "").trim()) : [];
    const correctIndex = Number(q.correctIndex);
    if (text.length < 5 || options.length !== 4 || options.some(o => !o) || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      return res.status(400).json({ error: `Question ${i + 1}: enter question text, four options and a correct option.` });
    }
    questions.push({ id: id("q"), text, options, correctIndex, points: 1 });
  }
  const db = readDb();
  const exam = { id: id("exam"), title, description, durationMinutes, questions, createdAt: new Date().toISOString() };
  db.exams.push(exam); writeDb(db);
  res.status(201).json({ exam: cleanExam(exam) });
});

app.delete("/api/admin/exams/:id", requireAuth, requireAdmin, (req, res) => {
  const db = readDb();
  if (db.attempts.some(a => a.examId === req.params.id)) return res.status(409).json({ error: "This exam has attempts, so it cannot be deleted." });
  const before = db.exams.length;
  db.exams = db.exams.filter(e => e.id !== req.params.id);
  if (db.exams.length === before) return res.status(404).json({ error: "Exam not found." });
  writeDb(db);
  res.json({ ok: true });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Exam system running at http://localhost:${PORT}`));
