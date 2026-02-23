const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your React app to communicate with this Node server
app.use(express.json()); // Allows the server to understand JSON data

// This is the "Handshake" route your frontend is looking for
app.get('/api/health', (req, res) => {
    res.json({ message: "AutoCon Backend is Alive and Running!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));