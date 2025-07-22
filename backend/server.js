// Agile Story Point Voting Backend Server
// Handles WebSocket connections, session management, and Redis integration

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Import session management utilities and Redis client
const {
  sessions,
  sessionMembers,
  sessionVotes,
  sessionVoting,
  generateSessionCode,
  broadcastMembers,
  broadcastVotingState,
  broadcastVotingResults,
  broadcastTitle,
} = require('./sessionManager');
const redisClient = require('./redisClient');

// Express app for optional REST endpoints (not required for WebSocket only)
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Store session and user info for this connection
  ws.sessionCode = null;
  ws.userName = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // Handle different message types
      switch (data.type) {
        case 'create-session': {
          // Generate a session code and store in Redis
          const code = generateSessionCode();
          await redisClient.hSet(`session:${code}`, 'title', data.title);
          await redisClient.hSet(`session:${code}`, 'owner', data.userName);

          // Add to in-memory sessions
          sessions[code] = sessions[code] || new Set();
          sessionMembers[code] = sessionMembers[code] || new Set();
          sessions[code].add(ws);
          sessionMembers[code].add(data.userName);
          ws.sessionCode = code;
          ws.userName = data.userName;

          ws.send(JSON.stringify({ type: 'session-created', code }));
          broadcastMembers(code);

          // Send title after registration
          ws.send(JSON.stringify({ type: 'session-title', title: data.title }));
          // Send owner to all clients
          for (const client of sessions[code]) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'owner', owner: data.userName }));
            }
          }
          console.log(`[SEND TITLE TO CREATOR] Session: ${code}, Title: ${data.title}, To: ${data.userName}`);
          broadcastTitle(code, data.title);

          // Log session creation
          console.log(`[SESSION CREATED] Code: ${code}, Title: ${data.title}, Owner: ${data.userName}`);
          break;
        }
        case 'join-session': {
          const code = data.code.toUpperCase();
          const exists = await redisClient.exists(`session:${code}`);
          if (!exists) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found.' }));
            return;
          }
          sessions[code] = sessions[code] || new Set();
          sessionMembers[code] = sessionMembers[code] || new Set();

          // If this socket is already joined with this name, allow (idempotent)
          if (ws.sessionCode === code && ws.userName === data.userName) {
            ws.send(JSON.stringify({ type: 'session-joined', code }));
            ws.send(JSON.stringify({ type: 'members', members: Array.from(sessionMembers[code]) }));
            console.log(`[SEND MEMBERS TO JOINER] Session: ${code}, Members: ${Array.from(sessionMembers[code]).join(', ')}, To: ${data.userName}`);
            broadcastMembers(code);
            // Always send the current title to the joiner
            const title = await redisClient.hGet(`session:${code}`, 'title');
            ws.send(JSON.stringify({ type: 'session-title', title }));
            console.log(`[SEND TITLE TO JOINER] Session: ${code}, Title: ${title}, To: ${data.userName}`);
            broadcastTitle(code, title);
            return;
          }

          // Check for duplicate name (only for new joiners)
          if (sessionMembers[code].has(data.userName)) {
            ws.send(JSON.stringify({ type: 'error', message: 'This name is already taken in this session. Please choose another.' }));
            return;
          }
          sessions[code].add(ws);
          sessionMembers[code].add(data.userName);
          ws.sessionCode = code;
          ws.userName = data.userName;

          ws.send(JSON.stringify({ type: 'session-joined', code }));
          ws.send(JSON.stringify({ type: 'members', members: Array.from(sessionMembers[code]) }));
          // Send owner to all clients
          const owner = await redisClient.hGet(`session:${code}`, 'owner');
          for (const client of sessions[code]) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'owner', owner }));
            }
          }
          console.log(`[SEND MEMBERS TO JOINER] Session: ${code}, Members: ${Array.from(sessionMembers[code]).join(', ')}, To: ${data.userName}`);
          broadcastMembers(code);
          // Always send the current title to the joiner
          const title = await redisClient.hGet(`session:${code}`, 'title');
          ws.send(JSON.stringify({ type: 'session-title', title }));
          console.log(`[SEND TITLE TO JOINER] Session: ${code}, Title: ${title}, To: ${data.userName}`);
          broadcastTitle(code, title);
          // Log user joining
          console.log(`[USER JOINED] User: ${data.userName} joined session: ${code}`);
          break;
        }
        case 'update-title': {
          const code = ws.sessionCode;
          if (!code || ws.userName !== (await redisClient.hGet(`session:${code}`, 'owner'))) {
            ws.send(JSON.stringify({ type: 'error', message: 'Only the session owner can update the title.' }));
            return;
          }
          await redisClient.hSet(`session:${code}`, 'title', data.title);
          broadcastTitle(code, data.title);
          console.log(`[TITLE UPDATED] Session: ${code}, New Title: ${data.title}`);
          break;
        }
        case 'start-voting': {
          const code = ws.sessionCode;
          if (!code || !sessionMembers[code] || ws.userName !== (await redisClient.hGet(`session:${code}`, 'owner'))) {
            ws.send(JSON.stringify({ type: 'error', message: 'Only the session owner can start voting.' }));
            return;
          }
          if (sessionVoting[code]?.active) {
            ws.send(JSON.stringify({ type: 'error', message: 'Voting already in progress.' }));
            return;
          }

          // Use custom duration if provided and valid, else default to 10
          let duration = 10;
          if (typeof data.duration === 'number' && data.duration >= 5 && data.duration <= 120) {
            duration = Math.floor(data.duration);
          }

          // Start voting
          sessionVoting[code] = { active: true, timer: null, seconds: duration };
          sessionVotes[code] = {};
          broadcastVotingState(code, { active: true, seconds: duration });

          // Start timer with custom duration and broadcast every second
          sessionVoting[code].timer = setInterval(() => {
            if (!sessionVoting[code]) return;
            sessionVoting[code].seconds--;
            if (sessionVoting[code].seconds > 0) {
              broadcastVotingState(code, { active: true, seconds: sessionVoting[code].seconds });
            } else {
              clearInterval(sessionVoting[code].timer);
              sessionVoting[code].active = false;
              broadcastVotingState(code, { active: false, seconds: 0 });
              broadcastVotingResults(code, sessionVotes[code]);
            }
          }, 1000);

          // Log
          console.log(`[VOTING STARTED] Session: ${code}, Duration: ${duration}s`);
          break;
        }
        case 'submit-vote': {
          const code = ws.sessionCode;
          if (!code || !sessionVoting[code]?.active) {
            ws.send(JSON.stringify({ type: 'error', message: 'Voting is not active.' }));
            return;
          }
          // Accept vote
          sessionVotes[code][ws.userName] = data.point;
          // Optionally, acknowledge
          ws.send(JSON.stringify({ type: 'vote-received' }));
          // Log
          console.log(`[VOTE] User: ${ws.userName}, Session: ${code}, Point: ${data.point}`);
          break;
        }
        case 'get-owner': {
          const code = data.code;
          if (!code) return;
          const owner = await redisClient.hGet(`session:${code}`, 'owner');
          ws.send(JSON.stringify({ type: 'owner', owner }));
          break;
        }
        case 'promote-member': {
          const code = ws.sessionCode;
          if (!code || ws.userName !== (await redisClient.hGet(`session:${code}`, 'owner'))) {
            ws.send(JSON.stringify({ type: 'error', message: 'Only the session owner can promote another member.' }));
            return;
          }
          const target = data.userName;
          if (!sessionMembers[code] || !sessionMembers[code].has(target)) {
            ws.send(JSON.stringify({ type: 'error', message: 'Target member not found.' }));
            return;
          }
          await redisClient.hSet(`session:${code}`, 'owner', target);
          broadcastMembers(code);
          // Broadcast new owner to all clients
          for (const client of sessions[code]) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'owner', owner: target }));
            }
          }
          console.log(`[OWNER PROMOTED] Session: ${code}, New Owner: ${target}`);
          break;
        }
        // Add more message types for voting, timer, etc.
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type.' }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
    }
  });

  ws.on('close', async () => {
    // Remove from session set on disconnect
    if (ws.sessionCode && sessions[ws.sessionCode]) {
      sessions[ws.sessionCode].delete(ws);
      if (ws.userName && sessionMembers[ws.sessionCode]) {
        const code = ws.sessionCode;
        const wasOwner = ws.userName === await redisClient.hGet(`session:${code}`, 'owner');
        sessionMembers[ws.sessionCode].delete(ws.userName);
        // If the owner left, transfer ownership to the next member (if any)
        if (wasOwner && sessionMembers[code] && sessionMembers[code].size > 0) {
          const nextOwner = Array.from(sessionMembers[code])[0];
          await redisClient.hSet(`session:${code}`, 'owner', nextOwner);
          console.log(`[OWNER TRANSFERRED] Session: ${code}, New Owner: ${nextOwner}`);
        }
        broadcastMembers(ws.sessionCode);
        // Log user leaving
        console.log(`[USER LEFT] User: ${ws.userName} left session: ${ws.sessionCode}`);
      }
      // Only check size if sessions[ws.sessionCode] still exists
      if (sessions[ws.sessionCode] && sessions[ws.sessionCode].size === 0) {
        clearInterval(sessionVoting[ws.sessionCode]?.timer);
        delete sessions[ws.sessionCode];
        delete sessionMembers[ws.sessionCode];
        delete sessionVoting[ws.sessionCode];
        delete sessionVotes[ws.sessionCode];
        // Log session cleanup
        console.log(`[SESSION ENDED] Code: ${ws.sessionCode}`);
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
}); 