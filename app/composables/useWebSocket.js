import { ref, onUnmounted } from 'vue';

// --- WebSocket Composable for Agile Voting Frontend ---
// Provides a persistent WebSocket connection, message sending, and listener registration.
// Adjust WS_URL if backend runs elsewhere.

const WS_URL = 'ws://localhost:4000';

let socket = null;
const isConnected = ref(false);
const lastMessage = ref(null);
const listeners = new Set();

// Establish and maintain a single WebSocket connection
function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    isConnected.value = true;
  };
  socket.onclose = () => {
    isConnected.value = false;
  };
  socket.onerror = () => {
    isConnected.value = false;
  };
  socket.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      data = event.data;
    }
    lastMessage.value = data;
    listeners.forEach((cb) => cb(data));
  };
}

// Send a message to the WebSocket server
function send(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }
  socket.send(JSON.stringify(data));
}

// Register a callback for incoming messages
function onMessage(cb) {
  listeners.add(cb);
  // Remove listener on component unmount
  onUnmounted(() => listeners.delete(cb));
}

// Auto-connect on composable use
connect();

// Export composable API
export function useWebSocket() {
  return {
    isConnected,
    lastMessage,
    send,
    onMessage,
  };
} 