/**
 * Graph Transformer Utility
 *
 * Converts Thought data into force-directed graph format for visualization.
 */

import type { Thought, GraphData, GraphNode, GraphLink } from '../types';
import { getTagColor } from '../constants/tags';

/**
 * Extended node type with orbital information for rotation animation
 */
export interface OrbitalNode extends GraphNode {
  /** Orbital radius for thought nodes */
  orbitRadius?: number;
  /** Current angle in radians for orbital rotation */
  orbitAngle?: number;
  /** ID of the tag node this thought orbits around */
  centerTagId?: string;
  /** Fixed position flag - tag nodes are fixed */
  fx?: number | null;
  /** Fixed y position flag - tag nodes are fixed */
  fy?: number | null;
  /** Tag name for color inheritance (for thought nodes) */
  tagName?: string;
}

/**
 * Default orbital radius for thought nodes around their tag
 */
const DEFAULT_ORBIT_RADIUS = 80;

/**
 * Transform thoughts array into graph data structure with orbital positioning
 * @param thoughts - Array of thoughts to transform
 * @returns Graph data with nodes and links for visualization
 */
export function transformToGraph(thoughts: Thought[]): GraphData {
  const nodes: OrbitalNode[] = [];
  const links: GraphLink[] = [];
  const tagCounts = new Map<string, number>();

  // First pass: count tag occurrences
  for (const thought of thoughts) {
    for (const tag of thought.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // Create tag nodes first (they'll be the anchors at fixed positions)
  const tagAngleStep = (2 * Math.PI) / Math.max(tagCounts.size, 1);
  const tagLayoutRadius = Math.min(200, 50 + tagCounts.size * 10);

  let tagIndex = 0;
  for (const [tagName, count] of tagCounts.entries()) {
    // Position tags in a circle for balanced layout
    const tagAngle = tagIndex * tagAngleStep;
    const tagX = Math.cos(tagAngle) * tagLayoutRadius;
    const tagY = Math.sin(tagAngle) * tagLayoutRadius;

    nodes.push({
      id: `tag-${tagName}`,
      name: tagName,
      type: 'tag',
      val: Math.max(5, Math.min(20, 5 + count * 2)), // Size based on count
      color: getTagColor(tagName),
      // Fixed position for tag nodes
      x: tagX,
      y: tagY,
      fx: tagX,
      fy: tagY,
    });

    tagIndex++;
  }

  // Second pass: group thoughts by their primary tag (first tag)
  // This creates the orbital structure
  const thoughtsByTag = new Map<string, Thought[]>();
  for (const thought of thoughts) {
    const primaryTag = thought.tags[0] || 'untagged';
    if (!thoughtsByTag.has(primaryTag)) {
      thoughtsByTag.set(primaryTag, []);
    }
    thoughtsByTag.get(primaryTag)!.push(thought);
  }

  // Create thought nodes with orbital information
  for (const thought of thoughts) {
    const thoughtNodeId = `thought-${thought.id}`;
    const primaryTag = thought.tags[0] || 'untagged';

    // Get the index of this thought within its tag group for even distribution
    const tagThoughts = thoughtsByTag.get(primaryTag) || [];
    const thoughtIndex = tagThoughts.findIndex(t => t.id === thought.id);

    // Distribute thoughts evenly around the orbit
    const angleOffset = (2 * Math.PI) / Math.max(tagThoughts.length, 1);
    const initialAngle = thoughtIndex * angleOffset;

    // Get tag position for orbit center
    const tagNode = nodes.find(n => n.id === `tag-${primaryTag}`);
    const centerX = tagNode?.x || 0;
    const centerY = tagNode?.y || 0;

    // Calculate initial position based on orbital mechanics
    const orbitRadius = DEFAULT_ORBIT_RADIUS + (Math.sqrt(tagCounts.get(primaryTag) || 1) * 10);

    // Size variation based on thought length (longer thoughts = slightly larger capsules)
    const contentLength = thought.content.length;
    const baseSize = 3;
    const sizeVariation = Math.min(2, Math.floor(contentLength / 50)); // Cap at +2
    const nodeSize = baseSize + sizeVariation;

    nodes.push({
      id: thoughtNodeId,
      name: thought.content.substring(0, 50) + (thought.content.length > 50 ? '...' : ''),
      type: 'thought',
      val: nodeSize,
      color: getTagColor(primaryTag), // Use tag color for the thought
      tagName: primaryTag, // Store tag name for color reference
      // Orbital information
      orbitRadius,
      orbitAngle: initialAngle,
      centerTagId: `tag-${primaryTag}`,
      // Set initial position based on orbit
      x: centerX + Math.cos(initialAngle) * orbitRadius,
      y: centerY + Math.sin(initialAngle) * orbitRadius,
    });

    // Create links to tags
    for (const tag of thought.tags) {
      links.push({
        source: thoughtNodeId,
        target: `tag-${tag}`,
      });
    }
  }

  return { nodes: nodes as GraphNode[], links };
}
