/**
 * Brain Dump Space - Main Application
 *
 * A minimalist thought capture and visualization tool.
 * Enter thoughts, watch them become nodes in a floating galaxy of ideas.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoidInput } from './components/VoidInput';
import { ThoughtGraph, GraphTooltip } from './components/ThoughtGraph';
import { SettingsModal, SettingsButton } from './components/SettingsModal';
import { AIChatPanel, ChatToggleButton } from './components/AIChatPanel';
import { StorageService } from './services/storage';
import { thoughtAnalyzer } from './services/analyzer';
import { transformToGraph } from './utils/graphTransformer';
import { getTagColor } from './constants/tags';
import { escapeHtml } from './utils/validation';
import type { Thought, AppSettings, GraphNode, GraphData } from './types';

function App() {
  // Core state
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [settings, setSettings] = useState<AppSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Graph state - use proper GraphData type
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Footer state
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Check if AI config is set
  const hasAIConfig = useCallback(() => {
    try {
      const config = localStorage.getItem('ai-config');
      if (config) {
        const parsed = JSON.parse(config);
        return !!(parsed.apiUrl && parsed.apiKey && parsed.model);
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Use a ref to track updateGraph without causing dependency cycles
  const updateGraphRef = useRef<(thoughtsToUpdate: Thought[]) => void>(() => {});

  // Load initial data
  useEffect(() => {
    const savedThoughts = StorageService.getThoughts();
    setThoughts(savedThoughts);

    const savedSettings = StorageService.getSettings();
    // Sanitized logging - don't expose API keys
    console.log('[App] Settings loaded - useRealAI:', savedSettings.useRealAI);
    console.log('[App] Model:', savedSettings.modelName || 'default');
    setSettings(savedSettings);

    // Initialize analyzer with settings
    thoughtAnalyzer.setSettings(savedSettings);

    // Update graph when thoughts change
    const data = transformToGraph(savedThoughts);
    setGraphData(data);
  }, []);

  // Update graph data when thoughts change - stable reference
  const updateGraph = useCallback((thoughtsToUpdate: Thought[]) => {
    const data = transformToGraph(thoughtsToUpdate);
    setGraphData(data);
  }, []);

  // Keep the ref updated
  useEffect(() => {
    updateGraphRef.current = updateGraph;
  }, [updateGraph]);

  // Handle new thought submission - use functional state updates
  const handleSubmit = useCallback(async (content: string) => {
    try {
      console.log('[App] ===== THOUGHT SUBMISSION START =====');
      console.log('[App] Submitting thought:', content);

      // Analyze the thought to extract tags
      console.log('[App] Calling thoughtAnalyzer.analyze()...');
      const analysis = await thoughtAnalyzer.analyze(content);

      console.log('[App] Analysis result:', analysis);
      console.log('[App] Extracted tags:', analysis.tags);

      // Save with tags
      const savedThought = StorageService.saveThought({
        content,
        tags: analysis.tags,
      });

      // Use functional update to avoid stale closures
      setThoughts((prevThoughts) => {
        const updatedThoughts = [savedThought, ...prevThoughts];
        // Update graph using the ref
        updateGraphRef.current?.(updatedThoughts);
        return updatedThoughts;
      });

      console.log('[App] Thought saved:', savedThought);
      console.log('[App] ===== THOUGHT SUBMISSION END =====');
    } catch (error) {
      console.error('[App] Failed to save thought:', error);
      // Could add user-facing error notification here
    }
  }, []); // No dependencies - uses ref for graph updates

  // Handle settings save
  const handleSettingsSave = useCallback((newSettings: AppSettings) => {
    console.log('[App] Saving settings - useRealAI:', newSettings.useRealAI);
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    // Update analyzer settings for AI analysis
    thoughtAnalyzer.setSettings(newSettings);
  }, []);

  // Handle node hover with tooltip positioning
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
    if (node && window.event) {
      const e = window.event as MouseEvent;
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle thought deletion - use functional state updates
  const handleDeleteThought = useCallback((thoughtId: string) => {
    if (confirm('确定要删除这条闪念吗？')) {
      StorageService.deleteThought(thoughtId);
      setThoughts((prevThoughts) => {
        const updatedThoughts = prevThoughts.filter(t => t.id !== thoughtId);
        updateGraphRef.current?.(updatedThoughts);
        return updatedThoughts;
      });
    }
  }, []);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header with stats */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-zinc-800 text-sm">
            <span className="font-medium">{thoughts.length}</span> 闪念
            {thoughts.length > 0 && (
              <>
                {' · '}
                <span className="font-medium">{graphData.nodes.filter(n => n.type === 'tag').length}</span> 标签
              </>
            )}
          </div>
          <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Input Section */}
        <section className="flex-shrink-0">
          <VoidInput onSubmit={handleSubmit} />
        </section>

        {/* Graph Section */}
        <section className="flex-1 min-h-0">
          <ThoughtGraph
            data={graphData}
            onNodeHover={handleNodeHover}
            height="100%"
          />
        </section>
      </main>

      {/* Recent thoughts preview - improved */}
      {thoughts.length > 0 && (
        <footer className="absolute bottom-0 left-0 right-0 z-20">
          {/* Collapse/Expand handle */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsFooterExpanded(!isFooterExpanded)}
              className="pointer-events-auto px-4 py-2 mb-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
            >
              <span>{isFooterExpanded ? '收起' : '展开'}</span>
              <svg
                className={`w-3 h-3 transition-transform ${isFooterExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Thoughts grid */}
          <div
            className={`
              transition-all duration-300 ease-in-out
              ${isFooterExpanded ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0 overflow-hidden'}
            `}
          >
            <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
              <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {thoughts.map((thought) => (
                  <div
                    key={thought.id}
                    className="group pointer-events-auto bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-3 hover:bg-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                    onClick={() => {
                      if (confirm(`删除: "${escapeHtml(thought.content).substring(0, 30)}..."?`)) {
                        handleDeleteThought(thought.id);
                      }
                    }}
                    title="点击删除"
                  >
                    {/* Content */}
                    <p className="text-sm text-zinc-100 line-clamp-2 mb-2">
                      {escapeHtml(thought.content)}
                    </p>

                    {/* Tags */}
                    {thought.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {thought.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: getTagColor(tag) + '20',
                              color: getTagColor(tag)
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-zinc-400">
                      {formatDate(thought.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minimal collapsed view - show latest 3 as small pills */}
          {!isFooterExpanded && (
            <div className="p-4 bg-gradient-to-t from-zinc-950 to-transparent">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                {thoughts.slice(0, 3).map((thought) => (
                  <div
                    key={thought.id}
                    className="pointer-events-auto px-4 py-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-full text-sm text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all cursor-pointer"
                    onClick={() => setIsFooterExpanded(true)}
                  >
                    {escapeHtml(thought.content.substring(0, 15))}
                    {thought.content.length > 15 && '...'}
                  </div>
                ))}
                {thoughts.length > 3 && (
                  <div
                    className="pointer-events-auto px-4 py-2 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-full text-sm text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-all cursor-pointer"
                    onClick={() => setIsFooterExpanded(true)}
                  >
                    +{thoughts.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          )}
        </footer>
      )}

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        onSave={handleSettingsSave}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Chat Toggle Button */}
      <ChatToggleButton
        onClick={() => setIsChatOpen(true)}
        hasConfig={hasAIConfig()}
      />

      {/* Tooltip */}
      {hoveredNode && (
        <GraphTooltip node={hoveredNode} position={tooltipPosition} />
      )}
    </div>
  );
}

export default App;
