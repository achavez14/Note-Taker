const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static assets like CSS and JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON in request body
app.use(express.json());

// Route to serve notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// Route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Read notes from db.json
app.get('/api/notes', (req, res) => {
    try {
        const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});

// Define the generateUniqueId() function
function generateUniqueId() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}-${randomNum}`;
}

// Save new note to db.json
app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    // Add a unique id to the new note (ensure generateUniqueId() function is defined)
    newNote.id = generateUniqueId();
    
    const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
    notes.push(newNote);
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2));

    res.json(newNote);
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    let notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));

    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2));
        res.json({ message: 'Note deleted successfully' });
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});