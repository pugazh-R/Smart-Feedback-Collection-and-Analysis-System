const express = require('express');
const bodyParser = require('body-parser');
const Sentiment = require('sentiment');
const path = require('path');

const app = express();
const sentiment = new Sentiment();

app.use(bodyParser.json());
app.use(express.static('public'));

let feedbackData = [];

// POST feedback
app.post('/api/feedback', (req, res) => {
    const { message } = req.body;

    const result = sentiment.analyze(message);

    let sentimentLabel = "Neutral";
    if (result.score > 0) sentimentLabel = "Positive";
    else if (result.score < 0) sentimentLabel = "Negative";

    const feedback = {
        message,
        sentiment: sentimentLabel,
        time: new Date()
    };

    feedbackData.push(feedback);

    res.json({ sentiment: sentimentLabel });
});

// GET summary
app.get('/api/summary', (req, res) => {
    let summary = { Positive: 0, Negative: 0, Neutral: 0 };

    feedbackData.forEach(f => summary[f.sentiment]++);

    res.json(summary);
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});