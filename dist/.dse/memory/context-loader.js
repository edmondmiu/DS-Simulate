/**
 * DSE Context Loading Utilities
 * Intelligent context loading for Claude Code agent integration
 */
import { DSEMemoryManager } from './memory-manager.js';
export class DSEContextLoader {
    memoryManager;
    constructor(memoryPath) {
        this.memoryManager = new DSEMemoryManager(memoryPath);
    }
    /**
     * Load context for color-related tasks
     */
    loadColorContext() {
        const query = {
            type: 'epic',
            filters: {
                keywords: ['color', 'oklch', 'accessibility', 'brand', 'theme'],
                status: ['completed', 'in_progress']
            }
        };
        return this.memoryManager.loadRelevantMemory(query);
    }
    /**
     * Load context for token pipeline tasks
     */
    loadPipelineContext() {
        const query = {
            type: 'pattern',
            filters: {
                keywords: ['pipeline', 'consolidate', 'split', 'token', 'workflow'],
                category: ['workflow', 'architecture']
            },
            relevanceThreshold: 7
        };
        return this.memoryManager.loadRelevantMemory(query);
    }
    /**
     * Load context for Token Studio integration tasks
     */
    loadTokenStudioContext() {
        const query = {
            type: 'epic',
            filters: {
                keywords: ['token studio', 'figma', 'designer', 'compatibility', 'sync'],
                status: ['completed']
            }
        };
        return this.memoryManager.loadRelevantMemory(query);
    }
    /**
     * Load context for documentation tasks
     */
    loadDocumentationContext() {
        const query = {
            type: 'task',
            filters: {
                keywords: ['documentation', 'guide', 'readme', 'architecture'],
                category: ['process']
            }
        };
        return this.memoryManager.loadRelevantMemory(query);
    }
    /**
     * Load context for troubleshooting and debugging
     */
    loadTroubleshootingContext() {
        const query = {
            type: 'task',
            filters: {
                keywords: ['error', 'debug', 'fix', 'issue', 'problem'],
                status: ['completed']
            }
        };
        const result = this.memoryManager.loadRelevantMemory(query);
        // Add specific troubleshooting patterns
        const troubleshootingPatterns = this.extractTroubleshootingPatterns(result.relevantTasks);
        result.applicablePatterns.push(...troubleshootingPatterns);
        return result;
    }
    /**
     * Load context based on current file being worked on
     */
    loadFileContext(filePath) {
        const keywords = this.extractKeywordsFromPath(filePath);
        const query = {
            type: 'task',
            filters: {
                keywords,
                status: ['completed']
            }
        };
        return this.memoryManager.loadRelevantMemory(query);
    }
    /**
     * Load context for new epic planning
     */
    loadEpicPlanningContext() {
        const query = {
            type: 'epic',
            filters: {
                status: ['completed']
            }
        };
        const result = this.memoryManager.loadRelevantMemory(query);
        // Enhance with planning-specific suggestions
        result.suggestions.unshift("Review Epic 4 patterns for architectural guidance", "Consider OKLCH color integration for any color-related features", "Maintain Token Studio compatibility as core requirement", "Plan for bidirectional workflow integration");
        return result;
    }
    /**
     * Generate smart suggestions based on current context
     */
    generateContextualSuggestions(currentTask, filesInvolved = []) {
        const suggestions = [];
        // Color-related suggestions
        if (this.isColorRelated(currentTask, filesInvolved)) {
            suggestions.push("Apply Epic 4 OKLCH patterns for perceptual uniformity", "Validate accessibility compliance using established thresholds", "Consider brand consistency across all theme variations");
        }
        // Pipeline-related suggestions  
        if (this.isPipelineRelated(currentTask, filesInvolved)) {
            suggestions.push("Follow consolidate → split → test workflow pattern", "Ensure round-trip compatibility validation", "Create backup before major pipeline changes");
        }
        // Documentation suggestions
        if (this.isDocumentationRelated(currentTask, filesInvolved)) {
            suggestions.push("Follow Epic 4 documentation patterns for completeness", "Include step-by-step procedures with exact commands", "Add troubleshooting section with common issues");
        }
        return suggestions;
    }
    /**
     * Get relevant patterns for current work
     */
    getRelevantPatterns(context) {
        let keywords = [];
        switch (context.toLowerCase()) {
            case 'color':
                keywords = ['color', 'oklch', 'accessibility', 'brand'];
                break;
            case 'pipeline':
                keywords = ['pipeline', 'workflow', 'consolidate', 'split'];
                break;
            case 'documentation':
                keywords = ['documentation', 'guide', 'process'];
                break;
            case 'testing':
                keywords = ['test', 'validation', 'compatibility'];
                break;
            default:
                keywords = [context];
        }
        const query = {
            type: 'pattern',
            filters: { keywords },
            relevanceThreshold: 6
        };
        const result = this.memoryManager.loadRelevantMemory(query);
        return result.applicablePatterns;
    }
    // Helper methods
    extractKeywordsFromPath(filePath) {
        const pathSegments = filePath.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        const keywords = [];
        // Extract from directory names
        pathSegments.forEach(segment => {
            if (segment.includes('color'))
                keywords.push('color');
            if (segment.includes('token'))
                keywords.push('token');
            if (segment.includes('doc'))
                keywords.push('documentation');
            if (segment.includes('test'))
                keywords.push('test');
            if (segment.includes('script'))
                keywords.push('script');
        });
        // Extract from file name
        if (fileName.includes('consolidate'))
            keywords.push('consolidate', 'pipeline');
        if (fileName.includes('split'))
            keywords.push('split', 'pipeline');
        if (fileName.includes('oklch'))
            keywords.push('oklch', 'color');
        if (fileName.includes('accessibility'))
            keywords.push('accessibility');
        if (fileName.includes('token'))
            keywords.push('token');
        return [...new Set(keywords)]; // Remove duplicates
    }
    isColorRelated(task, files) {
        const colorKeywords = ['color', 'oklch', 'accessibility', 'brand', 'theme', 'palette'];
        const taskText = task.toLowerCase();
        const fileText = files.join(' ').toLowerCase();
        return colorKeywords.some(keyword => taskText.includes(keyword) || fileText.includes(keyword));
    }
    isPipelineRelated(task, files) {
        const pipelineKeywords = ['consolidate', 'split', 'pipeline', 'token', 'sync', 'workflow'];
        const taskText = task.toLowerCase();
        const fileText = files.join(' ').toLowerCase();
        return pipelineKeywords.some(keyword => taskText.includes(keyword) || fileText.includes(keyword));
    }
    isDocumentationRelated(task, files) {
        const docKeywords = ['documentation', 'guide', 'readme', 'doc', 'help', 'manual'];
        const taskText = task.toLowerCase();
        const fileText = files.join(' ').toLowerCase();
        return docKeywords.some(keyword => taskText.includes(keyword) || fileText.includes(keyword));
    }
    extractTroubleshootingPatterns(tasks) {
        const troubleshootingPatterns = [];
        tasks.forEach((task, index) => {
            task.challenges.forEach(challenge => {
                if (challenge.resolution) {
                    troubleshootingPatterns.push({
                        id: `troubleshoot-${index}-${challenge.category}`,
                        name: `${challenge.category} Issue Resolution`,
                        category: 'workflow',
                        description: challenge.description,
                        useCases: [challenge.category],
                        implementation: challenge.resolution,
                        effectiveness: challenge.severity === 'critical' ? 9 : 7,
                        reusability: challenge.preventionStrategy ? 8 : 6
                    });
                }
            });
        });
        return troubleshootingPatterns;
    }
}
//# sourceMappingURL=context-loader.js.map