import {
  useEffect,
  useState,
} from 'react';

import TransactionModal from '../components/TransactionModal';
import TransactionsList from '../components/TransactionsList';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import FinanceChart from '../components/FinanceChart';
import CategoryChart from '../components/CategoryChart';
import PageLoader from '../components/PageLoader';

import { useTransactions } from '../hook/useTransactions';

import { formatMoney } from '../utils/format';

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

type PeriodFilter =
  | 'all'
  | 'today'
  | '7days'
  | '30days'
  | 'month';

export default function Dashboard() {
  const {
    transactions,
    addTransaction: addTransactionHook,
    removeTransaction: removeTransactionHook,
    updateTransaction,
  } = useTransactions();

  const [isLoading, setIsLoading] =
    useState(true);

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

  const [search, setSearch] =
    useState('');

  const [filterType, setFilterType] =
    useState<
      'all' | TransactionType
    >('all');

  const [periodFilter, setPeriodFilter] =
    useState<PeriodFilter>('all');

  const [startDate, setStartDate] =
    useState('');

  const [endDate, setEndDate] =
    useState('');

  const [deleteId, setDeleteId] =
    useState<number | null>(
      null,
    );

  const [editId, setEditId] =
    useState<number | null>(
      null,
    );

  const hasCustomDateFilter =
    Boolean(startDate) ||
    Boolean(endDate);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setIsLoading(false);
      }, 900);

    return () =>
      clearTimeout(timer);
  }, []);

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

  function handleStartDateChange(
    value: string,
  ) {
    setStartDate(value);
    setPeriodFilter('all');
  }

  function handleEndDateChange(
    value: string,
  ) {
    setEndDate(value);
    setPeriodFilter('all');
  }

  function clearDateRange() {
    setStartDate('');
    setEndDate('');
  }

  const now = new Date();

  const filteredByPeriod =
    transactions.filter(
      (transaction) => {
        const transactionDate =
          new Date(
            transaction.date,
          );

        if (hasCustomDateFilter) {
          const start =
            startDate
              ? new Date(
                  `${startDate}T00:00:00`,
                )
              : null;

          const end =
            endDate
              ? new Date(
                  `${endDate}T23:59:59`,
                )
              : null;

          if (
            start &&
            transactionDate < start
          ) {
            return false;
          }

          if (
            end &&
            transactionDate > end
          ) {
            return false;
          }

          return true;
        }

        if (
          periodFilter === 'all'
        )
          return true;

        const diffTime =
          now.getTime() -
          transactionDate.getTime();

        const diffDays =
          diffTime /
          (1000 * 60 * 60 * 24);

        if (
          periodFilter ===
          'today'
        ) {
          return (
            transactionDate.toDateString() ===
            now.toDateString()
          );
        }

        if (
          periodFilter ===
          '7days'
        ) {
          return diffDays <= 7;
        }

        if (
          periodFilter ===
          '30days'
        ) {
          return diffDays <= 30;
        }

        if (
          periodFilter ===
          'month'
        ) {
          return (
            transactionDate.getMonth() ===
              now.getMonth() &&
            transactionDate.getFullYear() ===
              now.getFullYear()
          );
        }

        return true;
      },
    );

  const filteredTransactions =
    filteredByPeriod.filter(
      (item) => {
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
          filterType ===
          'all'
            ? true
            : item.type ===
              filterType;

        return (
          matchesSearch &&
          matchesType
        );
      },
    );

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

  function addTransaction() {
    if (!title || !value)
      return;

    const newTransaction: Transaction =
      {
        id: Date.now(),
        title,
        value:
          Number(value),
        type,
        category,
        date:
          new Date(
            `${date}T12:00:00`,
          ).toISOString(),
      };

    addTransactionHook(
      newTransaction,
    );

    resetForm();

    setShowModal(false);
  }

  function removeTransaction(
    id: number,
  ) {
    removeTransactionHook(id);

    setDeleteId(null);
  }

  function editTransaction(
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

  function saveEditedTransaction() {
    if (!title || !value)
      return;

    updateTransaction({
      id: editId!,
      title,
      value: Number(value),
      type,
      category,
      date:
        new Date(
          `${date}T12:00:00`,
        ).toISOString(),
    });

    setEditId(null);

    resetForm();

    setShowModal(false);
  }

  const monthlyMap = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  filteredByPeriod.forEach(
    (transaction) => {
      const date =
        new Date(
          transaction.date,
        );

      const monthKey =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}`;

      const current =
        monthlyMap.get(
          monthKey,
        ) || {
          income: 0,
          expense: 0,
        };

      if (
        transaction.type ===
        'income'
      ) {
        current.income +=
          transaction.value;
      } else {
        current.expense +=
          transaction.value;
      }

      monthlyMap.set(
        monthKey,
        current,
      );
    },
  );

  const monthlyData =
    Array.from(
      monthlyMap.entries(),
    )
      .sort(
        ([a], [b]) =>
          a.localeCompare(b),
      )
      .map(
        ([
          monthKey,
          values,
        ]) => {
          const [
            year,
            month,
          ] = monthKey
            .split('-')
            .map(Number);

          const date =
            new Date(
              year,
              month - 1,
            );

          return {
            month:
              date
                .toLocaleDateString(
                  'pt-BR',
                  {
                    month: 'short',
                  },
                )
                .replace('.', '')
                .replace(
                  /^./,
                  (char) =>
                    char.toUpperCase(),
                ),

            income:
              values.income,

            expense:
              values.expense,
          };
        },
      );

  const categoryMap = new Map<
    string,
    number
  >();

  filteredByPeriod
    .filter(
      (transaction) =>
        transaction.type ===
        'expense',
    )
    .forEach(
      (transaction) => {
        const current =
          categoryMap.get(
            transaction.category,
          ) || 0;

        categoryMap.set(
          transaction.category,
          current +
            transaction.value,
        );
      },
    );

  const categoryData =
    Array.from(
      categoryMap.entries(),
    ).map(
      ([
        category,
        value,
      ]) => ({
        category,
        value,
      }),
    );

  const filteredIncome =
    filteredByPeriod
      .filter(
        (item) =>
          item.type ===
          'income',
      )
      .reduce(
        (acc, item) =>
          acc + item.value,
        0,
      );

  const filteredExpense =
    filteredByPeriod
      .filter(
        (item) =>
          item.type ===
          'expense',
      )
      .reduce(
        (acc, item) =>
          acc + item.value,
        0,
      );

  const filteredBalance =
    filteredIncome -
    filteredExpense;

  const kpis = [
    {
      label: 'Saldo',
      value:
        formatMoney(
          filteredBalance,
        ),
    },
    {
      label: 'Entradas',
      value:
        formatMoney(
          filteredIncome,
        ),
    },
    {
      label: 'Despesas',
      value:
        formatMoney(
          filteredExpense,
        ),
    },
    {
      label:
        'Transações',
      value: String(
        filteredByPeriod.length,
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div>
      <Topbar
        onNewTransaction={() => {
          setEditId(null);
          resetForm();
          setShowModal(true);
        }}
      />

      <div className="dashboard-header dashboard-header-compact">
        <div className="period-filter-wrapper">
          <select
            className="period-select"
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(
                e.target
                  .value as PeriodFilter,
              );

              clearDateRange();
            }}
          >
            <option value="all">
              Todos os períodos
            </option>

            <option value="today">
              Hoje
            </option>

            <option value="7days">
              Últimos 7 dias
            </option>

            <option value="30days">
              Últimos 30 dias
            </option>

            <option value="month">
              Este mês
            </option>
          </select>

          <div className="custom-date-filter">
            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                handleStartDateChange(
                  e.target.value,
                )
              }
              aria-label="Data inicial"
            />

            <span>até</span>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                handleEndDateChange(
                  e.target.value,
                )
              }
              aria-label="Data final"
            />

            {hasCustomDateFilter && (
              <button
                type="button"
                className="clear-date-filter"
                onClick={clearDateRange}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(
          (item) => (
            <KPICard
              key={
                item.label
              }
              label={
                item.label
              }
              value={
                item.value
              }
            />
          ),
        )}
      </div>

      <div className="dashboard-grid">
        <Card title="Fluxo Financeiro">
          <FinanceChart
            monthlyData={
              monthlyData
            }
          />
        </Card>

        <Card title="Despesas por Categoria">
          <CategoryChart
            data={
              categoryData
            }
          />
        </Card>

        <Card title="Resumo do Mês">
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">
                Receitas
              </span>

              <span className="summary-value income">
                {formatMoney(
                  filteredIncome,
                )}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Despesas
              </span>

              <span className="summary-value expense">
                {formatMoney(
                  filteredExpense,
                )}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                Saldo
              </span>

              <span className="summary-value">
                {formatMoney(
                  filteredBalance,
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="transactions-wrapper">
        <Card title="Últimas Transações">
          <div className="filters-wrapper">
            <input
              type="text"
              placeholder="Buscar transação..."
              className="search-input"
              value={search}
              onChange={(
                e,
              ) =>
                setSearch(
                  e.target
                    .value,
                )
              }
            />

            <select
              className="filter-select"
              value={
                filterType
              }
              onChange={(
                e,
              ) =>
                setFilterType(
                  e.target
                    .value as
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
          </div>

          <TransactionsList
            transactions={
              filteredTransactions
            }
            onEdit={
              editTransaction
            }
            onDelete={(
              id,
            ) =>
              setDeleteId(id)
            }
          />
        </Card>
      </div>

      <TransactionModal
        showModal={showModal}
        editId={editId}
        title={title}
        value={formattedValue}
        type={type}
        category={category}
        date={date}
        categories={categories}
        onClose={() => {
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
            ? saveEditedTransaction()
            : addTransaction()
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
                  setDeleteId(
                    null,
                  )
                }
              >
                Cancelar
              </button>

              <button
                className="danger-btn"
                onClick={() =>
                  removeTransaction(
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
    </div>
  );
}