/**
 * DSE Context Loading Utilities
 * Intelligent context loading for Claude Code agent integration
 */
import type { MemoryLoadResult, Pattern } from './schema.js';
export declare class DSEContextLoader {
    private memoryManager;
    constructor(memoryPath?: string);
    /**
     * Load context for color-related tasks
     */
    loadColorContext(): MemoryLoadResult;
    /**
     * Load context for token pipeline tasks
     */
    loadPipelineContext(): MemoryLoadResult;
    /**
     * Load context for Token Studio integration tasks
     */
    loadTokenStudioContext(): MemoryLoadResult;
    /**
     * Load context for documentation tasks
     */
    loadDocumentationContext(): MemoryLoadResult;
    /**
     * Load context for troubleshooting and debugging
     */
    loadTroubleshootingContext(): MemoryLoadResult;
    /**
     * Load context based on current file being worked on
     */
    loadFileContext(filePath: string): MemoryLoadResult;
    /**
     * Load context for new epic planning
     */
    loadEpicPlanningContext(): MemoryLoadResult;
    /**
     * Generate smart suggestions based on current context
     */
    generateContextualSuggestions(currentTask: string, filesInvolved?: string[]): string[];
    /**
     * Get relevant patterns for current work
     */
    getRelevantPatterns(context: string): Pattern[];
    private extractKeywordsFromPath;
    private isColorRelated;
    private isPipelineRelated;
    private isDocumentationRelated;
    private extractTroubleshootingPatterns;
}
//# sourceMappingURL=context-loader.d.ts.map