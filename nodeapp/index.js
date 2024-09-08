const express = require('express'); // Import the Express module
const path = require('path'); // Import path module to handle file paths

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Set the server port

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

