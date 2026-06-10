export type CategorySuggestion = {
    category: string;
  
    confidence: 'high' | 'medium' | 'low';
  
    matchedKeyword?: string;
  };
  
  const CATEGORY_RULES: Array<{
    category: string;
    keywords: string[];
  }> = [
    {
      category: 'Transporte',
      keywords: [
        'pedagio',
        'pedágio',
        'via colinas',
        'sem parar',
        'posto',
        'auto posto',
        'combustivel',
        'combustível',
        'gasolina',
        'etanol',
        'uber',
        '99',
        'estacionamento',
      ],
    },
    {
      category: 'Mercado',
      keywords: [
        'mercado',
        'supermercado',
        'atacadao',
        'atacadão',
        'sup ',
        'irmaos boa',
        'irmãos boa',
        'carnes',
        'hortifruti',
        'padaria',
        'grande pao',
        'grande pão',
        'emporio',
        'empório',
      ],
    },
    {
      category: 'Alimentação',
      keywords: [
        'ifood',
        'restaurante',
        'lanches',
        'delivery',
        'pastelaria',
        'acai',
        'açaí',
        'espeto',
        'pizza',
        'burger',
        'cafeteria',
      ],
    },
    {
      category: 'Saúde',
      keywords: [
        'farmacia',
        'farmácia',
        'drogal',
        'drogaria',
        'farma',
        'medicamento',
        'hospital',
        'clinica',
        'clínica',
        'laboratorio',
        'laboratório',
      ],
    },
    {
      category: 'Moradia',
      keywords: [
        'aluguel',
        'energia',
        'elektro',
        'cpfl',
        'sabesp',
        'agua',
        'água',
        'internet',
        'telefonica',
        'telefônica',
        'vivo',
        'claro',
        'tim',
      ],
    },
    {
      category: 'Assinaturas',
      keywords: [
        'netflix',
        'spotify',
        'amazon prime',
        'prime video',
        'youtube',
        'google',
        'apple',
        'wellhub',
        'gympass',
      ],
    },
    {
      category: 'Compras',
      keywords: [
        'mercado livre',
        'marketplace',
        'pix marketplace',
        'amazon',
        'shopee',
        'magazine',
        'magalu',
        'americanas',
        'loja',
        'cosmetic',
        'cosmetico',
        'cosmético',
      ],
    },
    {
      category: 'Pets',
      keywords: [
        'pet',
        'petville',
        'racao',
        'ração',
        'veterinario',
        'veterinário',
      ],
    },
    {
      category: 'Lazer',
      keywords: [
        'adega',
        'bar',
        'jogos',
        'cinema',
        'show',
        'evento',
      ],
    },
    {
      category: 'Receitas',
      keywords: [
        'pix recebido',
        'salario',
        'salário',
        'resgate',
        'resgate poupanca',
        'resgate poupança',
      ],
    },
    {
      category: 'Investimentos',
      keywords: [
        'aplicacao',
        'aplicação',
        'poupanca',
        'poupança',
        'cdb',
        'investimento',
      ],
    },
    {
      category: 'Cartão',
      keywords: [
        'pagamento fatura',
        'fatura cartao',
        'fatura cartão',
        'cartao inter',
        'cartão inter',
      ],
    },
  ];
  
  function normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
  
  export function suggestCategoryFromDescription(
    description: string,
  ): CategorySuggestion {
    const normalizedDescription =
      normalizeText(description);
  
    for (const rule of CATEGORY_RULES) {
      for (const keyword of rule.keywords) {
        const normalizedKeyword =
          normalizeText(keyword);
  
        if (
          normalizedDescription.includes(
            normalizedKeyword,
          )
        ) {
          return {
            category: rule.category,
  
            confidence:
              normalizedKeyword.length >= 8
                ? 'high'
                : 'medium',
  
            matchedKeyword: keyword,
          };
        }
      }
    }
  
    return {
      category: 'Sem categoria',
  
      confidence: 'low',
    };
  }
  
  export function suggestCategoryByTransactionType(
    type: 'income' | 'expense',
    description: string,
  ) {
    const suggestion =
      suggestCategoryFromDescription(
        description,
      );
  
    if (
      type === 'income' &&
      suggestion.category === 'Sem categoria'
    ) {
      return {
        category: 'Receitas',
  
        confidence: 'medium' as const,
      };
    }
  
    return suggestion;
  }