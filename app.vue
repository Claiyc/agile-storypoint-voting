<template>
  <div class="app-bg">
    <div class="pattern-bg"></div>
    <div class="app-content">
      <NuxtPage />
    </div>
  </div>
</template>

<style>
html, body, #__nuxt {
  min-height: 100vh;
  min-width: 100vw;
  background: #181c24 !important;
  margin: 0;
  padding: 0;
}
.app-bg {
  min-height: 100vh;
  min-width: 100vw;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #181c24;
  overflow-x: hidden;
}
.pattern-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 40px),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1.5px, transparent 1.5px 30px),
    linear-gradient(120deg, #232946 0%, #181c24 100%);
  opacity: 1;
  width: 100vw;
  height: 100vh;
}
.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

<script setup>
// This is the root layout for the Nuxt app. All pages will be rendered inside <NuxtPage />.
</script> 