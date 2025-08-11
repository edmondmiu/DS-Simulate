<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Simulate DS V2 Epic 4 Testing Portal
      </h1>
      <p class="text-gray-600 dark:text-gray-300 text-lg">
        OKLCH Color Management | Enhanced Accessibility | Multi-Brand Token Pipeline
      </p>
      
      <!-- Progress Overview -->
      <div class="mt-6 card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Testing Progress</h2>
          <div class="text-sm text-gray-500">
            {{ summary.completedTests }} / {{ summary.totalTests }} tests completed
          </div>
        </div>
        
        <div class="progress-bar mb-4">
          <div 
            class="progress-fill" 
            :style="{ width: `${summary.completionPercentage}%` }"
          ></div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-primary-500">{{ summary.completionPercentage }}%</div>
            <div class="text-sm text-gray-500">Complete</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-500">{{ summary.passedTests }}</div>
            <div class="text-sm text-gray-500">Passed</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-500">{{ summary.failedTests }}</div>
            <div class="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tester Information Form -->
    <div class="card mb-8" v-if="!submitted">
      <h2 class="text-xl font-semibold mb-4">Tester Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name
          </label>
          <input
            v-model="testerInfo.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email (optional)
          </label>
          <input
            v-model="testerInfo.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800"
            placeholder="your.email@company.com"
          />
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
        <strong>Note:</strong> Using latest cloud-based Figma and Token Studio versions
      </p>
    </div>

    <!-- Testing Phases -->
    <div class="space-y-8">
      <div
        v-for="phase in testingPhases"
        :key="phase.id"
        class="card"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ phase.name }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              {{ phase.description }}
            </p>
          </div>
          <div class="text-sm text-gray-500">
            {{ getPhaseCompletedCount(phase.id) }} / {{ phase.tests.length }} completed
          </div>
        </div>

        <div class="space-y-6">
          <div
            v-for="test in phase.tests"
            :key="test.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ test.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {{ test.description }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="setTestResult(test.id, 'pass')"
                  :class="[
                    'px-3 py-1 text-xs rounded-full border',
                    testResults[test.id] === 'pass' 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'border-gray-300 text-gray-600 hover:bg-green-50'
                  ]"
                >
                  ✓ Pass
                </button>
                <button
                  @click="setTestResult(test.id, 'fail')"
                  :class="[
                    'px-3 py-1 text-xs rounded-full border',
                    testResults[test.id] === 'fail' 
                      ? 'bg-red-100 border-red-300 text-red-800' 
                      : 'border-gray-300 text-gray-600 hover:bg-red-50'
                  ]"
                >
                  ✗ Fail
                </button>
              </div>
            </div>

            <!-- Test Steps -->
            <details class="mt-3">
              <summary class="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700">
                View Test Steps
              </summary>
              <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="mb-3">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Steps:</h4>
                  <ol class="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li v-for="step in test.steps" :key="step">{{ step }}</li>
                  </ol>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Result:</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ test.expected }}</p>
                </div>
              </div>
            </details>

            <!-- Comments section for all tests -->
            <div v-if="testResults[test.id] !== null" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span v-if="testResults[test.id] === 'fail'" class="text-red-600">Comments (required for failed tests):</span>
                <span v-else>Comments (optional):</span>
              </label>
              <textarea
                v-model="testNotes[test.id]"
                rows="2"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 text-sm',
                  testResults[test.id] === 'fail' 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                ]"
                :placeholder="testResults[test.id] === 'fail' 
                  ? 'Describe the issue encountered...' 
                  : 'Any observations, suggestions, or additional feedback...'"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Section -->
    <div class="card mt-8" v-if="!submitted">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Submit Testing Results
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            Complete {{ summary.completedTests }}/{{ summary.totalTests }} tests • {{ summary.passPercentage }}% success rate
          </p>
        </div>
        <button
          @click="submitResults"
          :disabled="!canSubmit || loading"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Submitting...</span>
          <span v-else>Submit Results</span>
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="submitted" class="card bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
      <div class="text-center py-8">
        <div class="text-4xl mb-4">🎉</div>
        <h2 class="text-2xl font-semibold text-green-800 dark:text-green-200 mb-2">
          Testing Results Submitted!
        </h2>
        <p class="text-green-600 dark:text-green-300 mb-4">
          Thank you for testing Epic 4 MVP. Your feedback is valuable for the design system team.
        </p>
        <button @click="resetForm" class="btn-secondary">
          Test Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { testingPhases, getTestingSummary } from '../data/testingChecklist.js';
import { useFirebase } from '../composables/useFirebase.js';

const { submitTestResults, loading } = useFirebase();

// Reactive data
const testResults = reactive({});
const testNotes = reactive({});
const submitted = ref(false);
const testerInfo = reactive({
  name: '',
  email: ''
});

// Computed properties
const summary = computed(() => getTestingSummary(testResults));

const canSubmit = computed(() => {
  const hasRequiredInfo = testerInfo.name.trim() !== '';
  const hasMinimumTests = summary.value.completedTests >= 5; // At least 5 tests completed
  const allFailedTestsHaveNotes = Object.entries(testResults)
    .filter(([_, result]) => result === 'fail')
    .every(([testId]) => testNotes[testId]?.trim());
  
  return hasRequiredInfo && hasMinimumTests && allFailedTestsHaveNotes;
});

// Methods
const setTestResult = (testId, result) => {
  testResults[testId] = result;
  if (result !== 'fail' && testNotes[testId]) {
    delete testNotes[testId];
  }
};

const getPhaseCompletedCount = (phaseId) => {
  const phase = testingPhases.find(p => p.id === phaseId);
  return phase.tests.filter(test => testResults[test.id] !== null).length;
};

const submitResults = async () => {
  try {
    const submissionData = {
      testerInfo: { 
        ...testerInfo,
        figmaVersion: 'Latest (Cloud)',
        tokenStudioVersion: 'Latest (Cloud)'
      },
      testResults: { ...testResults },
      testNotes: { ...testNotes },
      summary: summary.value,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    await submitTestResults(submissionData);
    submitted.value = true;
  } catch (error) {
    alert('Failed to submit results. Please try again.');
    console.error('Submission error:', error);
  }
};

const resetForm = () => {
  Object.keys(testResults).forEach(key => delete testResults[key]);
  Object.keys(testNotes).forEach(key => delete testNotes[key]);
  Object.assign(testerInfo, { name: '', email: '' });
  submitted.value = false;
};

// Initialize test results
testingPhases.forEach(phase => {
  phase.tests.forEach(test => {
    testResults[test.id] = null;
  });
});
</script>