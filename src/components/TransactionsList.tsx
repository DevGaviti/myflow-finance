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

  onEdit: (id: number) => void;

  onDelete: (id: number) => void;
};

export default function TransactionsList({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="transactions">
      {transactions.map((item, index) => {
        const isIncome =
          item.type === 'income';

        return (
          <div
            key={item.id}
            className="transaction-item"
            style={{
              animationDelay: `${index * 0.04}s`,
            }}
          >
            <div className="transaction-left">
              <div className="transaction-title-row">
                <span
                  className={`transaction-type-icon ${
                    isIncome
                      ? 'income'
                      : 'expense'
                  }`}
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

                <span className="transaction-title">
                  {item.title}
                </span>
              </div>

              <div className="transaction-meta">
                <span className="transaction-date">
                  {formatDate(item.date)}
                </span>

                <span className="category-badge">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="transaction-actions">
              <span
                className={`transaction-value ${item.type}`}
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