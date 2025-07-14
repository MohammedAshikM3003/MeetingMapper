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

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const transcriptInput = document.getElementById('transcriptInput');
  const fileInput = document.getElementById('fileInput');
  const extractBtn = document.getElementById('extractBtn');
  const resultsDiv = document.getElementById('results');
  const actionItemsList = document.getElementById('actionItems');
  const summaryP = document.getElementById('summary');

  if (!transcriptInput || !fileInput || !extractBtn || !resultsDiv || !actionItemsList || !summaryP) {
    console.error("Missing required DOM elements.");
    return;
  }

  // Load file content
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      transcriptInput.value = evt.target.result;
      console.log("✅ File loaded into transcript input.");
    };
    reader.onerror = () => {
      console.error("❌ Failed to read file.");
      alert("Error reading file.");
    };
    reader.readAsText(file);
  });

  // Live Extract Button (calls Python backend)
  extractBtn.addEventListener('click', async () => {
    const transcript = transcriptInput.value.trim();
    if (!transcript) {
      alert("Please paste or upload a transcript.");
      return;
    }

    extractBtn.disabled = true;
    extractBtn.textContent = "Extracting...";

    try {
      const response = await fetch('http://127.0.0.1:3000/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      actionItemsList.innerHTML = '';
      resultsDiv.classList.remove('hidden');

      if (data.actionItems && data.actionItems.length > 0) {
        data.actionItems.forEach(item => {
          const li = document.createElement('li');
          const deadlineText = item.deadline && item.deadline !== "N/A" ? ` (by ${item.deadline})` : '';
          li.textContent = `${item.owner}: ${item.task}${deadlineText} – ${item.context}`;
          actionItemsList.appendChild(li);
        });
        summaryP.textContent = data.summary || "No summary returned.";
      } else {
        summaryP.textContent = "No action items found.";
      }

      // Save to Firestore
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
