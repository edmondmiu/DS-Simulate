<template>
  <div class="documentation-viewer">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Epic 4 Features - OKLCH Color Management
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete Token Studio integration with advanced OKLCH color science. Enhanced accessibility and perceptual uniformity while preserving your existing workflow.
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-6">
        <nav class="flex space-x-8 py-4">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              activeSection === section.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            {{ section.title }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="sticky top-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ getCurrentSection().title }}
            </h3>
            <nav class="space-y-2">
              <a
                v-for="item in getCurrentSection().items"
                :key="item.id"
                @click="loadDocumentation(item.id)"
                :class="[
                  'block px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors',
                  activeDoc === item.id
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                ]"
              >
                {{ item.title }}
              </a>
            </nav>
          </div>
        </div>

        <!-- Documentation Content -->
        <div class="lg:col-span-3">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span class="ml-2 text-gray-600 dark:text-gray-300">Loading documentation...</span>
          </div>
          
          <div v-else-if="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Documentation</h3>
            <p class="text-red-600 dark:text-red-300">{{ error }}</p>
          </div>

          <div v-else class="prose prose-lg max-w-none dark:prose-invert markdown-body">
            <!-- Epic 4 Features Section -->
            <div v-if="activeDoc === 'epic-4-features'">
              <Epic4Features />
            </div>

            <!-- Designer Setup Section -->
            <div v-else-if="activeDoc === 'designer-setup'">
              <DesignerSetup />
            </div>

            <!-- Designer Quick Reference Section -->
            <div v-else-if="activeDoc === 'designer-quickref'">
              <DesignerQuickRef />
            </div>

            <!-- DSE Utilities Section -->
            <div v-else-if="activeDoc === 'dse-utilities'">
              <DSEUtilities />
            </div>

            <!-- Roadmap Section -->
            <div v-else-if="activeDoc === 'roadmap'">
              <Roadmap />
            </div>

            <!-- Default Overview -->
            <div v-else>
              <div class="text-center py-12">
                <div class="text-6xl mb-6">🎯</div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Epic 4 Complete - OKLCH Color Management
                </h2>
                <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Enhanced Token Studio workflow with advanced color science. Zero workflow disruption, maximum color quality.
                </p>
                
                <!-- Feature Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="text-3xl mb-3">🎨</div>
                    <h3 class="text-lg font-semibold mb-2">Epic 4 Features</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      OKLCH color science integration with enhanced accessibility and perceptual uniformity
                    </p>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="text-3xl mb-3">🔗</div>
                    <h3 class="text-lg font-semibold mb-2">Token Studio Setup</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      Complete guide for connecting to the 662-token Epic 4 design system
                    </p>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="text-3xl mb-3">⚡</div>
                    <h3 class="text-lg font-semibold mb-2">Quick Reference</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      5-minute Epic 4 testing checklist and essential token patterns
                    </p>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="text-3xl mb-3">🛠️</div>
                    <h3 class="text-lg font-semibold mb-2">DSE Utilities</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      Advanced research tools for Design System Engineers and color analysis
                    </p>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="text-3xl mb-3">🗺️</div>
                    <h3 class="text-lg font-semibold mb-2">Roadmap & Status</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">
                      Project status, completed epics, and future development roadmap
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Import markdown files as Vue components via symlink
import Epic4Features from '../docs/tools/EPIC_4_FEATURES.md';
import DesignerSetup from '../docs/DESIGNER_SETUP.md';
import DesignerQuickRef from '../docs/DESIGNER_QUICK_REFERENCE.md';
import DSEUtilities from '../docs/tools/DSE_UTILITIES_REFERENCE.md';
import Roadmap from '../docs/ROADMAP.md';

// State
const activeSection = ref('epic-4');
const activeDoc = ref('overview');
const loading = ref(false);
const error = ref(null);

// Documentation sections
const sections = [
  {
    id: 'epic-4',
    title: 'Epic 4 Features',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'epic-4-features', title: 'OKLCH Color Management' }
    ]
  },
  {
    id: 'designer-workflow',
    title: 'Designer Workflow',
    items: [
      { id: 'designer-setup', title: 'Token Studio Setup' },
      { id: 'designer-quickref', title: 'Quick Reference' }
    ]
  },
  {
    id: 'dse-tools',
    title: 'DSE Utilities',
    items: [
      { id: 'dse-utilities', title: 'Research Tools' }
    ]
  },
  {
    id: 'project-info',
    title: 'Project Information',
    items: [
      { id: 'roadmap', title: 'Roadmap & Status' }
    ]
  }
];

// Computed properties
const getCurrentSection = () => {
  return sections.find(section => section.id === activeSection.value) || sections[0];
};

// Methods
const loadDocumentation = (docId) => {
  loading.value = true;
  error.value = null;
  
  try {
    activeDoc.value = docId;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      loading.value = false;
    }, 300);
  } catch (err) {
    error.value = `Failed to load documentation: ${err.message}`;
    loading.value = false;
  }
};

// Initialize
onMounted(() => {
  // Set default documentation
  activeDoc.value = 'overview';
});
</script>

<style scoped>
.documentation-viewer {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

/* Enhanced markdown styling */
.markdown-body {
  @apply text-gray-900 dark:text-gray-100;
}

.markdown-body h1 {
  @apply text-3xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6;
}

.markdown-body h2 {
  @apply text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4;
}

.markdown-body h3 {
  @apply text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3;
}

.markdown-body code {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm;
}

.markdown-body pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

.markdown-body pre code {
  @apply bg-transparent p-0;
}

.markdown-body blockquote {
  @apply border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-300;
}

.markdown-body table {
  @apply w-full border-collapse border border-gray-200 dark:border-gray-700;
}

.markdown-body th,
.markdown-body td {
  @apply border border-gray-200 dark:border-gray-700 px-4 py-2;
}

.markdown-body th {
  @apply bg-gray-50 dark:bg-gray-800 font-semibold;
}

.markdown-body a {
  @apply text-primary-600 dark:text-primary-400 hover:underline;
}

.markdown-body ul,
.markdown-body ol {
  @apply ml-6 mb-4;
}

.markdown-body li {
  @apply mb-2;
}

/* Custom syntax highlighting for code blocks */
.markdown-body .hljs {
  @apply bg-gray-900 text-gray-100;
}
</style>