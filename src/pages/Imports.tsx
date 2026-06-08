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
  
  import { useTransactionImports } from '../hook/useTransactionImports';
  import { useTransactions } from '../hook/useTransactions';
  
  import type {
    ParsedCsvTransaction,
  } from '../utils/csvTransactionParser';
  
  import {
    buildCsvPreview,
    getCsvHeaders,
    suggestCsvColumns,
    type CsvPreviewResult,
  } from '../utils/csvPreview';
  
  export default function Imports() {
    const {
      imports,
      loading,
      createImport,
      updateImport,
      removeImport,
    } = useTransactionImports();
  
    const {
      importTransactions,
    } = useTransactions();
  
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
    ] = useState<CsvPreviewResult | null>(null);
  
    const [
      parsedTransactions,
      setParsedTransactions,
    ] = useState<ParsedCsvTransaction[]>([]);
  
    const [
      selectedFileName,
      setSelectedFileName,
    ] = useState('');
  
    const [
      deletingId,
      setDeletingId,
    ] = useState<string | null>(null);
  
    const [saving, setSaving] =
      useState(false);
  
    async function handleFileChange(
      event: React.ChangeEvent<HTMLInputElement>,
    ) {
      const file =
        event.target.files?.[0];
  
      if (!file) return;
  
      const content =
        await file.text();
  
      const headers =
        getCsvHeaders(content);
  
      const suggested =
        suggestCsvColumns(headers);
  
      setSelectedFileName(file.name);
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
  
      setPreview(null);
      setParsedTransactions([]);
    }
  
    function handleBuildPreview() {
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
        const result =
          buildCsvPreview({
            csvContent,
            dateColumn,
            descriptionColumn,
            amountColumn,
          });
  
        setPreview(result);
        setParsedTransactions(
          result.transactions,
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
        parsedTransactions.length === 0
      ) {
        alert(
          'Gere uma pré-visualização válida antes de importar.',
        );
  
        return;
      }
  
      setSaving(true);
  
      try {
        const importBatch =
          await createImport({
            file_name: selectedFileName,
  
            source: 'csv',
  
            total_transactions:
              parsedTransactions.length,
  
            imported_transactions: 0,
  
            status: 'processing',
          });
  
        const result =
          await importTransactions({
            parsedTransactions,
  
            importBatchId:
              importBatch.id,
          });
  
        if (!result) {
          await updateImport(
            importBatch.id,
            {
              imported_transactions: 0,
  
              status: 'failed',
            },
          );
  
          throw new Error(
            'Falha ao importar transações.',
          );
        }
  
        await updateImport(
          importBatch.id,
          {
            imported_transactions:
              result.imported,
  
            status: 'completed',
          },
        );
  
        setSelectedFileName('');
        setCsvContent('');
        setCsvHeaders([]);
        setDateColumn('');
        setDescriptionColumn('');
        setAmountColumn('');
        setPreview(null);
        setParsedTransactions([]);
  
        alert(
          [
            'Importação concluída.',
            '',
            `Total encontrado: ${result.total}`,
            `Importado: ${result.imported}`,
            `Duplicado: ${result.duplicated}`,
          ].join('\n'),
        );
      } catch (error) {
        console.error(error);
  
        alert(
          'Erro ao importar arquivo.',
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
            Importe extratos financeiros por CSV, escolha as colunas corretas e revise os dados antes de lançar no MyFlow.
          </p>
        </div>
  
        <Card
          title="Nova importação"
          subtitle="Selecione o arquivo, confirme o mapeamento das colunas e visualize o resumo antes de importar."
        >
          <div className="planning-form">
            <label className="planning-input-field">
              <span className="planning-input-label">
                Arquivo CSV
              </span>
  
              <input
                className="search-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
              />
            </label>
  
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
                        {csvHeaders.length} colunas encontradas
                      </span>
                    </div>
                  </div>
  
                  <div className="planning-metric-icon">
                    <FileSpreadsheet size={20} />
                  </div>
                </div>
              </div>
            )}
  
            {csvHeaders.length > 0 && (
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
                    onChange={setDescriptionColumn}
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
                    onClick={handleBuildPreview}
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
                  value={preview.incomeTotal.toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    },
                  )}
                  description={`${preview.incomeCount} lançamento(s) de entrada.`}
                />
  
                <ImportSummaryCard
                  label="Despesas"
                  value={preview.expenseTotal.toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    },
                  )}
                  description={`${preview.expenseCount} lançamento(s) de saída.`}
                />
  
                <ImportSummaryCard
                  label="Saldo do arquivo"
                  value={preview.balance.toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    },
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
          title="Pré-visualização"
          subtitle="Primeiras transações encontradas no arquivo."
        >
          {parsedTransactions.length === 0 ? (
            <EmptyState
              icon="📄"
              title="Nenhum CSV carregado"
              description="Selecione um arquivo, confirme as colunas e gere a pré-visualização."
            />
          ) : (
            <div className="transactions-list">
              {parsedTransactions
                .slice(0, 10)
                .map((transaction) => (
                  <div
                    key={transaction.externalId}
                    className="transaction-item"
                  >
                    <div>
                      <strong>
                        {transaction.description}
                      </strong>
  
                      <span>
                        {new Date(
                          `${transaction.date}T12:00:00`,
                        ).toLocaleDateString(
                          'pt-BR',
                        )}
                      </span>
                    </div>
  
                    <strong
                      className={
                        transaction.type === 'income'
                          ? 'income'
                          : 'expense'
                      }
                    >
                      {transaction.type === 'income'
                        ? '+'
                        : '-'}
                      {transaction.amount.toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        },
                      )}
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </Card>
  
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