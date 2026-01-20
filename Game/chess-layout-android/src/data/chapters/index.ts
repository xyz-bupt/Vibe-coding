// 章节元数据和导出

import type { Chapter, Layout } from '../../types';
import { CHAPTER_01_LAYOUTS } from './chapter01-shunshunpao';
import { CHAPTER_02_LAYOUTS } from './chapter02-lieshoupao';
import { CHAPTER_03_LAYOUTS } from './chapter03-zhongpao-pingfengma';
import { CHAPTER_04_LAYOUTS } from './chapter04-zhongpao-fangongma';
import { CHAPTER_05_LAYOUTS } from './chapter05-xianrenzhilu';
import { CHAPTER_06_LAYOUTS } from './chapter06-feixiangju';

/**
 * 章节数据
 */
export const CHAPTERS: Chapter[] = [
  {
    id: 'ch01',
    number: 1,
    title: '顺手炮',
    category: 'shunshunpao',
    description: '双方都架中炮，形成激烈对攻局面，是最常见的布局之一。',
    layoutIds: Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(3, '0'))
  },
  {
    id: 'ch02',
    number: 2,
    title: '列手炮',
    category: 'lieshoupao',
    description: '双方炮位相对，对攻性更强于顺手炮，变化复杂，容易出错。',
    layoutIds: Array.from({ length: 15 }, (_, i) => String(i + 21).padStart(3, '0'))
  },
  {
    id: 'ch03',
    number: 3,
    title: '中炮对屏风马',
    category: 'zhongpao_pingfengma',
    description: '红方从中路进攻，黑方屏风马防守稳健，是攻守兼备的经典布局。',
    layoutIds: Array.from({ length: 20 }, (_, i) => String(i + 36).padStart(3, '0'))
  },
  {
    id: 'ch04',
    number: 4,
    title: '中炮对反宫马',
    category: 'zhongpao_fangongma',
    description: '黑方士角炮配合屏风马，阵型灵活多变，是现代象棋流行布局。',
    layoutIds: Array.from({ length: 15 }, (_, i) => String(i + 56).padStart(3, '0'))
  },
  {
    id: 'ch05',
    number: 5,
    title: '仙人指路',
    category: 'xianrenzhilu',
    description: '红方挺兵试探，灵活多变，考验双方的布局理解和中局功力。',
    layoutIds: Array.from({ length: 20 }, (_, i) => String(i + 71).padStart(3, '0'))
  },
  {
    id: 'ch06',
    number: 6,
    title: '飞相局及其他',
    category: 'feixiangju',
    description: '包括飞相局、过宫炮、起马局等，以稳健防守为主，适合稳健型棋手。',
    layoutIds: Array.from({ length: 10 }, (_, i) => String(i + 91).padStart(3, '0'))
  }
];

/**
 * 所有章节的布局数据
 */
export const ALL_CHAPTER_LAYOUTS: Layout[] = [
  ...CHAPTER_01_LAYOUTS,
  ...CHAPTER_02_LAYOUTS,
  ...CHAPTER_03_LAYOUTS,
  ...CHAPTER_04_LAYOUTS,
  ...CHAPTER_05_LAYOUTS,
  ...CHAPTER_06_LAYOUTS
];

/**
 * 获取所有章节
 */
export function getAllChapters(): Chapter[] {
  return CHAPTERS;
}

/**
 * 根据ID获取章节
 */
export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS.find(ch => ch.id === id);
}

/**
 * 获取所有布局
 */
export function getAllLayouts(): Layout[] {
  return ALL_CHAPTER_LAYOUTS;
}

/**
 * 根据ID获取布局
 */
export function getLayoutById(id: string): Layout | undefined {
  return ALL_CHAPTER_LAYOUTS.find(layout => layout.id === id);
}

/**
 * 根据分类获取布局
 */
export function getLayoutsByCategory(category: string): Layout[] {
  return ALL_CHAPTER_LAYOUTS.filter(layout => layout.category === category);
}

/**
 * 根据章节ID获取布局
 */
export function getLayoutsByChapter(chapterId: string): Layout[] {
  const chapter = getChapterById(chapterId);
  if (!chapter) return [];

  return chapter.layoutIds
    .map(id => getLayoutById(id))
    .filter((layout): layout is Layout => layout !== undefined);
}

/**
 * 获取带有布局数据的章节
 */
export function getChaptersWithLayouts(): Array<Chapter & { layouts: Layout[] }> {
  return CHAPTERS.map(chapter => ({
    ...chapter,
    layouts: getLayoutsByChapter(chapter.id)
  }));
}

/**
 * 搜索布局
 */
export function searchLayouts(keyword: string): Layout[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_CHAPTER_LAYOUTS.filter(
    layout =>
      layout.name.toLowerCase().includes(lowerKeyword) ||
      layout.description.toLowerCase().includes(lowerKeyword) ||
      layout.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}
