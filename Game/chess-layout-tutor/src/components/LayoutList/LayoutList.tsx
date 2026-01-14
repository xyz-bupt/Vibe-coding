// 布局列表组件

import React, { useCallback, memo, useState } from 'react';
import type { Layout } from '../../types';
import { getChaptersWithLayouts } from '../../data/chapters';
import './LayoutList.css';

interface LayoutListProps {
  onLayoutSelect: (layout: Layout) => void;
  selectedLayoutId?: string;
}

/**
 * 获取难度星级
 */
const getDifficultyStars = (difficulty: number): string => {
  return '⭐'.repeat(difficulty);
};

/**
 * 布局项组件（Memoized）
 */
interface LayoutItemProps {
  layout: Layout;
  isSelected: boolean;
  onSelect: (layout: Layout) => void;
}

const LayoutItemComponent: React.FC<LayoutItemProps> = memo(({ layout, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(layout);
  }, [layout, onSelect]);

  return (
    <div
      className={`layout-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="layout-header">
        <h3 className="layout-name">{layout.name}</h3>
        <div className="layout-difficulty">
          {getDifficultyStars(layout.difficulty)}
        </div>
      </div>

      <div className="layout-meta">
        <div className="layout-tags">
          {layout.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="layout-description">{layout.description}</p>

      {layout.traps && layout.traps.length > 0 && (
        <div className="layout-traps">
          ⚠️ 包含 {layout.traps.length} 个陷阱
        </div>
      )}
    </div>
  );
});

LayoutItemComponent.displayName = 'LayoutItem';

const LayoutItem = memo(LayoutItemComponent);

/**
 * 章节组件（Memoized）
 */
interface ChapterSectionProps {
  chapter: {
    id: string;
    number: number;
    title: string;
    description: string;
    layouts: Layout[];
  };
  selectedLayoutId?: string;
  onLayoutSelect: (layout: Layout) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const ChapterSectionComponent: React.FC<ChapterSectionProps> = memo(({
  chapter,
  selectedLayoutId,
  onLayoutSelect,
  isExpanded,
  onToggle
}) => {
  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const handleLayoutSelect = useCallback((layout: Layout) => {
    onLayoutSelect(layout);
  }, [onLayoutSelect]);

  const layoutCount = chapter.layouts.length;

  return (
    <div className="chapter-section">
      <div className="chapter-header" onClick={handleToggle}>
        <div className="chapter-title-section">
          <h3 className="chapter-title">
            第{chapter.number}章 {chapter.title}
          </h3>
          <span className="chapter-count">{layoutCount} 局</span>
        </div>
        <div className="chapter-toggle">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <>
          <p className="chapter-description">{chapter.description}</p>
          <div className="chapter-layouts">
            {chapter.layouts.map(layout => (
              <LayoutItem
                key={layout.id}
                layout={layout}
                isSelected={selectedLayoutId === layout.id}
                onSelect={handleLayoutSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

ChapterSectionComponent.displayName = 'ChapterSection';

const ChapterSection = memo(ChapterSectionComponent);

/**
 * 布局列表组件
 */
const LayoutListComponent: React.FC<LayoutListProps> = ({
  onLayoutSelect,
  selectedLayoutId
}) => {
  const chaptersWithLayouts = getChaptersWithLayouts();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['ch01']));

  const handleToggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  }, []);

  const handleLayoutSelect = useCallback((layout: Layout) => {
    onLayoutSelect(layout);
  }, [onLayoutSelect]);

  return (
    <div className="layout-list">
      <h2 className="layout-list-title">象棋布局教程</h2>
      <div className="layout-list-content">
        {chaptersWithLayouts.map(chapter => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            selectedLayoutId={selectedLayoutId}
            onLayoutSelect={handleLayoutSelect}
            isExpanded={expandedChapters.has(chapter.id)}
            onToggle={() => handleToggleChapter(chapter.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Memoized layout list component
 * Only re-renders when selectedLayoutId changes
 */
export const LayoutList = memo(LayoutListComponent, (prevProps, nextProps) => {
  return prevProps.selectedLayoutId === nextProps.selectedLayoutId;
});

LayoutList.displayName = 'LayoutList';
