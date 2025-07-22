<template>
  <div class="container">
    <div class="card">
      <h2 class="text-center">Welcome!</h2>
      <p class="mb-8 text-center">Plan your sprint with real-time story point voting.</p>
      <div class="flex-col gap-4 w-full" style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        <button class="btn btn-primary" @click="navigateTo('/create')">
          Create New Voting Session
        </button>
        <button class="btn btn-secondary" @click="navigateTo('/join')">
          Join Voting Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const navigateTo = useRouter().push;
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.card {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: #23283a;
  color: #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
}
.text-center { text-align: center; }
.mb-8 { margin-bottom: 2rem; }
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
  transition: background 0.2s;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-primary:hover {
  background: #1d4ed8;
}
.btn-secondary {
  background: #374151;
  color: #f3f4f6;
}
</style> 