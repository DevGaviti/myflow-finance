import ImportReviewCard from './ImportReviewCard';

import type {
  ImportReviewItem,
} from '../../types/importReview';

type Props = {
  category: string | null;

  items: ImportReviewItem[];

  categories: string[];

  onClose: () => void;

  onChange: (items: ImportReviewItem[]) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function ImportCategoryModal({
  category,
  items,
  categories,
  onClose,
  onChange,
}: Props) {
  if (!category) return null;

  const filteredItems =
    items.filter(
      (item) =>
        item.selectedCategory === category,
    );

  const activeItems =
    filteredItems.filter(
      (item) => !item.ignored,
    );

  const total =
    activeItems.reduce(
      (acc, item) =>
        acc + item.amount,
      0,
    );

  const average =
    activeItems.length > 0
      ? total / activeItems.length
      : 0;

  const biggest =
    activeItems.reduce(
      (max, item) =>
        item.amount > max
          ? item.amount
          : max,
      0,
    );

  const lowConfidence =
    filteredItems.filter(
      (item) =>
        item.confidence === 'low' &&
        !item.ignored,
    ).length;

  function updateItem(
    externalId: string,
    partial: Partial<ImportReviewItem>,
  ) {
    onChange(
      items.map((item) =>
        item.externalId === externalId
          ? {
              ...item,
              ...partial,
            }
          : item,
      ),
    );
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: 'min(1040px, 96vw)',
          height: 'min(780px, 88vh)',
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background:
              'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(18px)',
            padding: '22px 28px 18px',
            borderBottom:
              '1px solid rgba(148, 163, 184, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              alignItems: 'flex-start',
            }}
          >
            <div>
              <span className="goal-eyebrow">
                Revisão por categoria
              </span>

              <h2
                className="modal-title"
                style={{
                  marginTop: 6,
                  marginBottom: 6,
                  fontSize: 24,
                }}
              >
                {category}
              </h2>

              <p
                className="dashboard-subtitle"
                style={{
                  maxWidth: 640,
                }}
              >
                Ajuste categorias incorretas ou ignore lançamentos que não devem entrar no MyFlow.
              </p>
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              style={{
                minWidth: 92,
              }}
            >
              Fechar
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              gap: 12,
              marginTop: 18,
            }}
          >
            <CompactMetric
              label="Transações"
              value={String(filteredItems.length)}
              description={`${activeItems.length} ativa(s)`}
            />

            <CompactMetric
              label="Total"
              value={formatCurrency(total)}
              description="Lançamentos ativos"
            />

            <CompactMetric
              label="Média"
              value={formatCurrency(average)}
              description="Por lançamento"
            />

            <CompactMetric
              label="Maior"
              value={formatCurrency(biggest)}
              description={
                lowConfidence > 0
                  ? `${lowConfidence} baixa confiança`
                  : 'Sem alerta'
              }
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 28px 28px',
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.86), rgba(255,255,255,0.98))',
          }}
        >
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <strong>
                Nenhuma transação nesta categoria
              </strong>

              <span>
                As transações podem ter sido movidas para outra categoria durante a revisão.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 16,
                alignItems: 'start',
              }}
            >
              {filteredItems.map((item) => (
                <ImportReviewCard
                  key={item.externalId}
                  item={item}
                  categories={categories}
                  onChange={updateItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type CompactMetricProps = {
  label: string;
  value: string;
  description: string;
};

function CompactMetric({
  label,
  value,
  description,
}: CompactMetricProps) {
  return (
    <div
      style={{
        padding: '13px 15px',
        border:
          '1px solid rgba(148, 163, 184, 0.18)',
        borderRadius: 16,
        background:
          'rgba(248, 250, 252, 0.86)',
        boxShadow:
          '0 10px 28px rgba(15, 23, 42, 0.035)',
      }}
    >
      <span className="planning-metric-label">
        {label}
      </span>

      <strong
        className="planning-metric-value"
        style={{
          display: 'block',
          marginTop: 6,
          fontSize: 18,
        }}
      >
        {value}
      </strong>

      <p
        className="planning-metric-description"
        style={{
          marginTop: 6,
        }}
      >
        {description}
      </p>
    </div>
  );
}
