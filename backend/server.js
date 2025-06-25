// Basic Express server for MeetingMapper
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// POST /extract-tasks: Accepts a transcript and returns extracted action items (placeholder)
app.post('/extract-tasks', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required.' });
    }
    // TODO: Integrate OpenAI GPT API here
    // For now, return a mock response
    res.json({
        actionItems: [
            { owner: 'Ashik', task: 'Send project update', deadline: 'Friday', context: 'Discussed in meeting' },
            { owner: 'Sham', task: 'Prepare budget report', deadline: 'Next Monday', context: 'Action item assigned' }
        ],
        summary: '2 action items extracted. (This is a mock response.)'
    });
});

app.listen(PORT, () => {
    console.log(`MeetingMapper backend running on port ${PORT}`);
});
