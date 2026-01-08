const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));

const roleSkills = {
  "Software Engineer": ["java", "dsa", "oop", "sql", "git"],
  "Web Developer": ["html", "css", "javascript", "react", "node"],
  "Backend Developer": ["node", "express", "api", "mongodb", "sql"],
  "Data Scientist": ["python", "pandas", "numpy", "machine learning"],
  "AI/ML Engineer": ["python", "machine learning", "tensorflow", "deep learning"],
  "Cyber Security": ["network security", "cryptography", "linux", "firewall"],
  "Cloud Engineer": ["aws", "docker", "kubernetes"],
  "DevOps Engineer": ["docker", "jenkins", "kubernetes", "linux"]
};

app.post("/analyze", (req, res) => {
  const { resumeText, role, level } = req.body;

  if (!resumeText || !role || !level) {
    return res.status(400).json({ error: "Missing input data" });
  }

  const skills = roleSkills[role];
  analyzeResume(resumeText, skills, level, role, res);
});

function analyzeResume(text, skills, level, role, res) {
  const content = text.toLowerCase();

  const matched = skills.filter(s => content.includes(s));
  const missing = skills.filter(s => !content.includes(s));

  const sections = {
    education: /education|b\.tech|degree|bachelor/.test(content),
    skills: /skills|technologies/.test(content),
    projects: /project|github/.test(content),
    experience: /experience|intern|company/.test(content),
    certifications: /certification|certificate/.test(content)
  };

  let skillWeight = 1;
  let experienceWeight = 1;

  if (level === "fresher") {
    skillWeight = 1.5;
    experienceWeight = 0.5;
  } else if (level === "senior") {
    experienceWeight = 2;
  }

  const skillScore =
    Math.round((matched.length / skills.length) * 100 * skillWeight);

  const experienceScore = sections.experience
    ? 80 * experienceWeight
    : 40;

  const sectionScore =
    Object.values(sections).filter(Boolean).length * 8;

  const overall = Math.min(
    100,
    Math.round((skillScore + experienceScore + sectionScore) / 3)
  );

  let verdict = "Weak";
  if (overall >= 80) verdict = "Excellent";
  else if (overall >= 65) verdict = "Strong";
  else if (overall >= 45) verdict = "Average";

  res.json({
    role,
    overall,
    verdict,
    matched,
    missing,
    suggestions: [
      !sections.projects && level === "fresher"
        ? "Add academic or personal projects"
        : null,
      !sections.experience && level !== "fresher"
        ? "Add internships or work experience"
        : null,
      missing.length
        ? `Add role-specific skills: ${missing.join(", ")}`
        : "Skill alignment is strong"
    ].filter(Boolean)
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
