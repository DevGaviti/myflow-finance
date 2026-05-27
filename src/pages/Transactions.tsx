import {
  useState,
} from 'react';

import Toast from '../components/Toast';
import Card from '../components/Card';
import TransactionsList from '../components/TransactionsList';
import TransactionModal from '../components/TransactionModal';

import { useTransactions } from '../hook/useTransactions';

import { formatMoney } from '../utils/format';
import { exportToCSV } from '../utils/export';

import type {
  Transaction,
  TransactionType,
} from '../types/transaction';

type ToastType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

const categories = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Moradia',
  'Salário',
  'Investimentos',
  'Outros',
];

export default function Transactions() {
  const {
    transactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
  } = useTransactions();

  const [search, setSearch] =
    useState('');

  const [filterType, setFilterType] =
    useState<
      'all' | TransactionType
    >('all');

  const [showModal, setShowModal] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [value, setValue] =
    useState('');

  const [
    formattedValue,
    setFormattedValue,
  ] = useState('');

  const [type, setType] =
    useState<TransactionType>(
      'expense',
    );

  const [category, setCategory] =
    useState('Outros');

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    );

  const [editId, setEditId] =
    useState<number | null>(
      null,
    );

  const [deleteId, setDeleteId] =
    useState<number | null>(
      null,
    );

  const [toastMessage, setToastMessage] =
    useState('');

  const [toastType, setToastType] =
    useState<ToastType>('success');

  const [isSaving, setIsSaving] =
    useState(false);

  function formatCurrency(
    input: string,
  ) {
    const numeric =
      input.replace(/\D/g, '');

    const value =
      Number(numeric) / 100;

    return value.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    );
  }

  function handleValueChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const raw =
      e.target.value.replace(
        /\D/g,
        '',
      );

    const numeric =
      Number(raw) / 100;

    setValue(String(numeric));

    setFormattedValue(
      formatCurrency(raw),
    );
  }

  function resetForm() {
    setTitle('');
    setValue('');
    setFormattedValue('');
    setType('expense');
    setCategory('Outros');

    setDate(
      new Date()
        .toISOString()
        .split('T')[0],
    );
  }

  function showToast(
    message: string,
    type: ToastType = 'success',
  ) {
    setToastMessage(message);
    setToastType(type);

    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  }

  function handleNewTransaction() {
    setEditId(null);
    resetForm();
    setShowModal(true);
  }

  async function handleAddTransaction() {
    if (!title || !value)
      return;

    setIsSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    );

    const newTransaction: Transaction =
      {
        id: Date.now(),
        title,
        value: Number(value),
        type,
        category,
        date:
          new Date(date).toISOString(),
      };

    addTransaction(
      newTransaction,
    );

    showToast(
      'Transação cadastrada com sucesso',
      'success',
    );

    resetForm();
    setShowModal(false);
    setIsSaving(false);
  }

  function handleEditTransaction(
    id: number,
  ) {
    const transaction =
      transactions.find(
        (item) =>
          item.id === id,
      );

    if (!transaction)
      return;

    setTitle(
      transaction.title,
    );

    setValue(
      String(
        transaction.value,
      ),
    );

    setFormattedValue(
      formatMoney(
        transaction.value,
      ),
    );

    setType(
      transaction.type,
    );

    setCategory(
      transaction.category,
    );

    setDate(
      transaction.date.split(
        'T',
      )[0],
    );

    setEditId(id);
    setShowModal(true);
  }

  async function handleSaveEditedTransaction() {
    if (!title || !value || !editId)
      return;

    setIsSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    );

    updateTransaction({
      id: editId,
      title,
      value: Number(value),
      type,
      category,
      date:
        new Date(date).toISOString(),
    });

    showToast(
      'Transação atualizada',
      'info',
    );

    setEditId(null);
    resetForm();
    setShowModal(false);
    setIsSaving(false);
  }

  function handleRemoveTransaction(
    id: number,
  ) {
    removeTransaction(id);

    showToast(
      'Transação removida',
      'warning',
    );

    setDeleteId(null);
  }

  const filteredTransactions =
    transactions.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||
        item.category
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          );

      const matchesType =
        filterType === 'all'
          ? true
          : item.type ===
            filterType;

      return (
        matchesSearch &&
        matchesType
      );
    });

  function handleExportCSV() {
    const rows =
      filteredTransactions.map(
        (transaction) => ({
          Titulo:
            transaction.title,

          Categoria:
            transaction.category,

          Tipo:
            transaction.type ===
            'income'
              ? 'Receita'
              : 'Despesa',

          Valor:
            transaction.value,

          Data:
            new Date(
              transaction.date,
            ).toLocaleDateString(
              'pt-BR',
            ),
        }),
      );

    exportToCSV(
      'transacoes',
      rows,
    );

    showToast(
      'CSV exportado com sucesso',
      'success',
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Transações
        </h1>

        <p className="dashboard-subtitle">
          Gerencie todas as suas receitas e despesas.
        </p>
      </div>

      <Card title="Todas as Transações">
        <div className="filters-wrapper">
          <input
            type="text"
            placeholder="Buscar transação..."
            className="search-input"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
          />

          <select
            className="filter-select"
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as
                  | 'all'
                  | TransactionType,
              )
            }
          >
            <option value="all">
              Todas
            </option>

            <option value="income">
              Receitas
            </option>

            <option value="expense">
              Despesas
            </option>
          </select>

          <button
            className="secondary-btn"
            onClick={handleExportCSV}
          >
            Exportar CSV
          </button>

          <button
            className="primary-btn"
            onClick={
              handleNewTransaction
            }
          >
            + Nova transação
          </button>
        </div>

        <TransactionsList
          transactions={
            filteredTransactions
          }
          onEdit={
            handleEditTransaction
          }
          onDelete={setDeleteId}
        />
      </Card>

      <TransactionModal
        showModal={showModal}
        editId={editId}
        title={title}
        value={formattedValue}
        type={type}
        category={category}
        date={date}
        categories={categories}
        isSaving={isSaving}
        onClose={() => {
          if (isSaving)
            return;

          setShowModal(false);
          setEditId(null);
        }}
        onTitleChange={setTitle}
        onValueChange={
          handleValueChange
        }
        onTypeChange={setType}
        onCategoryChange={
          setCategory
        }
        onDateChange={setDate}
        onSave={() =>
          editId
            ? handleSaveEditedTransaction()
            : handleAddTransaction()
        }
      />

      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>
              Excluir transação?
            </h2>

            <p className="delete-text">
              Essa ação não pode ser desfeita.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancelar
              </button>

              <button
                className="danger-btn"
                onClick={() =>
                  handleRemoveTransaction(
                    deleteId,
                  )
                }
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
        />
      )}
    </div>
  );
}