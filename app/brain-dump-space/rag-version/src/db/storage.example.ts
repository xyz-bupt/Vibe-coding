/**
 * Example usage of the IndexedDB storage layer
 *
 * This file demonstrates how to use the storage service in the Brain Dump RAG application.
 *
 * @example
 * ```typescript
 * import storage from './db/storage';
 *
 * // Initialize the storage (runs automatically on first call)
 * await storage.init();
 *
 * // Create a new thought
 * const thought = await storage.createThought('Remember to call Mom', {
 *   tags: ['personal', 'family']
 * });
 *
 * // Get all thoughts
 * const allThoughts = await storage.getAllThoughts();
 *
 * // Search thoughts
 * const results = await storage.searchThoughts('Mom');
 * ```
 */

import storage from './storage';

/**
 * Basic usage examples
 */
async function basicExamples() {
  // ============================================================
  // INITIALIZATION
  // ============================================================

  // Initialize the storage service (runs migration if needed)
  await storage.init();

  // With progress callback for migration
  await storage.init({
    onMigrationProgress: (step, current, total) => {
      console.log(`Migration: ${step} (${current}/${total})`);
    },
  });

  // ============================================================
  // THOUGHTS CRUD
  // ============================================================

  // Create a new thought (ID is auto-generated)
  const newThought = await storage.createThought('My brilliant idea', {
    tags: ['ideas', 'work'],
  });
  console.log('Created:', newThought);

  // Create with custom ID and timestamp
  const customThought = await storage.createThought('Another thought', {
    id: 'custom-id-123',
    createdAt: Date.now() - 86400000, // Yesterday
    tags: ['important'],
  });

  // Get all thoughts
  const allThoughts = await storage.getAllThoughts();
  console.log('All thoughts:', allThoughts.length);

  // Get a specific thought by ID
  const thought = await storage.getThoughtById('custom-id-123');
  if (thought) {
    console.log('Found:', thought.content);
  }

  // Save (create or update) a thought
  await storage.saveThought({
    id: 'thought-to-save',
    content: 'This will be saved',
    createdAt: Date.now(),
    tags: ['test'],
  });

  // Delete a thought
  await storage.deleteThought('thought-to-save');

  // Delete multiple thoughts
  await storage.deleteThoughts(['id1', 'id2', 'id3']);

  // Clear all thoughts
  await storage.clearAllThoughts();

  // Get thought count
  const count = await storage.getThoughtCount();
  console.log('Total thoughts:', count);

  // ============================================================
  // SEARCH & QUERY
  // ============================================================

  // Search by content
  const searchResults = await storage.searchThoughts('project');
  console.log('Search results:', searchResults);

  // Get thoughts by tag
  const taggedThoughts = await storage.getThoughtsByTag('important');
  console.log('Tagged with "important":', taggedThoughts);

  // Advanced query
  const queried = await storage.queryThoughts({
    tags: ['work', 'ideas'],
    searchQuery: 'project',
    limit: 10,
    offset: 0,
    sortOrder: 'desc',
    dateRange: {
      from: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
      to: Date.now(),
    },
  });
  console.log('Query results:', queried);

  // ============================================================
  // EMBEDDINGS (RAG)
  // ============================================================

  // Update a thought's embedding (for semantic search)
  const embedding = [0.1, 0.2, 0.3, /* ... */];
  await storage.updateThoughtEmbedding('thought-id', embedding);

  // ============================================================
  // SETTINGS
  // ============================================================

  // Get all settings
  const settings = await storage.getSettings();
  console.log('Settings:', settings);

  // Save settings (merges with existing)
  await storage.saveSettings({
    openaiApiKey: 'sk-...',
    modelName: 'gpt-4',
    useRealAI: true,
  });

  // Update specific settings
  await storage.updateSettings({
    modelName: 'gpt-4-turbo',
  });

  // Clear all settings
  await storage.clearSettings();

  // ============================================================
  // DATA MANAGEMENT
  // ============================================================

  // Export all data (for backup)
  const backup = await storage.exportData();
  console.log('Backup:', JSON.stringify(backup, null, 2));

  // Import data
  await storage.importData(backup, {
    overwrite: false, // Don't overwrite existing thoughts
    importSettings: true,
  });

  // Hard reset (delete everything)
  await storage.hardReset();

  // ============================================================
  // MIGRATION
  // ============================================================

  // Check if legacy data exists
  const hasLegacy = await storage.hasLegacyData();
  console.log('Has legacy data:', hasLegacy);

  // Get legacy data info
  const legacyInfo = await storage.getLegacyDataInfo();
  console.log('Legacy info:', legacyInfo);

  // Manually run migration
  const migrationResult = await storage.runMigration({
    clearAfterMigration: true,
    force: false,
    onProgress: (step, current, total) => {
      console.log(`Migration: ${step} (${current}/${total})`);
    },
  });
  console.log('Migration result:', migrationResult);

  // Reset migration flag (for testing)
  await storage.resetMigrationFlag();

  // Export legacy data without migrating
  const legacyExport = storage.exportLegacyData();
  console.log('Legacy export:', legacyExport);

  // ============================================================
  // STORAGE INFO
  // ============================================================

  // Get storage information
  const info = await storage.getStorageInfo();
  console.log('Storage info:', info);
}

/**
 * Complete example: Building a simple thoughts manager
 */
async function thoughtsManagerExample() {
  // Initialize storage
  await storage.init();

  // Add some sample thoughts
  const thoughts = [
    'Review project requirements',
    'Schedule team meeting',
    'Update documentation',
    'Refactor database queries',
  ];

  for (const content of thoughts) {
    await storage.createThought(content, {
      tags: ['work', 'tasks'],
    });
  }

  // Display all thoughts
  console.log('=== All Thoughts ===');
  const allThoughts = await storage.getAllThoughts();
  allThoughts.forEach((thought) => {
    console.log(`[${thought.id}] ${thought.content}`);
    console.log(`  Tags: ${thought.tags.join(', ')}`);
    console.log(`  Created: ${new Date(thought.createdAt).toLocaleString()}`);
  });

  // Search for thoughts
  console.log('\n=== Search Results ===');
  const results = await storage.searchThoughts('meeting');
  results.forEach((thought) => {
    console.log(`- ${thought.content}`);
  });

  // Get thoughts by tag
  console.log('\n=== Work Tasks ===');
  const workThoughts = await storage.getThoughtsByTag('work');
  console.log(`Found ${workThoughts.length} work-related thoughts`);

  // Get storage statistics
  console.log('\n=== Statistics ===');
  const info = await storage.getStorageInfo();
  console.log(`Total thoughts: ${info.thoughtCount}`);
  console.log(`Migration completed: ${info.migrationCompleted}`);
}

/**
 * Error handling example
 */
async function errorHandlingExample() {
  try {
    await storage.init();

    // Attempt to get a non-existent thought
    const thought = await storage.getThoughtById('non-existent');
    if (!thought) {
      console.log('Thought not found');
    }

    // Create a thought with validation
    const content = '  My thought  '; // Has extra whitespace
    const validated = await storage.createThought(content);
    console.log('Content trimmed:', validated.content === content.trim());

    // Handle quota exceeded (when storage is full)
    try {
      // Try to save a very large thought
      const largeContent = 'x'.repeat(10_000_000); // 10MB
      await storage.createThought(largeContent);
    } catch (error) {
      if (error instanceof Error && error.message.includes('quota')) {
        console.error('Storage quota exceeded!');
      }
    }
  } catch (error) {
    console.error('Storage error:', error);
  }
}

// Export examples for use in other files
export { basicExamples, thoughtsManagerExample, errorHandlingExample };

// Run example if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose to global for testing
  (window as any).storageExamples = {
    basicExamples,
    thoughtsManagerExample,
    errorHandlingExample,
  };
  console.log('Storage examples loaded. Try running: storageExamples.basicExamples()');
}
