<template>
  <div class="container">
    <div class="card">
      <h2 class="text-center">Join a Voting Session</h2>
      <form @submit.prevent="joinSession" class="space-y-4">
        <div class="form-group">
          <label for="code">Session Code</label>
          <input id="code" v-model="code" maxlength="4" required placeholder="e.g. 1A2B" style="text-transform:uppercase;" />
        </div>
        <div class="form-group">
          <label for="name">Your Name</label>
          <input id="name" v-model="name" required placeholder="e.g. Alice" />
        </div>
        <button type="submit" class="btn btn-primary btn-left">Join Session</button>
      </form>
      <div v-if="error" class="error mt-4 text-center">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ prerender: false })
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWebSocket } from '../composables/useWebSocket';

const code = ref('');
const name = ref('');
const error = ref('');
const router = useRouter();
const { send, onMessage, isConnected } = useWebSocket();

onMessage((msg) => {
  if (msg.type === 'session-joined') {
    error.value = '';
    router.push(`/session/${msg.code}?name=${encodeURIComponent(name.value)}`);
  } else if (msg.type === 'error') {
    error.value = msg.message;
  }
});

function joinSession() {
  if (!isConnected.value) {
    error.value = 'WebSocket not connected.';
    return;
  }
  if (code.value.length !== 4) {
    error.value = 'Session code must be 4 characters.';
    return;
  }
  if (!name.value.trim()) {
    error.value = 'Name is required.';
    return;
  }
  send({ type: 'join-session', code: code.value.toUpperCase(), userName: name.value });
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}
.card {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem 2rem;
  background: #23283a;
  color: #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
}
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }
.space-y-4 > * + * { margin-top: 1.5rem; }
.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
label {
  font-size: 0.95em;
  color: #cbd5e1;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1px solid #374151;
  border-radius: 6px;
  font-size: 1rem;
  color: #f3f4f6;
  background-color: #181c24;
  transition: border-color 0.2s ease-in-out;
}
input::placeholder {
  color: #a1a1aa;
}
input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.btn {
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: background 0.2s, color 0.2s;
  background: #2563eb;
  color: #fff;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-primary:hover {
  background: #1d4ed8;
}
.btn-left {
  display: block;
  margin-left: 0;
  margin-top: 0.5rem;
}
.error {
  color: #dc2626;
  font-weight: 500;
  background: #2d1a1a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}
</style> 