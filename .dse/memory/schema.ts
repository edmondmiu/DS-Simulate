/**
 * DSE Memory System Schema Definitions
 * Defines TypeScript interfaces for memory persistence and context management
 */

export interface EpicMemory {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  startDate: string;
  completionDate?: string;
  
  // Core Epic Information
  goals: string[];
  outcomes: string[];
  keyDecisions: Decision[];
  learnings: Learning[];
  
  // Technical Details
  technologies: Technology[];
  patterns: Pattern[];
  artifacts: Artifact[];
  
  // Context & Relationships
  dependencies: string[];
  impacts: string[];
  relatedEpics: string[];
  
  // Metrics & Validation
  successMetrics: Metric[];
  testingNotes: string[];
  performanceData: PerformanceMetric[];
}

export interface TaskMemory {
  id: string;
  epicId: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  timestamp: string;
  
  // Task Execution Details
  approach: string;
  challenges: Challenge[];
  solutions: Solution[];
  timeSpent: number; // minutes
  
  // Technical Context
  filesModified: string[];
  commandsUsed: string[];
  toolsUtilized: string[];
  
  // Outcomes & Learning
  outcomes: string[];
  lessonsLearned: string[];
  futureConsiderations: string[];
}

export interface Decision {
  id: string;
  timestamp: string;
  context: string;
  options: string[];
  chosen: string;
  rationale: string;
  impacts: string[];
  reviewDate?: string;
}

export interface Learning {
  id: string;
  category: 'technical' | 'process' | 'user_experience' | 'business';
  description: string;
  application: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  verified: boolean;
}

export interface Technology {
  name: string;
  version?: string;
  purpose: string;
  effectiveness: 'poor' | 'good' | 'excellent';
  notes: string[];
}

export interface Pattern {
  id: string;
  name: string;
  category: 'workflow' | 'code' | 'architecture' | 'process';
  description: string;
  useCases: string[];
  implementation: string;
  effectiveness: number; // 1-10 scale
  reusability: number; // 1-10 scale
}

export interface Artifact {
  type: 'documentation' | 'code' | 'configuration' | 'script' | 'test';
  path: string;
  description: string;
  importance: 'reference' | 'critical' | 'legacy';
  lastModified: string;
}

export interface Challenge {
  description: string;
  category: 'technical' | 'process' | 'communication' | 'resource';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  resolution?: string;
  preventionStrategy?: string;
}

export interface Solution {
  problem: string;
  approach: string;
  implementation: string;
  effectiveness: number; // 1-10 scale
  reusability: 'specific' | 'adaptable' | 'universal';
  documentation?: string;
}

export interface Metric {
  name: string;
  target: string;
  actual: string;
  status: 'pending' | 'met' | 'exceeded' | 'missed';
  measurement_date: string;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  context: string;
}

export interface ContextMemory {
  codebaseUnderstanding: CodebaseKnowledge;
  userPreferences: UserPreferences;
  workflowPatterns: WorkflowPattern[];
  lastUpdated: string;
}

export interface CodebaseKnowledge {
  architecture: {
    overview: string;
    keyComponents: string[];
    dataFlow: string[];
    dependencies: string[];
  };
  patterns: {
    naming: string[];
    structure: string[];
    configuration: string[];
  };
  evolution: {
    majorChanges: string[];
    deprecations: string[];
    futureDirections: string[];
  };
}

export interface UserPreferences {
  communicationStyle: 'concise' | 'detailed' | 'interactive';
  workflowPreferences: string[];
  toolPreferences: string[];
  documentationStyle: string[];
  feedbackPattern: string[];
}

export interface WorkflowPattern {
  name: string;
  trigger: string;
  steps: string[];
  frequency: number;
  effectiveness: number;
  lastUsed: string;
}

export interface MemoryQuery {
  type: 'epic' | 'task' | 'pattern' | 'context';
  filters: {
    timeRange?: { start: string; end: string };
    status?: string[];
    category?: string[];
    keywords?: string[];
  };
  relevanceThreshold?: number;
}

export interface MemoryLoadResult {
  context: ContextMemory;
  relevantEpics: EpicMemory[];
  relevantTasks: TaskMemory[];
  applicablePatterns: Pattern[];
  suggestions: string[];
}