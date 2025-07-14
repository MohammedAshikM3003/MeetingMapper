// main.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKVyORQrwhG068ahy0vgD0wdNQxjbXOW4",
    authDomain: "meetingmapper-20b45.firebaseapp.com",
    projectId: "meetingmapper-20b45",
    storageBucket: "meetingmapper-20b45.appspot.com",
    messagingSenderId: "836447630101",
    appId: "1:836447630101:web:751a875e40fdfd5b2eaf1c",
    measurementId: "G-0JD3YVQRQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    const transcriptInput = document.getElementById('transcriptInput');
    const fileInput = document.getElementById('fileInput');
    const extractBtn = document.getElementById('extractBtn');
    const resultsDiv = document.getElementById('results');
    const actionItemsList = document.getElementById('actionItems');
    const summaryP = document.getElementById('summary');

    if (!transcriptInput || !fileInput || !extractBtn || !resultsDiv || !actionItemsList || !summaryP) {
        console.error("One or more required elements not found in DOM.");
        return;
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                transcriptInput.value = evt.target.result;
            };
            reader.onerror = () => {
                alert('Error reading the uploaded file.');
            };
            reader.readAsText(file);
        }
    });

    extractBtn.addEventListener('click', async () => {
        const transcript = transcriptInput.value.trim();
        if (!transcript) {
            alert("Please paste or upload a transcript first.");
            return;
        }

        extractBtn.disabled = true;
        extractBtn.textContent = "Extracting...";

        try {
            const response = await fetch('http://localhost:3000/extract-tasks', {
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
                for (const item of data.actionItems) {
                    const li = document.createElement('li');
                    const deadlineText = item.deadline && item.deadline !== "N/A" ? ` (by ${item.deadline})` : '';
                    li.textContent = `${item.owner}: ${item.task}${deadlineText} - ${item.context}`;
                    actionItemsList.appendChild(li);
                }
                summaryP.textContent = data.summary || 'No summary available.';
            } else {
                summaryP.textContent = "No action items found.";
            }

            await addDoc(collection(db, "meeting_action_items"), {
                transcript: transcript.slice(0, 10000),
                actionItems: data.actionItems,
                summary: data.summary,
                created: new Date().toISOString()
            });

        } catch (error) {
            console.error("Extraction error:", error);
            alert("Failed to extract action items. Is the backend running?\n\n" + error.message);
        } finally {
            extractBtn.disabled = false;
            extractBtn.textContent = "Extract Action Items";
        }
    });
});