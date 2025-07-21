// Session management and utilities for Agile Voting backend

const WebSocket = require('ws');

// Store WebSocket clients by session code
const sessions = {}; // { code: Set of ws clients }
// Store members by session code
const sessionMembers = {}; // { code: Set of user names }
// Store votes and voting state by session code
const sessionVotes = {}; // { code: { userName: point } }
const sessionVoting = {}; // { code: { active: bool, timer: NodeJS.Timeout|null, seconds: number } }

// Utility: Generate a random 4-character alphanumeric code
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Broadcast members list to all clients in a session
function broadcastMembers(code) {
  if (!sessions[code]) return;
  const members = Array.from(sessionMembers[code] || []);
  for (const client of sessions[code]) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'members', members }));
    }
  }
  console.log(`[BROADCAST MEMBERS] Session: ${code}, Members: ${members.join(', ')}`);
}

// Broadcast voting state to all clients in a session
function broadcastVotingState(code, state) {
  if (!sessions[code]) return;
  for (const client of sessions[code]) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'voting-state', ...state }));
    }
  }
}

// Broadcast voting results to all clients in a session
function broadcastVotingResults(code, votes) {
  if (!sessions[code]) return;
  // Calculate average and distribution
  const points = Object.values(votes).filter(v => typeof v === 'number');
  const avg = points.length ? (points.reduce((a, b) => a + b, 0) / points.length) : null;
  const distribution = {};
  for (const v of points) distribution[v] = (distribution[v] || 0) + 1;
  for (const client of sessions[code]) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'votes-revealed', votes, avg, distribution }));
    }
  }
}

// Broadcast session title to all clients in a session
function broadcastTitle(code, title) {
  if (!sessions[code]) return;
  for (const client of sessions[code]) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'session-title', title }));
    }
  }
  console.log(`[BROADCAST TITLE] Session: ${code}, Title: ${title}`);
}

module.exports = {
  sessions,
  sessionMembers,
  sessionVotes,
  sessionVoting,
  generateSessionCode,
  broadcastMembers,
  broadcastVotingState,
  broadcastVotingResults,
  broadcastTitle,
}; 