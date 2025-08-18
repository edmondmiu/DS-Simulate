<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-surface-900 dark:to-surface-800">
    <!-- Hero Section -->
    <section class="relative py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center">
          <div class="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-6">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Epic 4 V2 Complete - Two-Repo Architecture
          </div>
          
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simulate DS V2
            <span class="text-primary-500">Epic 4 V2</span>
          </h1>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Two-Repo Architecture | OKLCH Color Science | Token Studio Integration
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="$emit('show-testing')" class="btn-primary text-lg px-8 py-3">
              Start Epic 4 Testing
            </button>
            <button @click="scrollToFeatures" class="btn-secondary text-lg px-8 py-3">
              Explore Features
            </button>
          </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-500">25</div>
            <div class="text-gray-600 dark:text-gray-400">Color Families</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-500">2</div>
            <div class="text-gray-600 dark:text-gray-400">Repositories</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-500">3</div>
            <div class="text-gray-600 dark:text-gray-400">Brand Variants</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-500">AA+</div>
            <div class="text-gray-600 dark:text-gray-400">OKLCH Optimized</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white dark:bg-surface-800">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Epic 4 Key Features
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Advanced color science meets practical design system needs
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              OKLCH Color Science
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Perceptually uniform color processing for enhanced accessibility and visual harmony
            </p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Multi-Brand Architecture
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Support for unlimited brands with perfect light/dark mode implementations
            </p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Enhanced Accessibility
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              WCAG AA compliance through scientific color optimization and validation
            </p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Zero Workflow Disruption
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              100% Token Studio compatibility preserves existing designer workflows
            </p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              DSE Architecture
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Clean separation between DSE configurations and Token Studio files
            </p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Production Ready
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Comprehensive testing, validation, and documentation for immediate use
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Advanced Color Science Section -->
    <section class="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">
            🔬 Advanced Color Science Tools
          </h2>
          <p class="text-xl text-primary-100 max-w-3xl mx-auto">
            Mathematical precision meets design intuition with OKLCH color space analysis and generation tools
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Visual Demo -->
          <div>
            <div class="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
              <h3 class="text-2xl font-semibold mb-4">🎨 OKLCH vs Traditional RGB</h3>
              <div class="space-y-4">
                <!-- RGB Progression -->
                <div>
                  <div class="text-sm text-primary-100 mb-2">Traditional RGB Progression:</div>
                  <div class="flex space-x-1">
                    <div class="w-8 h-8 rounded" style="background-color: #FF0000"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #CC0000"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #990000"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #660000"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #330000"></div>
                  </div>
                  <div class="text-xs text-primary-200 mt-1">❌ Uneven visual steps</div>
                </div>
                
                <!-- OKLCH Progression -->
                <div>
                  <div class="text-sm text-primary-100 mb-2">OKLCH Perceptual Progression:</div>
                  <div class="flex space-x-1">
                    <div class="w-8 h-8 rounded" style="background-color: #FF4444"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #DD3333"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #BB2222"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #991111"></div>
                    <div class="w-8 h-8 rounded" style="background-color: #770000"></div>
                  </div>
                  <div class="text-xs text-primary-200 mt-1">✅ Perceptually uniform steps</div>
                </div>
              </div>
            </div>
            
            <!-- Tool Capabilities -->
            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 class="text-xl font-semibold mb-4">⚡ Tool Capabilities</h3>
              <div class="space-y-3 text-sm">
                <div class="flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Mathematical color ramp generation
                </div>
                <div class="flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Perceptual uniformity validation
                </div>
                <div class="flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  3D surface effect optimization
                </div>
                <div class="flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  WCAG accessibility analysis
                </div>
                <div class="flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Multi-theme generation
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right: Tool Features -->
          <div class="space-y-6">
            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 class="text-xl font-semibold mb-3">
                🧪 Precise Color Analysis
              </h3>
              <p class="text-primary-100 mb-4 text-sm">
                Mathematical validation of color relationships and accessibility compliance
              </p>
              <div class="bg-black/20 rounded p-3 text-xs font-mono">
                <div class="text-green-300">$ node scripts/precise-color-analysis.cjs</div>
                <div class="text-gray-300 mt-1">✅ Surface400/500: Δ1.2% (SUBTLE)</div>
                <div class="text-gray-300">✅ WCAG AA: 94% compliance</div>
                <div class="text-gray-300">✅ Mathematical generation: FEASIBLE</div>
              </div>
            </div>
            
            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 class="text-xl font-semibold mb-3">
                🎨 OKLCH Color Generator
              </h3>
              <p class="text-primary-100 mb-4 text-sm">
                Generate perceptually uniform color ramps with mathematical precision
              </p>
              <div class="bg-black/20 rounded p-3 text-xs font-mono">
                <div class="text-green-300">$ node scripts/oklch-color-generator.cjs</div>
                <div class="text-gray-300 mt-1">Generated 9-step brand ramp:</div>
                <div class="text-gray-300">• Lightness: 15% → 95% (uniform)</div>
                <div class="text-gray-300">• Accessibility: All AA compliant</div>
              </div>
            </div>
            
            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 class="text-xl font-semibold mb-3">
                📚 Complete Documentation
              </h3>
              <p class="text-primary-100 mb-4 text-sm">
                Comprehensive guides, API references, and real-world examples
              </p>
              <div class="flex space-x-3">
                <button 
                  @click="$emit('show-color-tools')"
                  class="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  View Documentation
                </button>
                <button 
                  @click="$emit('show-testing')"
                  class="border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Try Tools
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Technical Highlights -->
        <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-2">OKLCH</div>
            <div class="text-primary-100 text-sm">Perceptually uniform color space</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-2">&lt;5%</div>
            <div class="text-primary-100 text-sm">Lightness difference for 3D effects</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-2">AA+</div>
            <div class="text-primary-100 text-sm">WCAG compliance by design</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section class="py-20 bg-gray-50 dark:bg-surface-900">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Test Simulate DS V2 Epic 4?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Get started with the Epic 4 MVP testing in just 5 minutes
          </p>
        </div>
        
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                For Designers
              </h3>
              <ul class="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Install Token Studio in Figma
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Connect to GitHub repository
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Import 662 Epic 4 tokens
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Test all 4 theme variations
                </li>
              </ul>
              <button @click="$emit('show-testing')" class="btn-primary w-full">
                Start Testing Now
              </button>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Connection
              </h3>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Token Source URL:</div>
                <code class="text-xs break-all">
                  https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
                </code>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">Tokens</div>
                  <div class="text-primary-600">662 tokens</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">File Size</div>
                  <div class="text-primary-600">154KB</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">Token Sets</div>
                  <div class="text-primary-600">9 sets</div>
                </div>
                <div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">Load Time</div>
                  <div class="text-primary-600">30-60s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-white dark:bg-surface-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              Simulate DS V2 Epic 4
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              OKLCH Color Management | Enhanced Accessibility
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <a href="https://github.com/edmondmiu/DS-Simulate" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              GitHub
            </a>
            <a href="#" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Documentation
            </a>
            <span class="status-indicator status-pass">Epic 4 Complete</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const scrollToFeatures = () => {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
};

defineEmits(['show-testing', 'show-color-tools']);
</script>