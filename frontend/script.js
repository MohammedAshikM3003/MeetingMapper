// script.js — for mock/test/demo only

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

  // File upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      transcriptInput.value = evt.target.result;
    };
    reader.readAsText(file);
  });

  // Extract mock action items
  extractBtn.addEventListener('click', () => {
    const transcript = transcriptInput.value.trim();
    if (!transcript) {
      alert("Please paste or upload a transcript first.");
      return;
    }

    const mockData = {
      summary: "The meeting focused on finalizing the project design and initiating frontend development.",
      actionItems: [
        {
          owner: "Mike",
          task: "Share Figma design file",
          deadline: "Today",
          context: "To enable Sarah to begin frontend integration."
        },
        {
          owner: "Sarah",
          task: "Begin frontend integration",
          deadline: "This week",
          context: "To incorporate the finalized design into the application."
        },
        {
          owner: "Team (implied)",
          task: "Finalize the design",
          deadline: "Monday",
          context: "To ensure the design is complete before frontend integration is fully underway."
        }
      ]
    };

    resultsDiv.classList.remove('hidden');
    summaryP.textContent = mockData.summary;
    actionItemsList.innerHTML = '';
    mockData.actionItems.forEach(item => {
      const li = document.createElement('li');
      const deadline = item.deadline !== "N/A" ? ` (by ${item.deadline})` : '';
      li.textContent = `${item.owner}: ${item.task}${deadline} – ${item.context}`;
      actionItemsList.appendChild(li);
    });
  });
});
