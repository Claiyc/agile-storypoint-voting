<template>
  <div class="container">
    <div class="card">
      <div class="session-title-box">
        <template v-if="!editingTitle">
          <h2 class="session-title">{{ title }}</h2>
        </template>
        <template v-else>
          <div class="edit-title-row">
            <input v-model="titleInput" class="title-input" />
            <button class="btn btn-primary btn-sm" @click="saveTitle">Save</button>
            <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
          </div>
        </template>
      </div>
      <div v-if="isOwner && !editingTitle" class="edit-title-btn-row">
        <button class="btn btn-secondary btn-sm" @click="editTitle">Edit Title</button>
      </div>
      <div class="mb-4 text-center">
        <strong>Session Code:</strong> <span class="session-code">{{ code }}</span>
      </div>
      <div v-if="!name || name === ''">
        <form @submit.prevent="submitName" class="space-y-4">
          <div class="form-group">
            <label for="nameInput" class="inline-label">Your Name</label>
            <input id="nameInput" v-model="nameInput" required placeholder="e.g. Alice" class="inline-input" />
          </div>
          <button type="submit" class="btn btn-primary btn-left">Join</button>
        </form>
        <div v-if="joinError" class="error mt-4 text-center">{{ joinError }}</div>
      </div>
      <div v-else>
        <div class="mb-2">Welcome, <strong>{{ name }}</strong>!</div>
        <div class="mb-6">
          <div class="font-semibold">Members in this session:</div>
          <table class="table mt-2">
            <thead>
              <tr><th>Name</th><th>Vote</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in memberRows" :key="row.name">
                <td>{{ row.name }}</td>
                <td>
                  {{ row.vote }}
                  <span v-if="row.mark === 'high' || row.mark === 'both'" title="Highest vote" style="font-size:0.9em; color:#22c55e; margin-left:2px;">▲</span>
                  <span v-if="row.mark === 'low' || row.mark === 'both'" title="Lowest vote" style="font-size:0.9em; color:#ef4444; margin-left:2px;">▼</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="voting.active" class="sticky-timer mb-4">
          <div class="timer-card">⏳ {{ voting.seconds }}s</div>
        </div>
        <div v-if="!voting.active && isOwner" class="mb-6">
          <div class="mb-2" style="text-align:center;">
            <label for="votingDuration" style="font-weight:500;">Voting Timer (seconds):</label>
            <input id="votingDuration" type="number" min="5" max="120" v-model.number="votingDuration" style="width:80px; margin-left:0.5rem; background:#181c24; color:#f3f4f6; border:1px solid #374151; border-radius:4px; padding:0.25rem 0.5rem; text-align:center;" />
          </div>
          <button class="btn btn-primary" @click="startVoting">Start Voting</button>
        </div>
        <div v-if="voting.active" class="mb-6">
          <div class="font-semibold">Voting in progress! Choose your story point:</div>
          <div class="flex-wrap gap-2 mt-2" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
            <button v-for="point in points" :key="point" :disabled="!voting.active" class="btn btn-outline" @click="submitVote(point)">{{ point }}</button>
          </div>
          <div v-if="vote !== null" class="mt-2">You voted: <strong>{{ vote }}</strong></div>
        </div>
        <!-- Distribution Bar -->
        <div v-if="results" class="mt-8">
          <div class="font-semibold mb-2">Distribution</div>
          <div class="distribution-bar-full">
            <div
              v-for="(count, point, idx) in filteredDistribution"
              :key="point"
              class="dist-bar-segment-full"
              :style="segmentFlexStyle(count, idx)"
            >
              <span class="dist-label-full">{{ point }} ({{ count }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { useWebSocket } from '../../composables/useWebSocket';

const route = useRoute();
const router = useRouter();
const code = route.params.code;
const name = ref(route.query.name ? String(route.query.name) : '');
const nameInput = ref('');
const title = ref('');
const editingTitle = ref(false);
const titleInput = ref('');
const members = ref([]);
const { onMessage, send, isConnected } = useWebSocket();
const voting = ref({ active: false, seconds: 0 });
const vote = ref(null);
const results = ref(null);
const points = [1, 2, 3, 5, 8, 13, 21, '?'];
const isOwner = ref(false);
const joinError = ref('');
const hasJoined = ref(false);
const votingDuration = ref(10); // default 10 seconds

onMessage((msg) => {
  if (msg.type === 'members') {
    members.value = msg.members;
    if (members.value.length && name.value) {
      isOwner.value = (members.value[0] === name.value);
    }
  } else if (msg.type === 'voting-state') {
    voting.value.active = msg.active;
    voting.value.seconds = msg.seconds;
    if (!msg.active) vote.value = null;
    if (!msg.active) results.value = null;
  } else if (msg.type === 'votes-revealed') {
    results.value = msg;
    voting.value.active = false;
  } else if (msg.type === 'session-title') {
    title.value = msg.title;
    if (!editingTitle.value) titleInput.value = msg.title;
  } else if (msg.type === 'error' && msg.message.includes('already taken')) {
    joinError.value = msg.message;
    router.replace({ query: {} });
    name.value = '';
  }
});

function tryJoinSession() {
  if (name.value && isConnected.value && !members.value.includes(name.value) && !hasJoined.value) {
    send({ type: 'join-session', code, userName: name.value });
    hasJoined.value = true;
  }
}
onMounted(() => { tryJoinSession(); });
watch(() => route.query.name, (newName) => {
  name.value = newName ? String(newName) : '';
  hasJoined.value = false;
  tryJoinSession();
});
watch(members, (newMembers) => {
  if (name.value && !newMembers.includes(name.value)) {
    hasJoined.value = false;
    tryJoinSession();
  }
});
function submitName() {
  if (nameInput.value.trim()) {
    joinError.value = '';
    router.replace({ query: { name: nameInput.value.trim() } });
  }
}
function startVoting() { send({ type: 'start-voting', duration: votingDuration.value }); }
function submitVote(point) {
  if (voting.value.active) {
    vote.value = point;
    send({ type: 'submit-vote', point });
  }
}
function editTitle() { editingTitle.value = true; titleInput.value = title.value; }
function cancelEdit() { editingTitle.value = false; titleInput.value = title.value; }
function saveTitle() { send({ type: 'update-title', title: titleInput.value }); editingTitle.value = false; }

const memberRows = computed(() => {
  if (!members.value.length) return [];
  if (results.value && results.value.votes) {
    // Find numeric votes only
    const numericVotes = Object.values(results.value.votes).filter(v => typeof v === 'number');
    let max = null, min = null;
    if (numericVotes.length) {
      max = Math.max(...numericVotes);
      min = Math.min(...numericVotes);
    }
    return members.value.map(name => {
      const vote = results.value.votes[name] ?? '-';
      let mark = '';
      if (typeof vote === 'number') {
        if (vote === max && max !== min) mark = 'high';
        if (vote === min && max !== min) mark = mark ? 'both' : 'low';
      }
      return { name, vote, mark };
    });
  }
  return members.value.map(name => ({ name, vote: '-' }));
});
const filteredDistribution = computed(() => {
  if (!results.value || !results.value.distribution) return {};
  // Only include story points that received votes
  return Object.fromEntries(Object.entries(results.value.distribution).filter(([_, count]) => count > 0));
});
const segmentColors = [
  '#2563eb', '#22c55e', '#f59e42', '#eab308', '#ef4444', '#a21caf', '#0ea5e9', '#64748b', '#f472b6', '#14b8a6'
];
function segmentFlexStyle(count, idx) {
  return {
    flexGrow: count,
    flexBasis: 0,
    width: 'auto',
    background: segmentColors[idx % segmentColors.length],
    color: '#fff',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1em',
    minWidth: '2.5rem',
    position: 'relative',
    transition: 'none',
    height: '2.2rem',
    overflow: 'hidden',
  };
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
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: #23283a;
  color: #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.session-title-box {
  background: rgba(20,22,30,0.98);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  text-align: center;
}
.session-title {
  color: #60a5fa;
  text-align: center;
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  word-break: break-word;
  background: none;
}
.edit-title-row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
.edit-title-btn-row {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.title-input {
  padding: 0.5rem;
  border: 1px solid #374151;
  border-radius: 4px;
  font-size: 1rem;
  width: 60%;
  background: #181c24;
  color: #f3f4f6;
}
.session-code {
  font-family: monospace;
  font-size: 1.2em;
}
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-4 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  background: #23283a;
  color: #f3f4f6;
}
.table th, .table td {
  border: 1px solid #374151;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.sticky-timer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.timer-card {
  background: #374151;
  color: #60a5fa;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.1em;
}
.flex-wrap { display: flex; flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 0.25rem;
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
.btn-outline {
  background: #181c24;
  color: #60a5fa;
  border: 1px solid #2563eb;
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
}
.ml-2 { margin-left: 0.5rem; }
.error {
  color: #dc2626;
}
.dist-card {
  background: #374151;
  color: #60a5fa;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.95em;
}
.distribution-bar {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dist-bar-segment {
  overflow: hidden;
  position: relative;
  animation: growBar 0.7s cubic-bezier(.4,2,.6,1);
}
@keyframes growBar {
  from { width: 0; }
  to { width: 100%; }
}
.dist-label {
  position: absolute;
  left: 0.5rem;
  font-size: 0.95em;
  color: #fff;
  opacity: 0.85;
}
.dist-value {
  margin-left: auto;
  padding-right: 0.5rem;
  font-size: 0.95em;
  color: #fff;
  opacity: 0.95;
}
.distribution-bar-full {
  width: 100%;
  display: flex;
  flex-direction: row;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(37,99,235,0.08);
  background: #181c24;
  min-height: 2.2rem;
}
.dist-bar-segment-full {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: bold;
  position: relative;
  white-space: nowrap;
  transition: none;
}
.dist-label-full {
  padding: 0 0.5rem;
  color: #fff;
  font-size: 0.95em;
  opacity: 0.95;
  text-shadow: 0 1px 2px rgba(0,0,0,0.12);
}
.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.form-group-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.inline-label {
  font-size: 0.95em;
  color: #cbd5e1;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.inline-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #374151;
  border-radius: 6px;
  font-size: 1rem;
  color: #f3f4f6;
  background-color: #181c24;
  transition: border-color 0.2s ease-in-out;
}
.inline-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.btn-left {
  margin-left: auto;
}
</style> 