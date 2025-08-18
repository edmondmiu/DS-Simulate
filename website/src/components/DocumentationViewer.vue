<template>
  <div class="documentation-viewer">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Epic 4 V2 Documentation
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Two-repository architecture with 25 OKLCH-optimized color families. Enhanced Token Studio integration with mathematical color consistency.
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Architecture Overview -->
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🏗️ Two-Repository Architecture
          </h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-300">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">DS-SimulateV2 (Clean Repo)</h3>
              <p>• Token Studio integration point</p>
              <p>• Minimal structure (tokens/ + README)</p>
              <p>• Direct file integration with Figma</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">DS-Simulate (DSE Repo)</h3>
              <p>• Full development environment</p>
              <p>• Epic 4 V2 documentation and tooling</p>
              <p>• OKLCH processing and automation</p>
            </div>
          </div>
        </div>

        <!-- Key Features -->
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ Key Features
          </h2>
          <div class="space-y-3 text-gray-600 dark:text-gray-300">
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              25 OKLCH-optimized color families
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Multi-brand support (Base, Logifuture, Bet9ja)
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              WCAG AA+ accessibility compliance
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Mathematical color consistency
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Zero workflow disruption for designers
            </div>
          </div>
        </div>

        <!-- Resources -->
        <div class="card lg:col-span-2">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Resources
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Token Studio Setup</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Connect to DS-SimulateV2 repository for direct file integration</p>
              <a href="https://github.com/edmondmiu/DS-SimulateV2" target="_blank" 
                 class="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm">
                View Clean Repo →
              </a>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Development Environment</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Full DSE tooling and Epic 4 V2 documentation</p>
              <a href="https://github.com/edmondmiu/DS-Simulate" target="_blank" 
                 class="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm">
                View DSE Repo →
              </a>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Live Testing</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Interactive Epic 4 V2 testing portal</p>
              <button @click="$emit('show-testing')" 
                      class="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm">
                Start Testing →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Back Button -->
    <div class="max-w-7xl mx-auto px-6 pb-8">
      <button
        @click="$emit('close')"
        class="btn-secondary"
      >
        ← Back to Showcase
      </button>
    </div>
  </div>
</template>

<script setup>
// Simplified Epic 4 V2 documentation component
// Detailed documentation removed during project cleanup
const emit = defineEmits(['close', 'show-testing']);
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.btn-secondary {
  @apply px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}
</style>