/**
 * Tag color mappings for consistent visual categorization
 */
export const TAG_COLORS: Record<string, string> = {
  dev: '#a855f7',      // Purple
  life: '#f472b6',     // Pink
  learning: '#60a5fa', // Blue
  health: '#34d399',   // Green
  work: '#fbbf24',     // Orange
  task: '#fcd34d',     // Yellow
  idea: '#22d3ee',     // Cyan
  finance: '#f87171',  // Red
};

/**
 * Available tag categories for AI normalization
 */
export const AVAILABLE_TAGS = [
  'Life', 'Dev', 'Health', 'Learning', 'Work', 'Task', 'Idea', 'Finance'
];

/**
 * Get color for a tag name (case-insensitive)
 */
export function getTagColor(tagName: string, defaultColor = '#c084fc'): string {
  if (!tagName) return defaultColor;
  const lowerTag = tagName.toLowerCase();
  return TAG_COLORS[lowerTag] || defaultColor;
}
