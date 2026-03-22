/**
 * Brain Dump Space - Type Definitions
 *
 * Core data models for thoughts, tags, and the force-directed graph visualization.
 */

/**
 * Node type in the visualization graph
 * - 'thought': A user's thought/note entry
 * - 'tag': A tag category that thoughts can be associated with
 */
export type NodeType = 'thought' | 'tag';

/**
 * A thought (闪念) represents a single entry in the brain dump
 */
export interface Thought {
  /** Unique identifier for the thought */
  id: string;

  /** The text content of the thought */
  content: string;

  /** Unix timestamp when the thought was created */
  createdAt: number;

  /** Array of tag IDs or names associated with this thought */
  tags: string[];
}

/**
 * Graph node for force-directed visualization
 */
export interface GraphNode {
  /** Unique node identifier */
  id: string;

  /** Display name (content for thoughts, name for tags) */
  name: string;

  /** Node type: thought or tag */
  type: NodeType;

  /** Node size/value (larger for tags with more references) */
  val: number;

  /** Optional color for the node */
  color?: string;

  /** X position (set by force graph) */
  x?: number;

  /** Y position (set by force graph) */
  y?: number;

  /** VX velocity (for physics simulation) */
  vx?: number;

  /** VY velocity (for physics simulation) */
  vy?: number;

  /** FX fixed position force */
  fx?: number | null;

  /** FY fixed position force */
  fy?: number | null;
}

/**
 * Graph link representing a connection between nodes
 */
export interface GraphLink {
  /** Source node ID (typically a thought) */
  source: string;

  /** Target node ID (typically a tag) */
  target: string;
}

/**
 * Complete graph data structure for react-force-graph-2d
 */
export interface GraphData {
  /** Array of all nodes in the graph */
  nodes: GraphNode[];

  /** Array of all links between nodes */
  links: GraphLink[];
}

/**
 * Settings stored in LocalStorage
 */
export interface AppSettings {
  /** OpenAI API Key for real AI analysis */
  openaiApiKey?: string;

  /** Anthropic API Key for real AI analysis */
  anthropicApiKey?: string;

  /** Custom API endpoint URL */
  apiUrl?: string;

  /** Whether to use real AI or mock analysis */
  useRealAI?: boolean;

  /** Custom model name (e.g., gpt-4o-mini, glm-4-flash, qwen-plus) */
  modelName?: string;
}

/**
 * Result of thought analysis
 */
export interface AnalysisResult {
  /** Extracted tags */
  tags: string[];

  /** Confidence score for each tag (when using real AI) */
  confidence?: Record<string, number>;
}
