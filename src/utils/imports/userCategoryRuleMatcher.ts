import type {
    CategoryRule,
  } from '../../types/categoryRule';
  
  import type {
    CategorySuggestion,
  } from './categoryMatcher';
  
  function normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
  
  export function suggestCategoryFromUserRules({
    description,
    rules,
  }: {
    description: string;
  
    rules: CategoryRule[];
  }): CategorySuggestion | null {
    const normalizedDescription =
      normalizeText(description);
  
    const sortedRules =
      [...rules].sort(
        (a, b) =>
          b.keyword.length -
          a.keyword.length,
      );
  
    for (const rule of sortedRules) {
      const normalizedKeyword =
        normalizeText(rule.keyword);
  
      if (
        normalizedKeyword &&
        normalizedDescription.includes(
          normalizedKeyword,
        )
      ) {
        return {
          category: rule.category,
  
          confidence: 'high',
  
          matchedKeyword:
            rule.keyword,
        };
      }
    }
  
    return null;
  }