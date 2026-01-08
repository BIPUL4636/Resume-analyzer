const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ===== pdf-parse (STABLE VERSION 1.1.1) ===== */
const pdfParse = require("pdf-parse");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

/* ===== Uploads Folder ===== */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

/* ===== Job Skills ===== */
const jobSkills = {
  "Web Developer": ["html", "css", "javascript", "react", "git"],
  "Java Developer": ["java", "oop", "spring", "sql", "jdbc"],
  "Backend Developer": ["node", "express", "api", "mongodb", "sql"]
};

/* ===== PDF ANALYSIS ===== */
app.post("/analyze-pdf", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const role = req.body.role;
    const skills = jobSkills[role];
    if (!skills) {
      return res.status(400).json({ error: "Invalid job role" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);

    fs.unlinkSync(req.file.path);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Unable to extract text from PDF" });
    }

    analyzeResume(pdfData.text, skills, res);
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

/* ===== TEXT ANALYSIS ===== */
app.post("/analyze", (req, res) => {
  const { resumeText, role } = req.body;

  if (!resumeText || !role) {
    return res
      .status(400)
      .json({ error: "Resume text and role are required" });
  }

  const skills = jobSkills[role];
  if (!skills) {
    return res.status(400).json({ error: "Invalid job role" });
  }

  analyzeResume(resumeText, skills, res);
});

/* ===== CORE ANALYSIS ===== */
function analyzeResume(text, skills, res) {
  const content = text.toLowerCase();

  const matched = skills.filter(skill => content.includes(skill));
  const missing = skills.filter(skill => !content.includes(skill));

  const skillScore = Math.round((matched.length / skills.length) * 100);
  const keywordScore = Math.min(
    100,
    Math.round(content.split(/\s+/).length / 20)
  );
  const formatScore = text.length > 500 ? 80 : 50;
  const roleScore = skillScore >= 60 ? 85 : 55;

  const overall = Math.round(
    (skillScore + keywordScore + formatScore + roleScore) / 4
  );

  res.json({
    overall,
    matched,
    missing,
    breakdown: {
      skillScore,
      keywordScore,
      formatScore,
      roleScore
    },
    suggestions: [
      missing.length
        ? `Add missing skills: ${missing.join(", ")}`
        : "Skills match is strong",
      formatScore < 70
        ? "Resume content is too short"
        : "Resume length is acceptable",
      "Use role-specific keywords to improve ATS ranking"
    ]
  });
}

/* ===== SERVER ===== */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
