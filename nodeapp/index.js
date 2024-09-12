'use strict';

require('dotenv').config(); // Load environment variables

const express = require('express');
const { v4: uuidv4 } = require('uuid'); // For unique session IDs
const { SessionsClient } = require('@google-cloud/dialogflow'); // Dialogflow v2
const socketIO = require('socket.io');

// Environment variables
const DIALOGFLOW_PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const app = express();
const port = process.env.PORT || 5000;

// Serve static files (HTML, JS, CSS, etc.)
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

// Start Express server
const server = app.listen(port, () => {
  console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`);
});

// Initialize Socket.IO
const io = socketIO(server);

// Dialogflow session client
const sessionClient = new SessionsClient({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS, // Path to credentials JSON
});

// Web UI route
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming chat message
  socket.on('chat message', async (text) => {
    console.log('Message received: ' + text);

    const sessionId = uuidv4(); // Generate a unique session ID for each user

    // Create Dialogflow session path
    const sessionPath = sessionClient.projectAgentSessionPath(DIALOGFLOW_PROJECT_ID, sessionId);

    // Dialogflow request object
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text, // User's input message
          languageCode: 'en-US', // Language code (adjust as necessary)
        },
      },
    };

    try {
      // Send the request to Dialogflow and get a response
      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;

      const botReply = result.fulfillmentText; // The bot's reply
      console.log('Bot reply: ' + botReply);

      // Send the bot's reply back to the client
      socket.emit('bot reply', botReply);
    } catch (error) {
      console.error('Dialogflow error: ', error);
      socket.emit('bot reply', 'I am having trouble understanding right now. Please try again later.');
    }
  });
});
