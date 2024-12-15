// Datei: js/github-api.js
// https://api.github.com/repos/andrez1971/Want2Lern-Memory/contents/scores.json

const GITHUB_API_BASE_URL = "https://api.github.com";
const REPO = "AndreZ1971/Want2Lern-Memory";
const SCORES_FILE_PATH = "scores.json";

export async function saveGameScore(username, scoreData) {
    const url = `${GITHUB_API_BASE_URL}/repos/${REPO}/contents/${SCORES_FILE_PATH}`;
    
    const payload = {
        message: `Add score for user: ${username}`,
        content: btoa(JSON.stringify(scoreData)), // Konvertiert Daten in Base64
    };

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`, // Token wird aus Umgebungsvariablen gezogen
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to save score: ${response.statusText}`);
    }

    return response.json();
}

export async function fetchGameScores() {
    const url = `${GITHUB_API_BASE_URL}/repos/${REPO}/contents/${SCORES_FILE_PATH}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch scores: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(atob(data.content));
}
