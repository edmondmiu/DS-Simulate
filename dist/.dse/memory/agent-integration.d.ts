/**
 * DSE Memory Integration with BMad Agent System and Claude Code
 * Provides memory-aware agent capabilities for enhanced DSE workflows
 */
import type { MemoryLoadResult } from './schema.js';
export declare class DSEAgentIntegration {
    private memoryManager;
    private contextLoader;
    private currentSession;
    constructor();
    /**
     * Initialize memory-aware agent session
     */
    initializeSession(userQuery: string): Promise<MemoryLoadResult>;
    /**
     * Get memory-informed recommendations for current task
     */
    getTaskRecommendations(taskDescription: string, filesInvolved?: string[]): {
        patterns: string[];
        warnings: string[];
        suggestions: string[];
        relatedWork: string[];
    };
    /**
     * Record task completion and learn from it
     */
    recordTaskCompletion(taskId: string, taskName: string, approach: string, filesModified: string[], challenges?: string[], solutions?: string[], timeSpent?: number): void;
    /**
     * Apply Epic 4 knowledge to current task
     */
    applyEpic4Knowledge(currentTask: string): string[];
    /**
     * Get relevant documentation from memory
     */
    getRelevantDocumentation(topic: string): string[];
    /**
     * Enhanced BMad command with memory integration
     */
    executeMemoryAwareCommand(command: string, context?: string): {
        memoryInsights: string[];
        suggestedApproach: string[];
        riskAssessment: string[];
    };
    private generateSessionId;
    private inferContextFromQuery;
    private extractRelevantPatterns;
    private generateWarnings;
    private findRelatedWork;
    private isColorRelated;
    private isPipelineRelated;
    private isArchitectureRelated;
    private getMemoryInsights;
    private suggestApproach;
    private assessRisks;
}
//# sourceMappingURL=agent-integration.d.ts.map