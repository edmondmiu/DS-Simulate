/**
 * DSE Memory Integration with BMad Agent System and Claude Code
 * Provides memory-aware agent capabilities for enhanced DSE workflows
 */
import { DSEMemoryManager } from './memory-manager.js';
import { DSEContextLoader } from './context-loader.js';
export class DSEAgentIntegration {
    memoryManager;
    contextLoader;
    currentSession;
    constructor() {
        this.memoryManager = new DSEMemoryManager();
        this.contextLoader = new DSEContextLoader();
        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            context: null,
            tasksCompleted: []
        };
    }
    /**
     * Initialize memory-aware agent session
     */
    async initializeSession(userQuery) {
        const context = this.inferContextFromQuery(userQuery);
        this.currentSession.context = context;
        // Log session start
        console.log(`🧠 DSE Memory System Activated - Session ${this.currentSession.sessionId}`);
        console.log(`📊 Loaded: ${context.relevantEpics.length} epics, ${context.relevantTasks.length} tasks, ${context.applicablePatterns.length} patterns`);
        if (context.suggestions.length > 0) {
            console.log(`💡 Suggestions based on past experience:`);
            context.suggestions.slice(0, 3).forEach((suggestion, i) => {
                console.log(`   ${i + 1}. ${suggestion}`);
            });
        }
        return context;
    }
    /**
     * Get memory-informed recommendations for current task
     */
    getTaskRecommendations(taskDescription, filesInvolved = []) {
        const context = this.currentSession.context;
        if (!context) {
            return { patterns: [], warnings: [], suggestions: [], relatedWork: [] };
        }
        const patterns = this.extractRelevantPatterns(taskDescription, context);
        const warnings = this.generateWarnings(taskDescription, context);
        const suggestions = this.contextLoader.generateContextualSuggestions(taskDescription, filesInvolved);
        const relatedWork = this.findRelatedWork(taskDescription, context);
        return { patterns, warnings, suggestions, relatedWork };
    }
    /**
     * Record task completion and learn from it
     */
    recordTaskCompletion(taskId, taskName, approach, filesModified, challenges = [], solutions = [], timeSpent = 0) {
        const task = {
            id: taskId,
            epicId: 'current', // Will be updated when epic is defined
            name: taskName,
            status: 'completed',
            timestamp: new Date().toISOString(),
            approach,
            challenges: challenges.map(desc => ({
                description: desc,
                category: 'technical',
                severity: 'moderate'
            })),
            solutions: solutions.map(sol => ({
                problem: 'General challenge',
                approach: sol,
                implementation: sol,
                effectiveness: 8,
                reusability: 'adaptable'
            })),
            timeSpent,
            filesModified,
            commandsUsed: [], // Can be enhanced to track actual commands
            toolsUtilized: ['Claude Code', 'DSE Memory System'],
            outcomes: [`Successfully completed: ${taskName}`],
            lessonsLearned: [],
            futureConsiderations: []
        };
        this.memoryManager.saveTaskMemory(task);
        this.currentSession.tasksCompleted.push(task);
        console.log(`📝 Task recorded: ${taskName} (${timeSpent}min)`);
    }
    /**
     * Apply Epic 4 knowledge to current task
     */
    applyEpic4Knowledge(currentTask) {
        const epic4 = this.memoryManager.loadEpicMemory('epic-4');
        if (!epic4)
            return [];
        const recommendations = [];
        // Color-related recommendations
        if (this.isColorRelated(currentTask)) {
            recommendations.push("Apply OKLCH color space for perceptual uniformity (Epic 4 learning)", "Use lightness range 15-95% for accessibility compliance", "Consider brand-specific chroma multipliers for theme variations", "Validate color relationships mathematically, not visually");
        }
        // Pipeline-related recommendations
        if (this.isPipelineRelated(currentTask)) {
            recommendations.push("Follow bidirectional pipeline pattern: sync → split → edit → consolidate", "Always create backups before major changes", "Test round-trip compatibility after modifications", "Maintain Token Studio format compliance");
        }
        // Architecture recommendations
        if (this.isArchitectureRelated(currentTask)) {
            recommendations.push("Use configuration separation pattern (.dse/ vs tokens/)", "Preserve existing workflows while adding new capabilities", "Design for future AI agent integration", "Maintain git-trackable and human-readable formats");
        }
        return recommendations;
    }
    /**
     * Get relevant documentation from memory
     */
    getRelevantDocumentation(topic) {
        const context = this.currentSession.context;
        if (!context)
            return [];
        const docs = [];
        context.relevantEpics.forEach(epic => {
            epic.artifacts
                .filter(artifact => artifact.type === 'documentation')
                .forEach(artifact => {
                if (artifact.path.toLowerCase().includes(topic.toLowerCase())) {
                    docs.push(`📄 ${artifact.path} - ${artifact.description}`);
                }
            });
        });
        return docs;
    }
    /**
     * Enhanced BMad command with memory integration
     */
    executeMemoryAwareCommand(command, context = '') {
        const insights = this.getMemoryInsights(command, context);
        const approach = this.suggestApproach(command, context);
        const risks = this.assessRisks(command, context);
        return {
            memoryInsights: insights,
            suggestedApproach: approach,
            riskAssessment: risks
        };
    }
    // Private helper methods
    generateSessionId() {
        return `dse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    inferContextFromQuery(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('color') || lowerQuery.includes('oklch') || lowerQuery.includes('accessibility')) {
            return this.contextLoader.loadColorContext();
        }
        if (lowerQuery.includes('token') || lowerQuery.includes('pipeline') || lowerQuery.includes('consolidate') || lowerQuery.includes('split')) {
            return this.contextLoader.loadPipelineContext();
        }
        if (lowerQuery.includes('figma') || lowerQuery.includes('token studio') || lowerQuery.includes('designer')) {
            return this.contextLoader.loadTokenStudioContext();
        }
        if (lowerQuery.includes('documentation') || lowerQuery.includes('guide') || lowerQuery.includes('help')) {
            return this.contextLoader.loadDocumentationContext();
        }
        if (lowerQuery.includes('error') || lowerQuery.includes('debug') || lowerQuery.includes('fix')) {
            return this.contextLoader.loadTroubleshootingContext();
        }
        // Default to epic planning context for general queries
        return this.contextLoader.loadEpicPlanningContext();
    }
    extractRelevantPatterns(task, context) {
        return context.applicablePatterns
            .filter(pattern => pattern.effectiveness >= 8)
            .map(pattern => `🔄 ${pattern.name}: ${pattern.description}`);
    }
    generateWarnings(task, context) {
        const warnings = [];
        // Check for common pitfalls from past tasks
        const commonChallenges = new Map();
        context.relevantTasks.forEach(task => {
            task.challenges.forEach(challenge => {
                const count = commonChallenges.get(challenge.description) || 0;
                commonChallenges.set(challenge.description, count + 1);
            });
        });
        commonChallenges.forEach((count, challenge) => {
            if (count >= 2) {
                warnings.push(`⚠️  Common challenge: ${challenge}`);
            }
        });
        return warnings;
    }
    findRelatedWork(task, context) {
        const related = [];
        context.relevantEpics.forEach(epic => {
            if (epic.status === 'completed') {
                related.push(`📊 Epic ${epic.id}: ${epic.name} - ${epic.outcomes.length} outcomes achieved`);
            }
        });
        return related.slice(0, 3); // Limit to most relevant
    }
    isColorRelated(task) {
        const colorKeywords = ['color', 'oklch', 'accessibility', 'brand', 'theme', 'palette'];
        return colorKeywords.some(keyword => task.toLowerCase().includes(keyword));
    }
    isPipelineRelated(task) {
        const pipelineKeywords = ['pipeline', 'consolidate', 'split', 'token', 'sync', 'workflow'];
        return pipelineKeywords.some(keyword => task.toLowerCase().includes(keyword));
    }
    isArchitectureRelated(task) {
        const archKeywords = ['architecture', 'structure', 'design', 'system', 'integration', 'agent'];
        return archKeywords.some(keyword => task.toLowerCase().includes(keyword));
    }
    getMemoryInsights(command, context) {
        const epic4 = this.memoryManager.loadEpicMemory('epic-4');
        if (!epic4)
            return [];
        const insights = [];
        epic4.learnings
            .filter(learning => learning.importance === 'critical' || learning.importance === 'high')
            .forEach(learning => {
            if (command.toLowerCase().includes(learning.category) ||
                context.toLowerCase().includes(learning.category)) {
                insights.push(`🧠 ${learning.description}`);
            }
        });
        return insights;
    }
    suggestApproach(command, context) {
        const approaches = [];
        if (this.isColorRelated(command + ' ' + context)) {
            approaches.push("Start with OKLCH color space definitions", "Validate accessibility compliance early", "Test across all brand themes");
        }
        if (this.isPipelineRelated(command + ' ' + context)) {
            approaches.push("Begin with sync to get latest state", "Use split for modular editing", "Validate with consolidate and test");
        }
        return approaches;
    }
    assessRisks(command, context) {
        const risks = [];
        if (command.includes('modify') || command.includes('change')) {
            risks.push("🚨 Ensure backup creation before modifications");
            risks.push("🚨 Validate round-trip compatibility after changes");
        }
        if (command.includes('token') || command.includes('color')) {
            risks.push("🚨 Maintain Token Studio compatibility");
            risks.push("🚨 Verify accessibility compliance");
        }
        return risks;
    }
}
//# sourceMappingURL=agent-integration.js.map