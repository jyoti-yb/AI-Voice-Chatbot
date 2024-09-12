'use strict';

const socket = io();

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const micButton = document.querySelector('button');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

micButton.addEventListener('click', () => {
  recognition.start();
  micButton.disabled = true; // Disable the button while listening
  micButton.classList.add('listening'); // Add visual cue for listening state
});

recognition.addEventListener('speechstart', () => {
  console.log('Speech has been detected.');
});

recognition.addEventListener('result', (e) => {
  console.log('Result has been detected.');

  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  outputYou.textContent = text;
  console.log('Confidence: ' + e.results[0][0].confidence);

  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
  micButton.disabled = false; // Enable button after speech ends
  micButton.classList.remove('listening'); // Remove listening cue
});

recognition.addEventListener('error', (e) => {
  outputBot.textContent = 'Error: ' + e.error;
  micButton.disabled = false; // Re-enable button on error
  micButton.classList.remove('listening'); // Remove listening cue
});

function synthVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  synth.speak(utterance);
}

socket.on('bot reply', function(replyText) {
  synthVoice(replyText);

  if (replyText == '') replyText = '(No answer...)';
  outputBot.textContent = replyText;
});
