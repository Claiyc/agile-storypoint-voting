<template>
  <div class="app-bg">
    <!-- Modern dark background pattern -->
    <div class="pattern-bg"></div>
    <!-- Header for the Agile Story Point Voting System -->
    <header class="header">
      <h1 class="title">Agile Story Point Voting</h1>
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
  overflow: hidden;
}
body {
  background: #181c24;
  color: #f3f4f6;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  min-height: 100vh;
  min-width: 100vw;
  overflow: hidden;
}
.app-bg {
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  background: #181c24;
  color: #f3f4f6;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.pattern-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  background-color: transparent;
  background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 24px), repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 24px);
}
.header {
  z-index: 100;
  width: 100%;
  padding: 1.5rem 1rem 0.5rem 1rem;
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
  height: 3.5rem;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.02em;
  color: #60a5fa;
  text-align: center;
  padding: 0.5rem 2rem 0.5rem 2rem;
  border-radius: 10px;
  background: rgba(35,40,58,0.7);
  margin: 0 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  display: inline-block;
}
.main {
  z-index: 10;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50vw;
  max-width: 600px;
  margin: 0 auto;
  height: 100vh;
  padding-top: 3.5rem;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
