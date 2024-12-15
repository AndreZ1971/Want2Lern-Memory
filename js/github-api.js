async function addScoreToGitHub(scoreData) {
  const repo = "andrez1971/Want2Lern-Memory"; // Dein Repository
  const filePath = "scores.json"; // Pfad zur Datei
  const branch = "main"; // Hauptbranch
  const token = "leer"; // Ersetze mit deinem Token

  const apiUrl = `https://api.github.com/repos/andrez1971/Want2Lern-Memory/contents/scores.json
`;

  // Bestehenden Inhalt abrufen
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const file = await response.json();
  const currentScores = response.ok ? JSON.parse(atob(file.content)) : [];
  currentScores.push(scoreData);

  const newContent = btoa(JSON.stringify(currentScores, null, 2)); // JSON in Base64 kodieren

  // Datei aktualisieren
  const result = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Neuer Spielstand hinzugefügt",
      content: newContent,
      branch: branch,
      sha: file.sha, // SHA des aktuellen Inhalts
    }),
  });

  if (result.ok) {
    alert("Spielstand erfolgreich gespeichert!");
  } else {
    console.error("Fehler beim Speichern des Spielstands:", result.statusText);
  }
}
