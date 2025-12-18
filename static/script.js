// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const typingIndicator = document.getElementById('typing-indicator');

let recognition;
let synth = window.speechSynthesis;

const micIcon = document.getElementById('mic-icon');
const canvas = document.getElementById('voice-visualizer');
const canvasCtx = canvas.getContext('2d');
let animationId;
let mediaStream;
let analyser;
let dataArray;
let source;

// Setup Speech Recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        micBtn.classList.add('listening');
        if (micIcon) {
            micIcon.classList.remove('fa-microphone-lines');
            micIcon.classList.add('fa-stop'); // Change to stop button
        }
        startVisualizer();
    };

    recognition.onend = () => {
        micBtn.classList.remove('listening');
        if (micIcon) {
            micIcon.classList.remove('fa-stop');
            micIcon.classList.add('fa-microphone-lines'); // Revert to mic
        }
        stopVisualizer();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

} else {
    micBtn.style.display = 'none'; // Hide if not supported
    alert("Web Speech API not supported in this browser. Try Chrome.");
}

async function startVisualizer() {
    canvas.classList.remove('hidden');
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioCtx.state === 'suspended') audioCtx.resume();

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        drawVisualizer();
    } catch (err) {
        console.error("Visualizer Error:", err);
    }
}

function stopVisualizer() {
    canvas.classList.add('hidden');
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (animationId) cancelAnimationFrame(animationId);
}

function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / dataArray.length) * 2;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        const r = barHeight + 25 * (i / dataArray.length);
        const g = 250 * (i / dataArray.length);
        const b = 50;
        canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
        canvasCtx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
        x += barWidth + 1;
    }
}

// Sound Effects System
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSendSound() { playTone(800, 'sine', 0.15); }
function playReceiveSound() {
    setTimeout(() => playTone(600, 'sine', 0.1), 0);
    setTimeout(() => playTone(1200, 'sine', 0.2), 100);
}

function appendMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    // Play Sound
    if (isUser) playSendSound();
    else playReceiveSound();

    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    if (!isUser) avatarDiv.classList.add('gradient-avatar');
    avatarDiv.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-sparkles"></i>';

    // Bubble
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');
    if (!isUser) bubbleDiv.classList.add('glass-bubble');
    bubbleDiv.textContent = text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubbleDiv);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Display user message
    appendMessage(text, true);
    userInput.value = '';

    // Show Typing Indicator
    typingIndicator.classList.remove('hidden');
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        // Hide Indicator
        typingIndicator.classList.add('hidden');

        // Display bot response
        appendMessage(data.response, false);

        // Speak the response
        speak(data.response);

    } catch (error) {
        typingIndicator.classList.add('hidden');
        console.error('Error:', error);
        appendMessage("⚠️ Connection Error. Please try again.", false);
    }
}

function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.3; // Faster speaking speed
    utterance.pitch = 1.0;

    // Attempt to pick a 'Google US English' voice if available for better quality
    const voices = synth.getVoices();
    const preferredVoice = voices.find(voice => voice.name.includes("Google US English") || voice.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    synth.speak(utterance);
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
