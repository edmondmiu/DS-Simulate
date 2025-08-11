<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Simulate DS V2 Epic 4 Testing Results
      </h1>
      <p class="text-gray-600 dark:text-gray-300 text-lg">
        Real-time dashboard showing designer testing feedback and analytics
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <div class="animate-pulse">
        <div class="text-4xl mb-4">📊</div>
        <p class="text-gray-600 dark:text-gray-300">Loading testing results...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-center py-8">
      <div class="text-4xl mb-4">⚠️</div>
      <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Results</h3>
      <p class="text-red-600 dark:text-red-300">{{ error }}</p>
      <button @click="loadResults" class="btn-primary mt-4">Retry</button>
    </div>

    <!-- Analytics Overview -->
    <div v-else-if="analytics" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card text-center">
        <div class="text-3xl font-bold text-primary-500 mb-2">{{ analytics.totalSubmissions }}</div>
        <div class="text-gray-600 dark:text-gray-400">Total Submissions</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-green-500 mb-2">{{ analytics.averageSuccessRate }}%</div>
        <div class="text-gray-600 dark:text-gray-400">Average Success Rate</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-blue-500 mb-2">{{ analytics.todaySubmissions }}</div>
        <div class="text-gray-600 dark:text-gray-400">Today's Tests</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-purple-500 mb-2">{{ completedTestsAvg }}</div>
        <div class="text-gray-600 dark:text-gray-400">Avg Tests Completed</div>
      </div>
    </div>

    <!-- Recent Results -->
    <div v-if="testResults.length > 0" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Recent Test Submissions</h2>
        <div class="text-sm text-gray-500">{{ testResults.length }} results found</div>
      </div>

      <!-- Results List -->
      <div class="space-y-4">
        <div
          v-for="result in testResults"
          :key="result.id"
          class="card hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
                {{ result.testerInfo.name }}
              </h3>
              <div class="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span>{{ formatDate(result.timestamp) }}</span>
                <span>{{ result.testerInfo.figmaVersion || 'N/A' }}</span>
                <span>{{ result.testerInfo.tokenStudioVersion || 'N/A' }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="status-indicator" :class="getStatusClass(result.summary.passPercentage)">
                {{ result.summary.passPercentage }}% Success
              </div>
              <div class="text-sm text-gray-500 mt-1">
                {{ result.summary.completedTests }}/{{ result.summary.totalTests }} completed
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar mb-4">
            <div 
              class="progress-fill" 
              :style="{ width: `${result.summary.completionPercentage}%` }"
            ></div>
          </div>

          <!-- Test Summary -->
          <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div class="text-center">
              <div class="font-semibold text-green-600">{{ result.summary.passedTests }}</div>
              <div class="text-gray-500">Passed</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-red-600">{{ result.summary.failedTests }}</div>
              <div class="text-gray-500">Failed</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-600">{{ result.summary.totalTests - result.summary.completedTests }}</div>
              <div class="text-gray-500">Skipped</div>
            </div>
          </div>

          <!-- Test Details with Comments -->
          <div class="mt-4 space-y-2">
            <!-- Failed Tests -->
            <div v-if="result.summary.failedTests > 0">
              <details class="group">
                <summary class="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700 mb-2">
                  View Failed Tests ({{ result.summary.failedTests }})
                </summary>
                <div class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
                  <div v-for="(status, testId) in result.testResults" :key="testId">
                    <div v-if="status === 'fail'" class="text-sm">
                      <div class="font-medium text-red-800 dark:text-red-200">{{ getTestName(testId) }}</div>
                      <div v-if="result.testNotes && result.testNotes[testId]" class="text-red-600 dark:text-red-300 mt-1 italic">
                        "{{ result.testNotes[testId] }}"
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <!-- All Comments (including passed tests) -->
            <div v-if="hasComments(result)">
              <details class="group">
                <summary class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 mb-2">
                  View All Comments ({{ getCommentCount(result) }})
                </summary>
                <div class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                  <div v-for="(comment, testId) in result.testNotes" :key="testId" class="text-sm">
                    <div class="flex items-start space-x-2">
                      <div :class="[
                        'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                        result.testResults[testId] === 'pass' ? 'bg-green-500' : 'bg-red-500'
                      ]"></div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 dark:text-gray-200">{{ getTestName(testId) }}</div>
                        <div class="text-gray-600 dark:text-gray-300 mt-1 italic">
                          "{{ comment }}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <!-- Contact Info -->
          <div v-if="result.testerInfo.email" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Contact: <a :href="`mailto:${result.testerInfo.email}`" class="text-primary-600 hover:text-primary-700">{{ result.testerInfo.email }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Test Results Yet</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Results will appear here once designers start submitting Epic 4 tests.
      </p>
      <button @click="$emit('show-testing')" class="btn-primary">
        Go to Testing Portal
      </button>
    </div>

    <!-- Export Options -->
    <div v-if="testResults.length > 0" class="card mt-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Export Results</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Download testing data for analysis</p>
        </div>
        <div class="space-x-3">
          <button @click="exportToCSV" class="btn-secondary">
            Export CSV
          </button>
          <button @click="exportToJSON" class="btn-secondary">
            Export JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFirebase } from '../composables/useFirebase.js';
import { testingPhases } from '../data/testingChecklist.js';

const { getAllTestResults, testResults, loading, error, analytics } = useFirebase();

defineEmits(['show-testing']);

// Computed properties
const completedTestsAvg = computed(() => {
  if (testResults.value.length === 0) return 0;
  const total = testResults.value.reduce((sum, result) => sum + result.summary.completedTests, 0);
  return Math.round(total / testResults.value.length);
});

// Methods
const loadResults = () => {
  getAllTestResults();
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleString();
};

const getStatusClass = (percentage) => {
  if (percentage >= 90) return 'status-pass';
  if (percentage >= 70) return 'status-pending';
  return 'status-fail';
};

const getTestName = (testId) => {
  for (const phase of testingPhases) {
    const test = phase.tests.find(t => t.id === testId);
    if (test) return test.name;
  }
  return testId;
};

const hasComments = (result) => {
  return result.testNotes && Object.keys(result.testNotes).length > 0;
};

const getCommentCount = (result) => {
  return result.testNotes ? Object.keys(result.testNotes).length : 0;
};

const exportToCSV = () => {
  const headers = ['Name', 'Email', 'Date', 'Figma Version', 'Token Studio Version', 'Completion %', 'Success %', 'Passed', 'Failed', 'Failed Tests', 'All Comments'];
  const rows = testResults.value.map(result => {
    // Get failed test names
    const failedTests = Object.entries(result.testResults || {})
      .filter(([_, status]) => status === 'fail')
      .map(([testId]) => getTestName(testId))
      .join(', ');
    
    // Get all comments with test names
    const allComments = Object.entries(result.testNotes || {})
      .map(([testId, comment]) => `${getTestName(testId)}: ${comment}`)
      .join(' | ');
    
    return [
      result.testerInfo.name,
      result.testerInfo.email || '',
      formatDate(result.timestamp),
      result.testerInfo.figmaVersion || 'Latest (Cloud)',
      result.testerInfo.tokenStudioVersion || 'Latest (Cloud)',
      result.summary.completionPercentage,
      result.summary.passPercentage,
      result.summary.passedTests,
      result.summary.failedTests,
      failedTests,
      allComments
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\\n');

  downloadFile(`simulate-ds-v2-epic4-results-${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'text/csv');
};

const exportToJSON = () => {
  const data = {
    exportDate: new Date().toISOString(),
    analytics: analytics.value,
    results: testResults.value
  };
  
  downloadFile(`simulate-ds-v2-epic4-results-${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(data, null, 2), 'application/json');
};

const downloadFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Initialize
onMounted(() => {
  loadResults();
});
</script>