/**
 * DSE Memory Management System
 * Handles loading, storing, and querying of memory data
 */
import type { EpicMemory, TaskMemory, ContextMemory, MemoryQuery, MemoryLoadResult, Pattern } from './schema.js';
export declare class DSEMemoryManager {
    private memoryPath;
    constructor(basePath?: string);
    saveEpicMemory(epic: EpicMemory): void;
    loadEpicMemory(epicId: string): EpicMemory | null;
    getAllEpics(): EpicMemory[];
    saveTaskMemory(task: TaskMemory): void;
    loadTaskMemory(taskId: string): TaskMemory | null;
    getTasksForEpic(epicId: string): TaskMemory[];
    saveContextMemory(context: ContextMemory): void;
    loadContextMemory(): ContextMemory | null;
    savePattern(pattern: Pattern): void;
    loadPatterns(): Pattern[];
    loadRelevantMemory(query: MemoryQuery): MemoryLoadResult;
    private filterEpics;
    private filterPatterns;
    private generateSuggestions;
    private getDefaultContext;
}
//# sourceMappingURL=memory-manager.d.ts.map