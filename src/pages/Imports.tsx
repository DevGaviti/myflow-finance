import {
  useState,
} from 'react';

import {
  Upload,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingButton from '../components/LoadingButton';
import ImportQualityCard from '../components/imports/ImportQualityCard';
import ImportCategorySummary from '../components/imports/ImportCategorySummary';
import ImportCategoryModal from '../components/imports/ImportCategoryModal';

import { useTransactionImports } from '../hook/useTransactionImports';
import { useTransactions } from '../hook/useTransactions';
import { useCategoryRules } from '../hook/useCategoryRules';

import type {
  NormalizedImportedTransaction,
} from '../utils/imports/transactionNormalizer';

import {
  detectImportFileType,
  getImportFileLabel,
  type ImportFileType,
} from '../utils/imports/importDetector';

import {
  getCsvHeaders,
  parseCsvTransactions,
} from '../utils/imports/csvParser';

import {
  parsePdfTransactions,
} from '../utils/imports/pdfParser';

import {
  parseOfxTransactions,
} from '../utils/imports/ofxParser';

import {
  mapReviewItemsToImportedTransactions,
  mapTransactionsToReviewItems,
} from '../utils/imports/importReviewMapper';

import {
  suggestCategoryFromUserRules,
} from '../utils/imports/userCategoryRuleMatcher';

import {
  mergeCategories,
} from '../utils/categories/defaultCategories';

import type {
  ImportReviewItem,
} from '../types/importReview';

import type {
  CategoryRule,
} from '../types/categoryRule';

type ImportPreview = {
  transactions: NormalizedImportedTransaction[];

  incomeCount: number;

  expenseCount: number;

  incomeTotal: number;

  expenseTotal: number;

  balance: number;
};

type CsvColumnSuggestion = {
  date?: string;

  description?: string;

  amount?: string;
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findHeaderByKeywords(
  headers: string[],
  keywords: string[],
) {
  return headers.find((header) => {
    const normalizedHeader =
      normalizeHeader(header);

    return keywords.some((keyword) =>
      normalizedHeader.includes(
        normalizeHeader(keyword),
      ),
    );
  });
}

function suggestCsvColumns(
  headers: string[],
): CsvColumnSuggestion {
  return {
    date:
      findHeaderByKeywords(headers, [
        'date',
        'data',
        'dt',
        'posted',
        'lancamento',
        'lançamento',
      ]),

    description:
      findHeaderByKeywords(headers, [
        'description',
        'descricao',
        'descrição',
        'historico',
        'histórico',
        'memo',
        'merchant',
        'titulo',
        'title',
        'name',
      ]),

    amount:
      findHeaderByKeywords(headers, [
        'amount',
        'valor',
        'value',
        'quantia',
        'preco',
        'preço',
        'total',
      ]),
  };
}

function buildPreview(
  transactions: NormalizedImportedTransaction[],
): ImportPreview {
  const incomeTransactions =
    transactions.filter(
      (transaction) =>
        transaction.type === 'income',
    );

  const expenseTransactions =
    transactions.filter(
      (transaction) =>
        transaction.type === 'expense',
    );

  const incomeTotal =
    incomeTransactions.reduce(
      (acc, transaction) =>
        acc + transaction.amount,
      0,
    );

  const expenseTotal =
    expenseTransactions.reduce(
      (acc, transaction) =>
        acc + transaction.amount,
      0,
    );

  return {
    transactions,

    incomeCount:
      incomeTransactions.length,

    expenseCount:
      expenseTransactions.length,

    incomeTotal,

    expenseTotal,

    balance:
      incomeTotal - expenseTotal,
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function applyUserCategoryRules({
  transactions,
  rules,
}: {
  transactions: NormalizedImportedTransaction[];
  rules: CategoryRule[];
}) {
  if (rules.length === 0) {
    return transactions;
  }

  return transactions.map((transaction) => {
    const suggestion =
      suggestCategoryFromUserRules({
        description:
          transaction.description,

        rules,
      });

    if (!suggestion) {
      return transaction;
    }

    return {
      ...transaction,

      category:
        suggestion.category,

      categoryConfidence:
        suggestion.confidence,

      categoryMatchedKeyword:
        suggestion.matchedKeyword,
    };
  });
}

export default function Imports() {
  const {
    imports,
    loading,
    createImport,
    updateImport,
    removeImport,
  } = useTransactionImports();

  const {
    transactions,
    importTransactions,
  } = useTransactions();

  const {
    rules: categoryRules,
    createRule,
  } = useCategoryRules();

  const categoryOptions =
    mergeCategories(
      transactions.map(
        (transaction) =>
          transaction.category,
      ),
    );

  const [
    selectedFileName,
    setSelectedFileName,
  ] = useState('');

  const [
    detectedType,
    setDetectedType,
  ] = useState<ImportFileType>('unknown');

  const [
    csvContent,
    setCsvContent,
  ] = useState('');

  const [
    csvHeaders,
    setCsvHeaders,
  ] = useState<string[]>([]);

  const [
    dateColumn,
    setDateColumn,
  ] = useState('');

  const [
    descriptionColumn,
    setDescriptionColumn,
  ] = useState('');

  const [
    amountColumn,
    setAmountColumn,
  ] = useState('');

  const [
    preview,
    setPreview,
  ] = useState<ImportPreview | null>(null);

  const [
    reviewItems,
    setReviewItems,
  ] = useState<ImportReviewItem[]>([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string | null>(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    readingFile,
    setReadingFile,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  function resetImportState() {
    setSelectedFileName('');
    setDetectedType('unknown');
    setCsvContent('');
    setCsvHeaders([]);
    setDateColumn('');
    setDescriptionColumn('');
    setAmountColumn('');
    setPreview(null);
    setReviewItems([]);
    setSelectedCategory(null);
  }

  function processImportedTransactions(
    transactions: NormalizedImportedTransaction[],
  ) {
    const transactionsWithRules =
      applyUserCategoryRules({
        transactions,

        rules:
          categoryRules,
      });

    setReviewItems(
      mapTransactionsToReviewItems(
        transactionsWithRules,
      ),
    );

    setPreview(
      buildPreview(
        transactionsWithRules,
      ),
    );
  }

  async function saveCategoryRulesFromReview() {
    const rulesToCreate =
      reviewItems.filter(
        (item) =>
          item.shouldCreateRule &&
          !item.ignored &&
          item.ruleKeyword?.trim() &&
          item.selectedCategory,
      );

    if (rulesToCreate.length === 0) {
      return {
        created: 0,
        failed: 0,
      };
    }

    const uniqueRules =
      Array.from(
        new Map(
          rulesToCreate.map((item) => [
            item.ruleKeyword
              ?.trim()
              .toLowerCase() ?? '',
            {
              keyword:
                item.ruleKeyword?.trim() ?? '',

              category:
                item.selectedCategory,
            },
          ]),
        ).values(),
      ).filter(
        (rule) =>
          rule.keyword.length > 0 &&
          rule.category.length > 0,
      );

    let created = 0;
    let failed = 0;

    for (const rule of uniqueRules) {
      try {
        const result =
          await createRule(rule);

        if (result) {
          created += 1;
        } else {
          failed += 1;
        }
      } catch (error) {
        console.error(
          'Erro ao salvar regra de categoria:',
          error,
        );

        failed += 1;
      }
    }

    return {
      created,
      failed,
    };
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    resetImportState();

    const fileType =
      detectImportFileType(file);

    setSelectedFileName(file.name);
    setDetectedType(fileType);
    setReadingFile(true);

    try {
      if (fileType === 'unknown') {
        alert(
          'Formato não reconhecido. Envie um arquivo CSV, PDF extraível ou OFX.',
        );

        return;
      }

      if (fileType === 'csv') {
        const content =
          await file.text();

        const headers =
          getCsvHeaders(content);

        const suggested =
          suggestCsvColumns(headers);

        setCsvContent(content);
        setCsvHeaders(headers);

        setDateColumn(
          suggested.date ?? '',
        );

        setDescriptionColumn(
          suggested.description ?? '',
        );

        setAmountColumn(
          suggested.amount ?? '',
        );

        return;
      }

      if (fileType === 'pdf') {
        const transactions =
          await parsePdfTransactions(file);

        processImportedTransactions(
          transactions,
        );

        return;
      }

      if (fileType === 'ofx') {
        const transactions =
          await parseOfxTransactions(file);

        processImportedTransactions(
          transactions,
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao processar o arquivo. Verifique se o PDF possui texto extraível ou tente outro formato.',
      );
    } finally {
      setReadingFile(false);
    }
  }

  function handleBuildCsvPreview() {
    if (
      !csvContent ||
      !dateColumn ||
      !descriptionColumn ||
      !amountColumn
    ) {
      alert(
        'Selecione as colunas de data, descrição e valor.',
      );

      return;
    }

    try {
      const transactions =
        parseCsvTransactions({
          csvContent,

          columnMap: {
            date: dateColumn,
            description:
              descriptionColumn,
            amount: amountColumn,
          },
        });

      processImportedTransactions(
        transactions,
      );
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao gerar pré-visualização. Verifique se as colunas selecionadas estão corretas.',
      );
    }
  }

  async function handleSaveImport() {
    if (
      !selectedFileName ||
      reviewItems.length === 0 ||
      detectedType === 'unknown'
    ) {
      alert(
        'Gere uma pré-visualização válida antes de importar.',
      );

      return;
    }

    const finalTransactions =
      mapReviewItemsToImportedTransactions(
        reviewItems,
      );

    if (finalTransactions.length === 0) {
      alert(
        'Todas as transações foram marcadas para ignorar.',
      );

      return;
    }

    setSaving(true);

    try {
      const source =
        detectedType === 'pdf'
          ? 'pdf'
          : detectedType === 'ofx'
            ? 'ofx'
            : 'csv';

      const importBatch =
        await createImport({
          file_name: selectedFileName,

          source,

          total_transactions:
            finalTransactions.length,

          imported_transactions: 0,

          status: 'processing',
        });

      const result =
        await importTransactions({
          parsedTransactions:
            finalTransactions,

          importBatchId:
            importBatch.id,

          source,
        });

      if (!result) {
        try {
          await updateImport(
            importBatch.id,
            {
              imported_transactions: 0,

              status: 'failed',
            },
          );
        } catch (updateError) {
          console.error(
            'Erro ao marcar lote como falho:',
            updateError,
          );
        }

        throw new Error(
          'Falha ao importar transações.',
        );
      }

      let importStatusUpdated = true;

      try {
        await updateImport(
          importBatch.id,
          {
            imported_transactions:
              result.imported,

            status: 'completed',
          },
        );
      } catch (updateError) {
        console.error(
          'Erro ao atualizar lote de importação:',
          updateError,
        );

        importStatusUpdated = false;
      }

      const rulesResult =
        await saveCategoryRulesFromReview();

      resetImportState();

      if (!importStatusUpdated) {
        notifyError(
          'O histórico da importação não foi atualizado.',
        );
      }

      if (rulesResult.created > 0) {
        notifySuccess(
          `${rulesResult.created} regra(s) automática(s) criada(s).`,
        );
      }

      if (rulesResult.failed > 0) {
        notifyError(
          `${rulesResult.failed} regra(s) não puderam ser salvas.`,
        );
      }
    } catch (error) {
      console.error(error);

      notifyError(
        'Não foi possível finalizar o processamento da importação.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImport(id: string) {
    const confirmed =
      window.confirm(
        'Deseja excluir este lote? As transações importadas por ele também serão removidas.',
      );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await removeImport(id);
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao excluir importação.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Importações
        </h1>

        <p className="dashboard-subtitle">
          Importe extratos financeiros por CSV, PDF extraível ou OFX. O MyFlow identifica o formato, gera uma prévia e evita duplicidades.
        </p>
      </div>

      <Card
        title="Nova importação"
        subtitle="Selecione um arquivo e revise os dados antes de lançar as transações."
      >
        <div className="planning-form">
          <label className="planning-input-field">
            <span className="planning-input-label">
              Arquivo
            </span>

            <input
              className="search-input"
              type="file"
              accept=".csv,text/csv,.pdf,application/pdf,.ofx,.qfx"
              onChange={handleFileChange}
            />
          </label>

          {readingFile && (
            <p className="dashboard-subtitle">
              Processando arquivo...
            </p>
          )}

          {selectedFileName && (
            <div className="planning-diagnosis-card healthy">
              <div className="planning-diagnosis-header">
                <div>
                  <span className="goal-eyebrow">
                    Arquivo selecionado
                  </span>

                  <div className="goal-values">
                    <strong>
                      {selectedFileName}
                    </strong>

                    <span>
                      Tipo detectado:{' '}
                      {getImportFileLabel(
                        detectedType,
                      )}
                      {detectedType === 'csv' &&
                        ` · ${csvHeaders.length} colunas encontradas`}
                      {detectedType === 'pdf' &&
                        ' · PDF extraível'}
                      {detectedType === 'ofx' &&
                        ' · Arquivo bancário'}
                    </span>
                  </div>
                </div>

                <div className="planning-metric-icon">
                  <FileSpreadsheet size={20} />
                </div>
              </div>
            </div>
          )}

          {detectedType === 'csv' &&
            csvHeaders.length > 0 && (
              <div className="planning-section">
                <div className="planning-section-header">
                  <span className="goal-eyebrow">
                    Mapeamento das colunas
                  </span>

                  <span className="planning-input-label">
                    Confirme quais colunas representam data, descrição e valor.
                  </span>
                </div>

                <div className="planning-input-grid two">
                  <ColumnSelect
                    label="Coluna de data"
                    value={dateColumn}
                    headers={csvHeaders}
                    onChange={setDateColumn}
                  />

                  <ColumnSelect
                    label="Coluna de descrição"
                    value={descriptionColumn}
                    headers={csvHeaders}
                    onChange={
                      setDescriptionColumn
                    }
                  />

                  <ColumnSelect
                    label="Coluna de valor"
                    value={amountColumn}
                    headers={csvHeaders}
                    onChange={setAmountColumn}
                  />
                </div>

                <div className="planning-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBuildCsvPreview}
                  >
                    Gerar pré-visualização
                  </button>
                </div>
              </div>
            )}

          {preview && (
            <div className="planning-metrics-grid">
              <ImportSummaryCard
                label="Transações"
                value={String(
                  preview.transactions.length,
                )}
                description="Total encontrado no arquivo."
              />

              <ImportSummaryCard
                label="Receitas"
                value={formatCurrency(
                  preview.incomeTotal,
                )}
                description={`${preview.incomeCount} lançamento(s) de entrada.`}
              />

              <ImportSummaryCard
                label="Despesas"
                value={formatCurrency(
                  preview.expenseTotal,
                )}
                description={`${preview.expenseCount} lançamento(s) de saída.`}
              />

              <ImportSummaryCard
                label="Saldo do arquivo"
                value={formatCurrency(
                  preview.balance,
                )}
                description="Receitas menos despesas."
              />
            </div>
          )}

          <div className="planning-actions">
            <LoadingButton
              className="primary-btn"
              isLoading={saving}
              onClick={handleSaveImport}
            >
              <Upload size={18} />
              {saving
                ? 'Importando...'
                : 'Importar transações'}
            </LoadingButton>
          </div>
        </div>
      </Card>

      <Card
        title="Qualidade da importação"
        subtitle="Avaliação automática das transações identificadas."
      >
        {reviewItems.length > 0 ? (
          <ImportQualityCard
            items={reviewItems}
          />
        ) : (
          <EmptyState
            icon="📊"
            title="Nenhuma análise disponível"
            description="Importe um arquivo para visualizar a qualidade da classificação."
          />
        )}
      </Card>

      <Card
        title="Categorias identificadas"
        subtitle="Clique em uma categoria para revisar as transações."
      >
        {reviewItems.length > 0 ? (
          <ImportCategorySummary
            items={reviewItems}
            onSelectCategory={setSelectedCategory}
          />
        ) : (
          <EmptyState
            icon="📂"
            title="Nenhuma categoria encontrada"
            description="As categorias aparecerão após a leitura do arquivo."
          />
        )}
      </Card>

      <ImportCategoryModal
        category={selectedCategory}
        items={reviewItems}
        categories={categoryOptions}
        onClose={() => setSelectedCategory(null)}
        onChange={setReviewItems}
      />

      <Card
        title="Histórico de importações"
        subtitle="Lotes de arquivos já processados."
      >
        {loading ? (
          <p className="dashboard-subtitle">
            Carregando importações...
          </p>
        ) : imports.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Nenhuma importação registrada"
            description="Os lotes importados aparecerão aqui."
          />
        ) : (
          <div className="planning-metrics-grid">
            {imports.map((item) => (
              <div
                key={item.id}
                className="planning-metric-card"
              >
                <div className="planning-metric-top">
                  <div>
                    <span className="planning-metric-label">
                      {item.source.toUpperCase()}
                    </span>

                    <strong className="planning-metric-value">
                      {item.file_name}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="delete-btn"
                    disabled={
                      deletingId === item.id
                    }
                    onClick={() =>
                      handleDeleteImport(
                        item.id,
                      )
                    }
                    title="Excluir lote e transações"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="planning-metric-description">
                  Encontradas:{' '}
                  <strong>
                    {item.total_transactions}
                  </strong>
                  <br />
                  Importadas:{' '}
                  <strong>
                    {item.imported_transactions}
                  </strong>
                  <br />
                  Status:{' '}
                  <strong>
                    {item.status}
                  </strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

type ColumnSelectProps = {
  label: string;
  value: string;
  headers: string[];
  onChange: (value: string) => void;
};

function ColumnSelect({
  label,
  value,
  headers,
  onChange,
}: ColumnSelectProps) {
  return (
    <label className="planning-input-field">
      <span className="planning-input-label">
        {label}
      </span>

      <select
        className="filter-select"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          Selecione uma coluna
        </option>

        {headers.map((header) => (
          <option
            key={header}
            value={header}
          >
            {header}
          </option>
        ))}
      </select>
    </label>
  );
}

type ImportSummaryCardProps = {
  label: string;
  value: string;
  description: string;
};

function ImportSummaryCard({
  label,
  value,
  description,
}: ImportSummaryCardProps) {
  return (
    <div className="planning-metric-card">
      <div className="planning-metric-top">
        <div>
          <span className="planning-metric-label">
            {label}
          </span>

          <strong className="planning-metric-value">
            {value}
          </strong>
        </div>
      </div>

      <p className="planning-metric-description">
        {description}
      </p>
    </div>
  );
}
