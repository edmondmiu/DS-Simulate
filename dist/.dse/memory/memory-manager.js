/**
 * DSE Memory Management System
 * Handles loading, storing, and querying of memory data
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
export class DSEMemoryManager {
    memoryPath;
    constructor(basePath = '.dse/memory') {
        this.memoryPath = basePath;
    }
    // Epic Memory Management
    saveEpicMemory(epic) {
        const filePath = join(this.memoryPath, 'epics', `${epic.id}.json`);
        writeFileSync(filePath, JSON.stringify(epic, null, 2));
    }
    loadEpicMemory(epicId) {
        const filePath = join(this.memoryPath, 'epics', `${epicId}.json`);
        if (!existsSync(filePath))
            return null;
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    getAllEpics() {
        const epicsDir = join(this.memoryPath, 'epics');
        if (!existsSync(epicsDir))
            return [];
        return readdirSync(epicsDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const content = readFileSync(join(epicsDir, file), 'utf-8');
            return JSON.parse(content);
        });
    }
    // Task Memory Management
    saveTaskMemory(task) {
        const filePath = join(this.memoryPath, 'tasks', `${task.id}.json`);
        writeFileSync(filePath, JSON.stringify(task, null, 2));
    }
    loadTaskMemory(taskId) {
        const filePath = join(this.memoryPath, 'tasks', `${taskId}.json`);
        if (!existsSync(filePath))
            return null;
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    getTasksForEpic(epicId) {
        const tasksDir = join(this.memoryPath, 'tasks');
        if (!existsSync(tasksDir))
            return [];
        return readdirSync(tasksDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const content = readFileSync(join(tasksDir, file), 'utf-8');
            return JSON.parse(content);
        })
            .filter(task => task.epicId === epicId);
    }
    // Context Memory Management
    saveContextMemory(context) {
        const filePath = join(this.memoryPath, 'context', 'current.json');
        writeFileSync(filePath, JSON.stringify(context, null, 2));
    }
    loadContextMemory() {
        const filePath = join(this.memoryPath, 'context', 'current.json');
        if (!existsSync(filePath))
            return null;
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    // Pattern Management
    savePattern(pattern) {
        const patterns = this.loadPatterns();
        const existingIndex = patterns.findIndex(p => p.id === pattern.id);
        if (existingIndex >= 0) {
            patterns[existingIndex] = pattern;
        }
        else {
            patterns.push(pattern);
        }
        const filePath = join(this.memoryPath, 'patterns', 'patterns.json');
        writeFileSync(filePath, JSON.stringify(patterns, null, 2));
    }
    loadPatterns() {
        const filePath = join(this.memoryPath, 'patterns', 'patterns.json');
        if (!existsSync(filePath))
            return [];
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    // Intelligent Context Loading
    loadRelevantMemory(query) {
        const context = this.loadContextMemory();
        const allEpics = this.getAllEpics();
        const allPatterns = this.loadPatterns();
        // Filter epics based on query
        const relevantEpics = this.filterEpics(allEpics, query);
        // Get tasks for relevant epics
        const relevantTasks = [];
        relevantEpics.forEach(epic => {
            relevantTasks.push(...this.getTasksForEpic(epic.id));
        });
        // Filter patterns based on query
        const applicablePatterns = this.filterPatterns(allPatterns, query);
        // Generate suggestions based on memory
        const suggestions = this.generateSuggestions(relevantEpics, relevantTasks, applicablePatterns);
        return {
            context: context || this.getDefaultContext(),
            relevantEpics,
            relevantTasks,
            applicablePatterns,
            suggestions
        };
    }
    filterEpics(epics, query) {
        return epics.filter(epic => {
            // Time range filter
            if (query.filters.timeRange) {
                const epicDate = new Date(epic.startDate);
                const startDate = new Date(query.filters.timeRange.start);
                const endDate = new Date(query.filters.timeRange.end);
                if (epicDate < startDate || epicDate > endDate)
                    return false;
            }
            // Status filter
            if (query.filters.status && !query.filters.status.includes(epic.status)) {
                return false;
            }
            // Keywords filter
            if (query.filters.keywords) {
                const epicText = `${epic.name} ${epic.goals.join(' ')} ${epic.outcomes.join(' ')}`.toLowerCase();
                const hasKeywords = query.filters.keywords.some(keyword => epicText.includes(keyword.toLowerCase()));
                if (!hasKeywords)
                    return false;
            }
            return true;
        });
    }
    filterPatterns(patterns, query) {
        return patterns.filter(pattern => {
            // Category filter
            if (query.filters.category && !query.filters.category.includes(pattern.category)) {
                return false;
            }
            // Keywords filter
            if (query.filters.keywords) {
                const patternText = `${pattern.name} ${pattern.description} ${pattern.useCases.join(' ')}`.toLowerCase();
                const hasKeywords = query.filters.keywords.some(keyword => patternText.includes(keyword.toLowerCase()));
                if (!hasKeywords)
                    return false;
            }
            // Relevance threshold
            const relevanceThreshold = query.relevanceThreshold || 5;
            if (pattern.effectiveness < relevanceThreshold)
                return false;
            return true;
        });
    }
    generateSuggestions(epics, tasks, patterns) {
        const suggestions = [];
        // Epic-based suggestions
        epics.forEach(epic => {
            epic.learnings.forEach(learning => {
                if (learning.importance === 'critical' || learning.importance === 'high') {
                    suggestions.push(`Apply Epic ${epic.id} learning: ${learning.description}`);
                }
            });
        });
        // Pattern-based suggestions
        patterns
            .filter(p => p.effectiveness >= 8)
            .forEach(pattern => {
            suggestions.push(`Consider using pattern: ${pattern.name} - ${pattern.description}`);
        });
        // Task-based suggestions
        const commonChallenges = new Map();
        tasks.forEach(task => {
            task.challenges.forEach(challenge => {
                const count = commonChallenges.get(challenge.category) || 0;
                commonChallenges.set(challenge.category, count + 1);
            });
        });
        commonChallenges.forEach((count, category) => {
            if (count >= 3) {
                suggestions.push(`Watch for common ${category} challenges based on past experience`);
            }
        });
        return suggestions.slice(0, 10); // Limit to 10 most relevant suggestions
    }
    getDefaultContext() {
        return {
            codebaseUnderstanding: {
                architecture: {
                    overview: "Design System Tooling with OKLCH color management",
                    keyComponents: ["tokens", "scripts", ".dse", "docs"],
                    dataFlow: ["Token Studio → GitHub → consolidate → split → DSE"],
                    dependencies: ["TypeScript", "Jest", "bmad-method", "culori"]
                },
                patterns: {
                    naming: ["kebab-case for files", "camelCase for variables"],
                    structure: ["modular tokens", "bidirectional pipeline"],
                    configuration: ["JSON schemas", "TypeScript interfaces"]
                },
                evolution: {
                    majorChanges: ["Epic 4 OKLCH integration"],
                    deprecations: [],
                    futureDirections: ["AI agent integration", "Enhanced memory system"]
                }
            },
            userPreferences: {
                communicationStyle: 'detailed',
                workflowPreferences: ["consolidate-split workflow", "test-driven development"],
                toolPreferences: ["TypeScript", "Jest", "npm scripts"],
                documentationStyle: ["comprehensive", "step-by-step"],
                feedbackPattern: ["proactive suggestions", "quality focus"]
            },
            workflowPatterns: [],
            lastUpdated: new Date().toISOString()
        };
    }
}
//# sourceMappingURL=memory-manager.js.map