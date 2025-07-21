<template>
  <div class="min-h-screen bg-dark text-white font-sans flex flex-col items-center justify-center relative overflow-x-hidden">
    <!-- Modern dark background pattern -->
    <div class="fixed inset-0 z-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 opacity-95 pointer-events-none"></div>
    <!-- Header for the Agile Story Point Voting System -->
    <header class="z-10 w-full py-6 px-4 flex justify-center items-center border-b border-dark-800 bg-dark/80 backdrop-blur sticky top-0">
      <h1 class="text-3xl font-bold tracking-tight text-accent">Agile Story Point Voting</h1>
    </header>
    <!-- Nuxt page slot for rendering child pages -->
    <main class="z-10 flex-1 w-full flex flex-col items-center justify-center">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
// This is the root layout for the Nuxt app. All pages will be rendered inside <NuxtPage />.
</script>
