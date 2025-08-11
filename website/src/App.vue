<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-surface-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <div class="text-xl font-bold text-gray-900 dark:text-white">
              Simulate DS V2
            </div>
            <span class="status-indicator status-pass text-xs">
              Epic 4 Complete
            </span>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="currentView = 'showcase'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === 'showcase' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              ]"
            >
              Overview
            </button>
            <button
              @click="currentView = 'testing'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === 'testing' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              ]"
            >
              Testing Portal
            </button>
            <button
              @click="currentView = 'results'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === 'results' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              ]"
            >
              Results
            </button>
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <DesignSystemShowcase 
        v-if="currentView === 'showcase'" 
        @show-testing="currentView = 'testing'"
      />
      <TestingChecklist v-if="currentView === 'testing'" />
      <TestingResults 
        v-if="currentView === 'results'"
        @show-testing="currentView = 'testing'"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DesignSystemShowcase from './components/DesignSystemShowcase.vue';
import TestingChecklist from './components/TestingChecklist.vue';
import TestingResults from './components/TestingResults.vue';

const currentView = ref('showcase');
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  updateDarkMode();
  localStorage.setItem('darkMode', isDark.value.toString());
};

const updateDarkMode = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize dark mode from localStorage
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    isDark.value = savedDarkMode === 'true';
  } else {
    // Default to system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  updateDarkMode();
});
</script>