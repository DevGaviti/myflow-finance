import {
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
} from 'lucide-react';

import { formatMoney } from '../utils/format';
import { formatDate } from '../utils/date';

import type {
  Transaction,
} from '../types/transaction';

type Props = {
  transactions: Transaction[];

  selectedIds?: number[];

  onToggleSelect?: (id: number) => void;

  onEdit: (id: number) => void;

  onDelete: (id: number) => void;
};

export default function TransactionsList({
  transactions,
  selectedIds = [],
  onToggleSelect,
  onEdit,
  onDelete,
}: Props) {
  const canSelect =
    Boolean(onToggleSelect);

  return (
    <div className="transactions">
      {transactions.map((item, index) => {
        const isIncome =
          item.type === 'income';

        const isSelected =
          selectedIds.includes(
            item.id,
          );

        return (
          <div
            key={item.id}
            className="transaction-item"
            style={{
              animationDelay: `${index * 0.04}s`,
              border:
                isSelected
                  ? '1px solid rgba(59, 130, 246, 0.5)'
                  : undefined,
              background:
                isSelected
                  ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(15, 23, 42, 0.18))'
                  : undefined,
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1fr) auto',
              gap: 18,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minWidth: 0,
              }}
            >
              {canSelect && (
                <label
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(148, 163, 184, 0.08)',
                    border: isSelected
                      ? '1px solid rgba(59, 130, 246, 0.42)'
                      : '1px solid rgba(148, 163, 184, 0.16)',
                    flexShrink: 0,
                  }}
                  title="Selecionar transação"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      onToggleSelect?.(
                        item.id,
                      )
                    }
                  />
                </label>
              )}

              <span
                className={`transaction-type-icon ${
                  isIncome
                    ? 'income'
                    : 'expense'
                }`}
                style={{
                  flexShrink: 0,
                }}
              >
                {isIncome ? (
                  <ArrowUpCircle
                    size={18}
                  />
                ) : (
                  <ArrowDownCircle
                    size={18}
                  />
                )}
              </span>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <span
                  className="transaction-title"
                  style={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '720px',
                  }}
                >
                  {item.title}
                </span>

                <div className="transaction-meta">
                  <span className="transaction-date">
                    {formatDate(item.date)}
                  </span>

                  <span className="category-badge">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="transaction-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <span
                className={`transaction-value ${item.type}`}
                style={{
                  minWidth: 110,
                  textAlign: 'right',
                }}
              >
                {isIncome
                  ? '+'
                  : '-'}

                {formatMoney(item.value)}
              </span>

              <div className="transaction-buttons">
                <button
                  className="edit-btn"
                  onClick={() =>
                    onEdit(item.id)
                  }
                  title="Editar transação"
                  aria-label="Editar transação"
                >
                  <Pencil size={15} />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    onDelete(item.id)
                  }
                  title="Excluir transação"
                  aria-label="Excluir transação"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {transactions.length === 0 && (
        <div className="empty-state transaction-empty-state">
          <PlusCircle size={38} />

          <strong>
            Nenhuma transação encontrada
          </strong>

          <span>
            Tente ajustar os filtros ou cadastre uma nova movimentação para começar sua análise.
          </span>
        </div>
      )}
    </div>
  );
}