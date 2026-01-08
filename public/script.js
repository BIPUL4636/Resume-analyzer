async function analyzeResume() {
  const resumeText = document.getElementById("resumeText").value.trim();
  const pdfFile = document.getElementById("pdfInput").files[0];
  const role = document.getElementById("role").value;

  let response;

  if (pdfFile) {
    const formData = new FormData();
    formData.append("resume", pdfFile);
    formData.append("role", role);

    response = await fetch("/analyze-pdf", {
      method: "POST",
      body: formData
    });
  } else if (resumeText) {
    response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, role })
    });
  } else {
    alert("Upload a PDF or paste resume text.");
    return;
  }

  const data = await response.json();

  document.getElementById("result").style.display = "block";

  document.getElementById("circle").style.background =
    `conic-gradient(#10b981 ${data.overall * 3.6}deg, #e5e7eb 0deg)`;

  document.getElementById("percent").innerText = `${data.overall}%`;

  document.getElementById("confidence").innerText =
    data.overall >= 70 ? "High ATS Compatibility" :
    data.overall >= 40 ? "Medium ATS Compatibility" :
    "Low ATS Compatibility";

  document.getElementById("skillScore").innerText = data.breakdown.skillScore + "%";
  document.getElementById("keywordScore").innerText = data.breakdown.keywordScore + "%";
  document.getElementById("formatScore").innerText = data.breakdown.formatScore + "%";
  document.getElementById("roleScore").innerText = data.breakdown.roleScore + "%";

  document.getElementById("matchedSkills").innerHTML =
    data.matched.map(s => `<span class="skill matched">${s}</span>`).join("");

  document.getElementById("missingSkills").innerHTML =
    data.missing.map(s => `<span class="skill missing">${s}</span>`).join("");

  document.getElementById("suggestions").innerHTML =
    data.suggestions.map(s => `<li>${s}</li>`).join("");
}
