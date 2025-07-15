// main.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAKVyORQrwhG068ahy0vgD0wdNQxjbXOW4",
  authDomain: "meetingmapper-20b45.firebaseapp.com",
  projectId: "meetingmapper-20b45",
  storageBucket: "meetingmapper-20b45.appspot.com",
  messagingSenderId: "836447630101",
  appId: "1:836447630101:web:751a875e40fdfd5b2eaf1c",
  measurementId: "G-0JD3YVQRQK"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Backend API URL hosted on Render
const API_URL = 'https://meetingmapper.onrender.com/extract-tasks';

document.addEventListener('DOMContentLoaded', () => {
  const transcriptInput = document.getElementById('transcriptInput');
  const fileInput = document.getElementById('fileInput');
  const extractBtn = document.getElementById('extractBtn');
  const resultsDiv = document.getElementById('results');
  const actionItemsList = document.getElementById('actionItems');
  const summaryP = document.getElementById('summary');

  if (!transcriptInput || !fileInput || !extractBtn || !resultsDiv || !actionItemsList || !summaryP) {
    console.error("Missing DOM elements.");
    return;
  }

  // File Upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      transcriptInput.value = evt.target.result;
    };
    reader.onerror = () => {
      alert("Error reading uploaded file.");
    };
    reader.readAsText(file);
  });

  // Extract action items via backend
  extractBtn.addEventListener('click', async () => {
    const transcript = transcriptInput.value.trim();
    if (!transcript) {
      alert("Please paste or upload a transcript first.");
      return;
    }

    extractBtn.disabled = true;
    extractBtn.textContent = "Extracting...";

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorMsg}`);
      }

      const data = await response.json();

      actionItemsList.innerHTML = '';
      resultsDiv.classList.remove('hidden');

      if (data.actionItems && data.actionItems.length > 0) {
        data.actionItems.forEach(item => {
          const li = document.createElement('li');
          const deadline = item.deadline && item.deadline !== "N/A" ? ` (by ${item.deadline})` : '';
          li.textContent = `${item.owner}: ${item.task}${deadline} – ${item.context}`;
          actionItemsList.appendChild(li);
        });
        summaryP.textContent = data.summary || "No summary available.";
      } else {
        summaryP.textContent = "No action items found.";
      }

      await addDoc(collection(db, "meeting_action_items"), {
        transcript: transcript.slice(0, 10000),
        summary: data.summary,
        actionItems: data.actionItems,
        created: new Date().toISOString()
      });

    } catch (err) {
      console.error("❌ Extraction error:", err);
      alert("Failed to extract action items:\n" + err.message);
    } finally {
      extractBtn.disabled = false;
      extractBtn.textContent = "Extract Action Items";
    }
  });
});
