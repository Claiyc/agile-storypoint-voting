import { ref, onUnmounted } from 'vue';
import { useRuntimeConfig } from '#app';

// --- WebSocket Composable for Agile Voting Frontend ---
// Provides a persistent WebSocket connection, message sending, and listener registration.
// WS_URL is now configurable via Nuxt runtimeConfig.

let socket = null;
const isConnected = ref(false);
const lastMessage = ref(null);
const listeners = new Set();

// Export composable API
export function useWebSocket() {
  const config = useRuntimeConfig();
  const WS_URL = config.public.wsUrl;

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

  return {
    isConnected,
    lastMessage,
    send,
    onMessage,
    address: WS_URL,
  };
} 