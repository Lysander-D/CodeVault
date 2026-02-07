import { CodeItem, CodeGroup, CategoryType } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const parseCodesFromText = (text: string, category: CategoryType): CodeItem[] => {
  // Regex to match alphanumeric strings between 20 and 60 characters
  const regex = /[a-zA-Z0-9]{20,60}/g;
  const matches = text.match(regex);

  if (!matches) return [];

  const uniqueMatches = Array.from(new Set(matches));
  const baseTime = Date.now();

  return uniqueMatches.map((code, index) => ({
    id: generateId(),
    value: code,
    prefix: code.substring(0, 4).toUpperCase(),
    category: category,
    isUsed: false,
    // Add index to baseTime to ensure strict preservation of the pasted order
    createdAt: baseTime + index,
  }));
};

export const groupCodesByPrefix = (codes: CodeItem[]): CodeGroup[] => {
  const groups: Record<string, CodeItem[]> = {};

  codes.forEach((code) => {
    if (!groups[code.prefix]) {
      groups[code.prefix] = [];
    }
    groups[code.prefix].push(code);
  });

  // Sort groups alphabetically by prefix
  return Object.keys(groups)
    .sort()
    .map((prefix) => ({
      prefix,
      // Sort: Ascending (Oldest -> Newest) to match insertion order
      codes: groups[prefix].sort((a, b) => a.createdAt - b.createdAt),
    }));
};