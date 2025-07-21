<template>
  <div class="container">
    <div class="card">
      <h2 class="text-center">Create a New Voting Session</h2>
      <form @submit.prevent="createSession" class="space-y-4">
        <div class="form-group">
          <label for="title">Session Title</label>
          <input id="title" v-model="title" required placeholder="e.g. Sprint Planning" />
        </div>
        <div class="form-group">
          <label for="name">Your Name</label>
          <input id="name" v-model="name" required placeholder="e.g. Alice" />
        </div>
        <button type="submit" class="btn btn-primary">Create Session</button>
      </form>
      <div v-if="sessionCode" class="mt-6 text-center">
        <strong>Session Code:</strong> {{ sessionCode }}<br />
        Share this code with others to join your session.<br />
        <button class="btn btn-primary mt-4" @click="goToSession">Go to Session</button>
      </div>
      <div v-if="error" class="error mt-4 text-center">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWebSocket } from '../composables/useWebSocket';

const title = ref('');
const name = ref('');
const sessionCode = ref('');
const error = ref('');
const router = useRouter();
const { send, onMessage, isConnected } = useWebSocket();

onMessage((msg) => {
  if (!msg || typeof msg !== 'object') {
    error.value = 'Received empty or invalid response from server.';
    return;
  }
  if (msg.type === 'session-created') {
    sessionCode.value = msg.code;
    error.value = '';
  } else if (msg.type === 'error') {
    error.value = msg.message || 'Unknown error from server.';
  } else if (!sessionCode.value) {
    error.value = 'Unexpected response from server.';
  }
});

function createSession() {
  if (!isConnected.value) {
    error.value = 'WebSocket not connected.';
    return;
  }
  if (!title.value.trim() || !name.value.trim()) {
    error.value = 'Title and name are required.';
    return;
  }
  send({ type: 'create-session', title: title.value, userName: name.value });
}

function goToSession() {
  router.push({ path: `/session/${sessionCode.value}`, query: { name: name.value } });
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.text-center { text-align: center; }
.mt-6 { margin-top: 1.5rem; }
.mt-4 { margin-top: 1rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}
.error {
  color: #dc2626;
}
</style> 