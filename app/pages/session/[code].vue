<template>
  <div class="container">
    <div class="card">
      <div class="mb-4 text-center session-code-row">
        <div class="session-code-left">
          <strong>Session Code:</strong> <span class="session-code">{{ code }}</span>
          <span class="copy-btn-group">
            <button class="copy-btn" @click="copySessionCode" :title="copyTooltip" aria-label="Copy session code">
              <svg width="28" height="28" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="8" height="8" rx="2" stroke="#60a5fa" stroke-width="1.5"/>
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="#60a5fa" stroke-width="1.5"/>
              </svg>
            </button>
            <transition name="fade"><div v-if="copyTooltip === 'Copied!'" class="copy-feedback-popup">Copied!</div></transition>
          </span>
        </div>
        <button class="share-btn" @click="shareSession" :title="shareTooltip" aria-label="Share session">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="19" r="2" stroke="#60a5fa" stroke-width="1.5"/>
            <circle cx="6" cy="12" r="2" stroke="#60a5fa" stroke-width="1.5"/>
            <circle cx="18" cy="5" r="2" stroke="#60a5fa" stroke-width="1.5"/>
            <line x1="7.7" y1="13.2" x2="16.3" y2="17.8" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="16.3" y1="6.2" x2="7.7" y2="10.8" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <transition name="fade"><div v-if="shareTooltip === 'Shared!' || shareTooltip === 'Link copied!'" class="share-feedback">{{ shareTooltip }}</div></transition>
      </div>
      <div v-if="name && name !== ''">
        <div class="session-title-box">
          <template v-if="!editingTitle">
            <div class="session-title-row">
              <button
                v-if="isOwner && !editingTitle"
                class="edit-title-icon-btn"
                @click="editTitle"
                :title="'Edit session title'"
                aria-label="Edit session title"
              >
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 13.5V16h2.5l7.1-7.1a1 1 0 0 0 0-1.4l-1.1-1.1a1 1 0 0 0-1.4 0L4 13.5z" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12.5 6.5l1.1 1.1" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <h2 class="session-title">{{ title }}</h2>
              <a
                v-if="title && title.trim()"
                class="goto-jira-btn"
                :href="gotoBaseUrl + encodeURIComponent(title)"
                target="_blank"
                rel="noopener noreferrer"
                :title="`Go to: ${gotoBaseUrl}${encodeURIComponent(title)}`"
                aria-label="Go to Jira"
              >
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 13L13 7M9 7H13V11" stroke="#60a5fa" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="3.5" y="3.5" width="13" height="13" rx="2.5" stroke="#60a5fa" stroke-width="1.7"/>
                </svg>
              </a>
            </div>
          </template>
          <template v-else>
            <div class="edit-title-row">
              <input v-model="titleInput" class="title-input" />
              <button class="btn btn-primary btn-sm" @click="saveTitle">Save</button>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
            </div>
          </template>
        </div>
      </div>
      <div v-if="!name || name === ''">
        <form @submit.prevent="submitName" class="space-y-4">
          <div class="form-group">
            <label for="nameInput" class="inline-label">Your Name</label>
            <input id="nameInput" v-model="nameInput" required placeholder="e.g. Alice" class="inline-input join-name-input" />
          </div>
          <button type="submit" class="btn btn-primary btn-left">Join</button>
        </form>
        <div v-if="joinError" class="error mt-4 text-center">{{ joinError }}</div>
      </div>
      <div v-else>
        <div class="mb-2">Welcome, <strong>{{ name }}</strong>!</div>
        <div class="mb-6">
          <div class="font-semibold">Members:</div>
          <table class="table mt-2">
            <thead>
              <tr><th>Name</th><th>Vote</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in memberRows" :key="row.name">
                <td>
                  {{ row.name }}
                  <span v-if="row.name === ownerName" title="Session owner" style="margin-left:4px; vertical-align:middle; display:inline-block; position:relative; top:-2px;">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
                      <path d="M3 7l3.5 5 3.5-7 3.5 7L17 7" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="3" cy="7" r="1" fill="#fbbf24"/>
                      <circle cx="10" cy="5" r="1" fill="#fbbf24"/>
                      <circle cx="17" cy="7" r="1" fill="#fbbf24"/>
                      <rect x="6" y="13" width="8" height="2" rx="1" fill="#fbbf24"/>
                    </svg>
                  </span>
                  <button v-if="isOwner && row.name !== name" class="promote-btn" @click="promoteMember(row.name)" title="Promote to owner" aria-label="Promote to owner">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 15V5M10 5l-3 3M10 5l3 3" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </td>
                <td>
                  <template v-if="results">
                    {{ row.vote }}
                  </template>
                  <template v-else-if="voting.active">
                    <span v-if="row.vote === 'pending'" class="vote-status-icon" title="Waiting for vote">
                      <svg class="spinner" width="18" height="18" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#60a5fa" stroke-width="5"></circle></svg>
                    </span>
                    <span v-else-if="row.vote === 'voted'" class="vote-status-icon" title="Voted">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10l4 4 6-8" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </template>
                  <template v-else>
                    -
                  </template>
                  <span v-if="row.mark === 'high' || row.mark === 'both'" title="Highest vote" style="font-size:0.9em; color:#22c55e; margin-left:2px;">▲</span>
                  <span v-if="row.mark === 'low' || row.mark === 'both'" title="Lowest vote" style="font-size:0.9em; color:#ef4444; margin-left:2px;">▼</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="voting.active" class="sticky-timer mb-4">
          <div class="timer-card">⏳ {{ voting.seconds }}s
            <button v-if="isOwner" class="skip-timer-btn" @click="skipTimer" title="Skip timer and reveal votes" aria-label="Skip timer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
                <path d="M5 10h10M13 7l3 3-3 3" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="skip-timer-label">Skip</span>
            </button>
          </div>
        </div>
        <div v-if="!voting.active && isOwner" class="mb-6">
          <div class="voting-timer-row">
            <div class="voting-timer-custom-group">
              <button class="voting-timer-incdec"
                @mousedown="startHoldTimer('dec')"
                @touchstart.prevent="startHoldTimer('dec')"
                @mouseup="stopHoldTimer('dec', $event)"
                @mouseleave="stopHoldTimer()"
                @touchend="stopHoldTimer('dec', $event)"
                aria-label="Decrease timer"
                tabindex="0">&#8722;</button>
              <span class="voting-timer-input-custom">
                {{ votingDuration }}<span class="voting-timer-s">s</span>
              </span>
              <button class="voting-timer-incdec"
                @mousedown="startHoldTimer('inc')"
                @touchstart.prevent="startHoldTimer('inc')"
                @mouseup="stopHoldTimer('inc', $event)"
                @mouseleave="stopHoldTimer()"
                @touchend="stopHoldTimer('inc', $event)"
                aria-label="Increase timer"
                tabindex="0">&#43;</button>
            </div>
            <button class="btn btn-primary voting-timer-btn" @click="startVoting">Start Voting</button>
          </div>
        </div>
        <div v-if="voting.active" class="mb-6">
          <div class="font-semibold">Voting in progress! Choose your story point:</div>
          <div class="flex-wrap gap-2 mt-2" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
            <button
              v-for="point in points"
              :key="point"
              :disabled="!voting.active"
              class="btn btn-outline"
              :class="{ 'btn-voted': vote === point }"
              @click="submitVote(point)"
            >{{ point }}</button>
          </div>
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
  <audio ref="plingAudio" src="/ding-36029.mp3" preload="auto" style="display:none" />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { useWebSocket } from '../../composables/useWebSocket';
import { useRuntimeConfig } from '#app';
const route = useRoute();
const router = useRouter();
const code = route.params.code;
const name = ref(route.query.name ? String(route.query.name) : '');
const nameInput = ref('');
const title = ref('');
const editingTitle = ref(false);
const titleInput = ref('');
const members = ref([]);
const { onMessage, send, isConnected, address } = useWebSocket();
const voting = ref({ active: false, seconds: 0 });
const vote = ref(null);
const results = ref(null);
const points = [1, 2, 3, 5, 8, 13, 21, '?'];
const isOwner = ref(false);
const ownerName = ref("");
const joinError = ref('');
const hasJoined = ref(false);
const votingDuration = ref(10); // default 10 seconds
const copyTooltip = ref('Copy');
function copySessionCode() {
  navigator.clipboard.writeText(code).then(() => {
    copyTooltip.value = 'Copied!';
    setTimeout(() => (copyTooltip.value = 'Copy'), 1200);
  });
}
const shareTooltip = ref('Share');
function shareSession() {
  const url = window.location.origin + `/session/${code}`;
  if (navigator.share) {
    navigator.share({ title: 'Join Agile Voting Session', url }).then(() => {
      shareTooltip.value = 'Shared!';
      setTimeout(() => (shareTooltip.value = 'Share'), 1200);
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      shareTooltip.value = 'Link copied!';
      setTimeout(() => (shareTooltip.value = 'Share'), 1200);
    });
  }
}

const plingAudio = ref(null);
let lastVotingStart = 0;
const votedMembers = ref(new Set());

onMessage((msg) => {
  if (msg.type === 'members') {
    members.value = msg.members;
    // After joining, request the current owner
    if (name.value && members.value.includes(name.value)) {
      send({ type: 'get-owner', code });
    }
    // Reset votedMembers when members list changes (new round)
    votedMembers.value = new Set();
  } else if (msg.type === 'voting-state') {
    // Play pling sound when voting starts
    if (msg.active && (!voting.value.active || voting.value.seconds === 0)) {
      if (plingAudio.value) {
        plingAudio.value.currentTime = 0;
        plingAudio.value.play();
      }
      // Clear previous results and vote
      results.value = null;
      vote.value = null;
      votedMembers.value = new Set(); // Reset on new voting round
    }
    voting.value.active = msg.active;
    voting.value.seconds = msg.seconds;
    if (!msg.active) vote.value = null;
    if (!msg.active) results.value = null;
    if (!msg.active) votedMembers.value = new Set(); // Reset when voting ends
  } else if (msg.type === 'votes-revealed') {
    results.value = msg;
    voting.value.active = false;
    votedMembers.value = new Set(); // Reset when votes are revealed
  } else if (msg.type === 'voted') {
    votedMembers.value = new Set(votedMembers.value);
    votedMembers.value.add(msg.userName);
  } else if (msg.type === 'session-title') {
    title.value = msg.title;
    if (!editingTitle.value) titleInput.value = msg.title;
  } else if (msg.type === 'error' && msg.message.includes('already taken')) {
    joinError.value = msg.message;
    router.replace({ query: {} });
    name.value = '';
  } else if (msg.type === 'owner') {
    ownerName.value = msg.owner;
  }
});

// Watch for owner changes and update isOwner
watch([ownerName, name], ([o, n]) => {
  isOwner.value = o === n;
});

function tryJoinSession() {
  if (name.value && isConnected.value && !members.value.includes(name.value) && !hasJoined.value) {
    send({ type: 'join-session', code, userName: name.value });
    hasJoined.value = true;
  }
}
onMounted(() => {
  tryJoinSession();
  // Preload pling sound
  if (plingAudio.value) {
    plingAudio.value.load();
  }
});
watch(() => route.query.name, (newName) => {
  name.value = newName ? String(newName) : '';
  hasJoined.value = false;
  tryJoinSession();
});
watch(isConnected, (val) => {
  if (val) {
    tryJoinSession();
    // send({ type: 'get-owner', code }); // Remove from here
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
    // Optimistically add self to votedMembers
    votedMembers.value = new Set(votedMembers.value);
    votedMembers.value.add(name.value);
    send({ type: 'submit-vote', point });
  }
}
function editTitle() { editingTitle.value = true; titleInput.value = title.value; }
function cancelEdit() { editingTitle.value = false; titleInput.value = title.value; }
function saveTitle() { send({ type: 'update-title', title: titleInput.value }); editingTitle.value = false; }
let timerInterval = null;
let timerHeld = false;

function incrementTimer(once = false) {
  if (votingDuration.value < 120) votingDuration.value++;
}
function decrementTimer(once = false) {
  if (votingDuration.value > 5) votingDuration.value--;
}
function startHoldTimer(type) {
  timerHeld = true;
  timerInterval = setInterval(() => {
    if (!timerHeld) return;
    if (type === 'inc') incrementTimer();
    if (type === 'dec') decrementTimer();
  }, 90);
}
function stopHoldTimer(type, event) {
  if (timerHeld) {
    timerHeld = false;
    if (timerInterval) clearInterval(timerInterval);
    // If this was a quick click (not a hold), do a single increment/decrement
    if (event && event.type === 'mouseup' || event.type === 'touchend') {
      if (type === 'inc') incrementTimer(true);
      if (type === 'dec') decrementTimer(true);
    }
  }
}

function promoteMember(targetName) {
  send({ type: 'promote-member', userName: targetName });
}

function skipTimer() {
  send({ type: 'skip-timer' });
}

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
  // Voting in progress: show spinner or checkmark
  if (voting.value.active) {
    return members.value.map(memberName => {
      const hasVoted = votedMembers.value.has(memberName);
      // If results.value exists, show nothing (shouldn't happen here)
      return { name: memberName, vote: hasVoted ? 'voted' : 'pending', mark: '' };
    });
  }
  // Default: no votes yet
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
  position: relative;
}
.session-title {
  margin: 0 auto;
  color: #60a5fa;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  word-break: break-word;
  background: none;
  position: relative;
  z-index: 1;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  transition: background 0.15s, color 0.15s, border 0.15s;
}
.btn-voted {
  background: #2563eb !important;
  color: #fff !important;
  border: 2px solid #60a5fa !important;
  font-weight: bold;
  box-shadow: 0 0 0 2px #60a5fa33;
  z-index: 1;
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
.voting-timer-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.voting-timer-custom-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #181c24;
  border: 1px solid #374151;
  border-radius: 4px;
  height: 2.5rem;
  margin-right: 0.25rem;
}
.voting-timer-input-custom {
  width: 56px;
  background: transparent;
  color: #f3f4f6;
  border: none;
  text-align: center;
  font-size: 1rem;
  height: 2.5rem;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
}
.voting-timer-s {
  font-size: 0.95em;
  color: #a1a1aa;
  margin-left: 2px;
  font-weight: 500;
}
.voting-timer-incdec {
  width: 2.2rem;
  height: 2.5rem;
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  border-radius: 4px;
}
.voting-timer-incdec:hover, .voting-timer-incdec:focus {
  background: #23283a;
}
.voting-timer-btn {
  height: 2.5rem;
  padding: 0 1.25rem;
  font-size: 1rem;
  margin-left: 0.25rem;
  display: flex;
  align-items: center;
}
.session-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;
}
.session-code-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.share-btn-row { display: none; }
.share-btn {
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  padding: 0.45rem 0.55rem;
  border-radius: 7px;
  transition: background 0.15s, box-shadow 0.15s, border 0.15s;
  z-index: 2;
  display: flex;
  align-items: center;
  font-size: 1.7rem;
  box-shadow: none;
}
.share-btn:hover, .share-btn:focus {
  background: #23283a;
  box-shadow: 0 1px 2px rgba(20,22,30,0.98);
  border: none;
}
.share-feedback {
  color: #60a5fa;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  text-align: right;
  font-weight: 500;
  letter-spacing: 0.01em;
  position: absolute;
  right: 0.5rem;
  top: 2.2rem;
  background: #181c24;
  padding: 0.18rem 0.6rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  z-index: 10;
  white-space: nowrap;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.session-title-row {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 2.5rem;
}
.goto-jira-btn {
  position: absolute;
  right: 0.2rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  padding: 0.22rem 0.28rem;
  border-radius: 7px;
  transition: background 0.15s;
  font-size: 1.25rem;
  text-decoration: none;
  z-index: 2;
}
.goto-jira-btn:hover, .goto-jira-btn:focus {
  background: #23283a;
  box-shadow: 0 1px 2px rgba(10,12,18,0.48);
}
.edit-title-icon-btn {
  position: absolute;
  left: 0.2rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  padding: 0.32rem 0.38rem;
  border-radius: 7px;
  transition: background 0.15s, box-shadow 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  font-size: 1.55rem;
  margin-left: 0;
  z-index: 3;
}
.edit-title-icon-btn:hover, .edit-title-icon-btn:focus {
  background: #23283a;
  box-shadow: 0 1px 2px rgba(20,22,30,0.98);
}
.join-name-input {
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
}
.copy-btn-group {
  display: inline-flex;
  align-items: center;
  position: relative;
}
.copy-btn {
  background: none !important;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  padding: 0.45rem 0.55rem;
  border-radius: 7px;
  transition: background 0.15s, box-shadow 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  margin-left: 0.12rem;
  font-size: 1.7rem;
  box-shadow: none;
  vertical-align: middle;
}
.copy-btn:hover, .copy-btn:focus {
  background: #23283a !important;
  box-shadow: 0 1px 2px rgba(20,22,30,0.98);
  border: none;
}
.copy-feedback-popup {
  color: #60a5fa;
  font-size: 0.95rem;
  text-align: right;
  font-weight: 500;
  letter-spacing: 0.01em;
  position: absolute;
  left: 110%;
  top: 50%;
  transform: translateY(-50%);
  background: #181c24;
  padding: 0.18rem 0.6rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(20,22,30,0.98);
  z-index: 10;
  white-space: nowrap;
}
.promote-btn {
  background: none;
  border: none;
  padding: 0 0 0 4px;
  cursor: pointer;
  vertical-align: middle;
  outline: none;
  transition: box-shadow 0.15s;
}
.promote-btn:hover, .promote-btn:focus {
  box-shadow: 0 0 4px #23283a;
  background: #181c24;
  border-radius: 4px;
}
.skip-timer-btn {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  vertical-align: middle;
  outline: none;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s, box-shadow 0.15s;
  display: inline-flex;
  align-items: center;
}
.skip-timer-btn:hover, .skip-timer-btn:focus {
  background: #181c24;
  box-shadow: 0 0 4px #23283a;
}
.skip-timer-label {
  margin-left: 2px;
  color: #fbbf24;
  font-size: 1em;
  font-weight: 500;
}
.vote-status-icon { display: inline-block; vertical-align: middle; margin-left: 2px; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style> 