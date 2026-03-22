/**
 * ThoughtGraph Component
 *
 * Force-directed graph visualization using react-force-graph-2d.
 * Displays thoughts and tags as interconnected nodes in a "thought galaxy"
 * with beautiful orbital rotation animation.
 */

import { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, GraphNode } from '../types';
import type { OrbitalNode } from '../utils/graphTransformer';
import { getTagColor } from '../constants/tags';
import { escapeHtml } from '../utils/validation';

/**
 * Extended node type with animation properties
 */
interface AnimatedNode extends GraphNode {
  /** Pulse phase for animation (0 to 2PI) */
  pulsePhase?: number;
  /** Tag name for color mapping */
  tagName?: string;
}

interface ThoughtGraphProps {
  /** Graph data to visualize */
  data: GraphData;
  /** Callback when a node is clicked */
  onNodeClick?: (node: GraphNode) => void;
  /** Callback when a node is hovered */
  onNodeHover?: (node: GraphNode | null) => void;
  /** Height of the graph container */
  height?: number | string;
  /** Whether to enable glow effects */
  enableGlow?: boolean;
  /** Whether to enable orbital rotation animation */
  enableOrbitalRotation?: boolean;
}

export function ThoughtGraph({
  data,
  onNodeClick,
  onNodeHover,
  height = '50vh',
  enableGlow = true,
  enableOrbitalRotation = true,
}: ThoughtGraphProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const enableGlowRef = useRef(enableGlow);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const pulseTimeRef = useRef<number>(0);

  // Keep glow setting in sync
  useEffect(() => {
    enableGlowRef.current = enableGlow;
  }, [enableGlow]);

  // Custom node painting with capsule shape and glow effect
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { type, color, val } = node as AnimatedNode;
      const baseSize = val * globalScale;

      // Calculate pulsing scale for thought nodes (breathing effect)
      const pulsePhase = (pulseTimeRef.current * 0.003 + (node.id?.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) || 0) * 0.1) % (Math.PI * 2);
      const pulseScale = type === 'thought' ? 1 + Math.sin(pulsePhase) * 0.03 : 1;
      const size = baseSize * pulseScale;

      // Extract tag name for thought nodes to determine color
      let nodeColor = color;
      if (type === 'thought') {
        // Try to get color from the tag this thought belongs to
        const tagName = (node as any).tagName || '';
        nodeColor = getTagColor(tagName, color);
      }

      // Glow effect for both tag and thought nodes
      if (enableGlowRef.current) {
        ctx.shadowColor = nodeColor || (type === 'tag' ? '#c084fc' : '#52525b');
        ctx.shadowBlur = type === 'tag' ? 20 : 12;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw capsule shape (rounded rectangle)
      const capsuleWidth = size * 2.2;
      const capsuleHeight = size * 1.4;
      const radius = Math.min(capsuleWidth, capsuleHeight) * 0.4;

      ctx.beginPath();
      // Draw rounded rectangle (capsule)
      ctx.roundRect(
        node.x - capsuleWidth / 2,
        node.y - capsuleHeight / 2,
        capsuleWidth,
        capsuleHeight,
        radius
      );

      // Semi-transparent fill
      const fillColor = nodeColor || (type === 'tag' ? '#c084fc' : '#52525b');
      ctx.fillStyle = type === 'tag'
        ? fillColor
        : `${fillColor}40`; // Add transparency for thought nodes (hex + 40 = ~25% opacity)
      ctx.fill();

      // Glowing border
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = type === 'tag' ? 2 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset for other elements

      // Draw label for tag nodes
      if (type === 'tag' && globalScale > 0.5) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = `${10 * globalScale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, node.x, node.y + size + (8 * globalScale));
      }
    },
    [] // No dependencies - uses ref for glow setting
  );

  // Handle node hover with tooltip
  const handleNodeHover = useCallback(
    (node: any) => {
      if (onNodeHover) {
        onNodeHover(node || null);
      }
    },
    [onNodeHover]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick && node) {
        onNodeClick(node as GraphNode);
      }

      // Zoom into clicked node
      if (graphRef.current && node) {
        graphRef.current.centerAt(node.x, node.y, 300);
        graphRef.current.zoom(1.5, 300);
      }
    },
    [onNodeClick]
  );

  // Auto-adjust view to show all nodes clearly
  useEffect(() => {
    if (graphRef.current) {
      const timeoutId = setTimeout(() => {
        // Always zoom to fit all nodes with proper padding
        graphRef.current?.zoomToFit(400, 80);

        // Center the graph
        graphRef.current?.centerAt(0, 0, 400);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [data]);

  // Fade in animation on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.classList.add('opacity-0');
      requestAnimationFrame(() => {
        container.classList.add('transition-opacity', 'duration-500', 'opacity-100');
        container.classList.remove('opacity-0');
      });
    }
  }, []);

  // Orbital rotation animation loop
  useEffect(() => {
    if (!enableOrbitalRotation) {
      return;
    }

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      pulseTimeRef.current = currentTime; // Update pulse time for animation

      // Get the internal graph data and update orbital positions
      const graphInstance = graphRef.current;
      if (graphInstance && graphInstance.graphData) {
        const graphData = graphInstance.graphData as GraphData;

        // Directly mutate the node positions for better performance
        const speedMultiplier = deltaTime / 16; // Normalize to ~60fps

        for (const node of graphData.nodes) {
          const orbitalNode = node as OrbitalNode;

          // Only rotate thought nodes with orbital information
          if (orbitalNode.type === 'thought' && orbitalNode.orbitRadius !== undefined) {
            // Update angle for smooth orbital rotation (visible speed)
            const newAngle = (orbitalNode.orbitAngle || 0) + (0.003 * speedMultiplier);

            // Find the center tag node
            const centerTag = graphData.nodes.find(
              n => n.id === orbitalNode.centerTagId
            );

            if (centerTag && centerTag.x !== undefined && centerTag.y !== undefined) {
              // Calculate new position based on updated angle
              orbitalNode.x = centerTag.x + Math.cos(newAngle) * orbitalNode.orbitRadius!;
              orbitalNode.y = centerTag.y + Math.sin(newAngle) * orbitalNode.orbitRadius!;
              orbitalNode.orbitAngle = newAngle;
            }
          }
        }

        // Trigger a refresh of the graph
        graphInstance.graphData = { ...graphData };
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableOrbitalRotation]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          // Make hit area larger for easier clicking
          const { val } = node as GraphNode;
          ctx.beginPath();
          ctx.arc(node.x, node.y, val + 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        linkColor={() => 'rgba(63, 63, 70, 0.3)'}
        linkWidth={0.5}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.4}
        d3AlphaMin={0.1}
        warmupTicks={200}
        cooldownTicks={0}
        onEngineStop={() => {
          // Keep graph responsive after initial layout
        }}
        backgroundColor="#09090b"
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        nodeVal={(node: any) => node.val}
      />

      {/* Tooltip */}
      <div id="graph-tooltip" className="absolute pointer-events-none hidden" />
    </div>
  );
}

/**
 * Tooltip component for displaying node information on hover
 */
export function GraphTooltip({ node, position }: { node: GraphNode | null; position: { x: number; y: number } }) {
  if (!node) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 max-w-xs"
      style={{
        left: position.x + 15,
        top: position.y - 10,
      }}
    >
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 shadow-xl">
        <div
          className="flex items-center gap-2 mb-1"
          style={{ color: node.color || '#a1a1aa' }}
        >
          <span className="text-xs uppercase tracking-wider opacity-60">{node.type}</span>
        </div>
        {/* Escape HTML to prevent XSS */}
        <p className="text-zinc-200 text-sm break-words" dangerouslySetInnerHTML={{ __html: escapeHtml(node.name) }} />
      </div>
    </div>
  );
}
