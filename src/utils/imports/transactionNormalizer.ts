import {
  suggestCategoryByTransactionType,
  type CategorySuggestion,
} from './categoryMatcher';

export type NormalizedImportedTransaction = {
  date: string;

  description: string;

  amount: number;

  type: 'income' | 'expense';

  category: string;

  categoryConfidence:
    | 'high'
    | 'medium'
    | 'low';

  categoryMatchedKeyword?: string;

  externalId: string;
};

export function parseBrazilianCurrency(
  value: string,
) {
  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeImportedDate(
  value: string,
) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const slashDate = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  );

  if (slashDate) {
    const [, day, month, year] = slashDate;

    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

export function createImportedExternalId({
  date,
  description,
  amount,
}: {
  date: string;
  description: string;
  amount: number;
}) {
  return `${date}-${description}-${amount}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function normalizeImportedTransaction({
  date,
  description,
  signedAmount,
  categorySuggestion,
}: {
  date: string;
  description: string;
  signedAmount: number;
  categorySuggestion?: CategorySuggestion;
}): NormalizedImportedTransaction {
  const normalizedDate =
    normalizeImportedDate(date);

  const type =
    signedAmount >= 0
      ? 'income'
      : 'expense';

  const amount =
    Math.abs(signedAmount);

  const trimmedDescription =
    description.trim();

  const suggestion =
    categorySuggestion ??
    suggestCategoryByTransactionType(
      type,
      trimmedDescription,
    );

  return {
    date: normalizedDate,

    description:
      trimmedDescription,

    amount,

    type,

    category:
      suggestion.category,

    categoryConfidence:
      suggestion.confidence,

    categoryMatchedKeyword:
      suggestion.matchedKeyword,

    externalId:
      createImportedExternalId({
        date: normalizedDate,
        description: trimmedDescription,
        amount: signedAmount,
      }),
  };
}