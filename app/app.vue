<template>
  <div class="app-bg">
    <!-- Modern dark background pattern -->
    <div class="pattern-bg"></div>
    <!-- Header for the Agile Story Point Voting System -->
    <header class="header">
      <NuxtLink to="/" class="title clickable-title">Agile Story Point Voting</NuxtLink>
    </header>
    <!-- Nuxt page slot for rendering child pages -->
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
// This is the root layout for the Nuxt app. All pages will be rendered inside <NuxtPage />.
</script>

<style>
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}
body {
  background: #181c24;
  color: #f3f4f6;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
.app-bg {
  min-height: 100vh;
  width: 100vw;
  background: #181c24;
  color: #f3f4f6;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  overflow-x: hidden;
}
.pattern-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  background-color: transparent;
  background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 24px), repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 24px);
  width: 100vw;
  height: 100vh;
}
.header {
  z-index: 100;
  width: 100%;
  padding: 1.5rem 1rem 1.2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #23283a;
  background: rgba(24,28,36,0.85);
  backdrop-filter: blur(4px);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  margin-bottom: 0;
  height: 6rem;
  box-sizing: border-box;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.02em;
  color: #60a5fa;
  text-align: center;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border-radius: 10px;
  background: rgba(35,40,58,0.7);
  margin: 0 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  display: inline-block;
}
.title.clickable-title {
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
}
.title.clickable-title:hover, .title.clickable-title:focus {
  background: #23283a;
  color: #93c5fd;
}
.main {
  z-index: 10;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 4.5rem);
  padding-top: 5rem;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #374151 #181c24;
}

/* Special styling for welcome, create, and join pages */
.main.welcome-page,
.main.create-page,
.main.join-page {
  justify-content: center;
}

/* Custom scrollbar styling for webkit browsers */
.main::-webkit-scrollbar {
  width: 8px;
}

.main::-webkit-scrollbar-track {
  background: #181c24;
}

.main::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
