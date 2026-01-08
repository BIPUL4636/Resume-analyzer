async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach(item => {
      text += item.str + " ";
    });
  }
  return text;
}

async function analyzeResume() {
  const pdfFile = document.getElementById("pdfInput").files[0];
  let resumeText = document.getElementById("resumeText").value;
  const role = document.getElementById("role").value;
  const level = document.getElementById("level").value;

  if (pdfFile) {
    resumeText = await extractTextFromPDF(pdfFile);
  }

  if (!resumeText.trim()) {
    alert("Please upload a PDF or paste resume text");
    return;
  }

  const response = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, role, level })
  });

  const data = await response.json();

  document.getElementById("result").style.display = "block";
  document.getElementById("score").innerText =
    `ATS Score (${data.role}): ${data.overall}%`;
  document.getElementById("verdict").innerText =
    `Resume Strength: ${data.verdict}`;

  document.getElementById("matched").innerHTML =
    data.matched.map(s => `<span class="tag good">${s}</span>`).join("");

  document.getElementById("missing").innerHTML =
    data.missing.map(s => `<span class="tag bad">${s}</span>`).join("");

  document.getElementById("suggestions").innerHTML =
    data.suggestions.map(s => `<li>${s}</li>`).join("");
}
