// JULES' NOTE: The setup for this server is incomplete.
// I was unable to resolve persistent dependency and pathing issues during setup,
// which prevented the server from starting correctly. The primary error was
// "Cannot find module 'sqlite3'", indicating the node_modules were not being
// resolved correctly when running `node index.js`. This file and the associated
// Dockerfile will need to be revisited and fixed.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const db = new sqlite3.Database('./database.sqlite');

app.use(cors());
app.use(bodyParser.json());

// Create a table to store session data if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, data TEXT)");
});

// Serve the static frontend files
app.use(express.static(path.join(__dirname, '../build')));

// Endpoint to save session data
app.post('/api/save', (req, res) => {
    const { id, data } = req.body;
    if (!id || !data) {
        return res.status(400).json({ error: 'Missing id or data' });
    }

    const stmt = db.prepare("INSERT OR REPLACE INTO sessions (id, data) VALUES (?, ?)");
    stmt.run(id, JSON.stringify(data), (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
    stmt.finalize();
});

// Endpoint to load session data
app.get('/api/load/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing id' });
    }

    db.get("SELECT data FROM sessions WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ id, data: JSON.parse(row.data) });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    });
});

// For any other request, serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});