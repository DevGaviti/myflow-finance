import {
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import Card from '../components/Card';
import TransactionsList from '../components/TransactionsList';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

import { useTransactions } from '../hook/useTransactions';

import { formatMoney } from '../utils/format';
import { exportToCSV } from '../utils/export';

import type {
  Transaction,
  TransactionType,
} from '../types/transaction';

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
    isLoading,
    addTransaction,
    removeTransaction,
    removeTransactions,
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

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<number[]>([]);

  const [
    showBulkDeleteModal,
    setShowBulkDeleteModal,
  ] = useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

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

    await addTransaction(
      newTransaction,
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

    await updateTransaction({
      id: editId,
      title,
      value: Number(value),
      type,
      category,
      date:
        new Date(date).toISOString(),
    });

    setEditId(null);
    resetForm();
    setShowModal(false);
    setIsSaving(false);
  }

  async function handleRemoveTransaction(
    id: number,
  ) {
    setIsDeleting(true);

    try {
      await removeTransaction(id);

      setSelectedIds((prev) =>
        prev.filter(
          (itemId) =>
            itemId !== id,
        ),
      );

      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
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

  const selectedTransactions =
    useMemo(
      () =>
        filteredTransactions.filter(
          (transaction) =>
            selectedIds.includes(
              transaction.id,
            ),
        ),
      [
        filteredTransactions,
        selectedIds,
      ],
    );

  const selectedTotal =
    selectedTransactions.reduce(
      (acc, transaction) =>
        acc + transaction.value,
      0,
    );

  const allFilteredSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every(
      (transaction) =>
        selectedIds.includes(
          transaction.id,
        ),
    );

  function handleToggleTransactionSelection(
    id: number,
  ) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (itemId) =>
              itemId !== id,
          )
        : [
            ...prev,
            id,
          ],
    );
  }

  function handleToggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds((prev) =>
        prev.filter(
          (id) =>
            !filteredTransactions.some(
              (transaction) =>
                transaction.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((prev) =>
      Array.from(
        new Set([
          ...prev,
          ...filteredTransactions.map(
            (transaction) =>
              transaction.id,
          ),
        ]),
      ),
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      await removeTransactions(
        selectedIds,
      );

      clearSelection();
      setShowBulkDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

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

    toast.success(
      'CSV exportado com sucesso!',
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

        {!isLoading &&
          filteredTransactions.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 18,
                padding: '14px 16px',
                border:
                  selectedIds.length > 0
                    ? '1px solid rgba(59, 130, 246, 0.28)'
                    : '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 18,
                background:
                  selectedIds.length > 0
                    ? 'rgba(37, 99, 235, 0.08)'
                    : 'rgba(15, 23, 42, 0.16)',
              }}
            >
              <label
                className="planning-input-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={
                    handleToggleSelectAllFiltered
                  }
                />

                {allFilteredSelected
                  ? 'Desmarcar todas filtradas'
                  : 'Selecionar todas filtradas'}
              </label>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="category-badge">
                    {selectedIds.length} selecionada(s)
                  </span>

                  <span className="category-badge">
                    Total: {formatMoney(selectedTotal)}
                  </span>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={clearSelection}
                  >
                    Limpar seleção
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      setShowBulkDeleteModal(
                        true,
                      )
                    }
                    style={{
                      padding:
                        '0 14px',
                      height: 40,
                    }}
                  >
                    Excluir selecionadas
                  </button>
                </div>
              )}
            </div>
          )}

        {isLoading ? (
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-card"
              >
                <div className="skeleton skeleton-icon" />

                <div className="skeleton-stack">
                  <div className="skeleton skeleton-line medium" />
                  <div className="skeleton skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Nenhuma transação encontrada"
            description={
              transactions.length === 0
                ? 'Adicione sua primeira receita ou despesa para começar a acompanhar sua vida financeira.'
                : 'Nenhum resultado corresponde aos filtros atuais. Ajuste a busca ou limpe os filtros para visualizar suas transações.'
            }
            actionLabel={
              transactions.length === 0
                ? '+ Nova transação'
                : undefined
            }
            onAction={
              transactions.length === 0
                ? handleNewTransaction
                : undefined
            }
          />
        ) : (
          <TransactionsList
            transactions={filteredTransactions}
            selectedIds={selectedIds}
            onToggleSelect={
              handleToggleTransactionSelection
            }
            onEdit={handleEditTransaction}
            onDelete={setDeleteId}
          />
        )}
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

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Excluir transação?"
        description="Essa ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={isDeleting}
        onCancel={() =>
          setDeleteId(null)
        }
        onConfirm={() => {
          if (deleteId) {
            handleRemoveTransaction(
              deleteId,
            );
          }
        }}
      />

      <ConfirmModal
        open={showBulkDeleteModal}
        title="Excluir transações selecionadas?"
        description={`Você está prestes a excluir ${selectedIds.length} transação(ões). Essa ação não pode ser desfeita.`}
        confirmText="Excluir selecionadas"
        cancelText="Cancelar"
        loading={isDeleting}
        onCancel={() =>
          setShowBulkDeleteModal(false)
        }
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
