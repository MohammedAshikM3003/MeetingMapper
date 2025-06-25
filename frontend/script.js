// Firebase App (the core Firebase SDK) is always required and must be listed first
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKVyORQrwhG068ahy0vgD0wdNQxjbXOW4",
  authDomain: "meetingmapper-20b45.firebaseapp.com",
  projectId: "meetingmapper-20b45",
  storageBucket: "meetingmapper-20b45.appspot.com",
  messagingSenderId: "836447630101",
  appId: "1:836447630101:web:751a875e40fdfd5b2eaf1c",
  measurementId: "G-0JD3YVQRQK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const transcriptInput = document.getElementById('transcriptInput');
    const fileInput = document.getElementById('fileInput');
    const extractBtn = document.getElementById('extractBtn');
    const resultsDiv = document.getElementById('results');
    const actionItemsList = document.getElementById('actionItems');
    const summaryP = document.getElementById('summary');

    // Handle file upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                transcriptInput.value = evt.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Handle extract button click
    extractBtn.addEventListener('click', async () => {
        const transcript = transcriptInput.value.trim();
        if (!transcript) {
            alert('Please paste or upload a transcript.');
            return;
        }
        extractBtn.disabled = true;
        extractBtn.textContent = 'Extracting...';
        try {
            const response = await fetch('http://localhost:3000/extract-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript })
            });
            const data = await response.json();
            if (data.actionItems && data.actionItems.length > 0) {
                // Save to Firestore
                await addDoc(collection(db, "meeting_action_items"), {
                    transcript,
                    actionItems: data.actionItems,
                    summary: data.summary,
                    created: new Date().toISOString()
                });
                actionItemsList.innerHTML = '';
                data.actionItems.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.owner}: ${item.task} (by ${item.deadline}) - ${item.context}`;
                    actionItemsList.appendChild(li);
                });
                summaryP.textContent = data.summary || '';
                resultsDiv.classList.remove('hidden');
            } else {
                actionItemsList.innerHTML = '';
                summaryP.textContent = 'No action items found.';
                resultsDiv.classList.remove('hidden');
            }
        } catch (err) {
            alert('Error extracting action items. Is the backend running?');
        } finally {
            extractBtn.disabled = false;
            extractBtn.textContent = 'Extract Action Items';
        }
    });
});