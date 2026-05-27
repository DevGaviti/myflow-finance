import {
  useEffect,
  useState,
} from 'react';

import type {
  Transaction,
} from '../types/transaction';

const initialTransactions: Transaction[] =
  [
    {
      id: 1,
      title: 'Salário',
      date: new Date().toISOString(),
      value: 4500,
      type: 'income',
      category: 'Salário',
    },

    {
      id: 2,
      title: 'Academia',
      date: new Date().toISOString(),
      value: 100,
      type: 'expense',
      category: 'Lazer',
    },

    {
      id: 3,
      title: 'Mercado',
      date: new Date().toISOString(),
      value: 320,
      type: 'expense',
      category: 'Alimentação',
    },
  ];

function isValidDate(date: string) {
  return !Number.isNaN(
    new Date(date).getTime(),
  );
}

function normalizeTransactionDate(
  date: string,
) {
  if (isValidDate(date)) {
    return new Date(
      date,
    ).toISOString();
  }

  return new Date().toISOString();
}

function normalizeTransactions(
  transactions: Transaction[],
) {
  return transactions.map(
    (transaction) => ({
      ...transaction,

      date:
        normalizeTransactionDate(
          transaction.date,
        ),
    }),
  );
}

export function useTransactions() {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    () => {
      const stored =
        localStorage.getItem(
          'finance-transactions',
        );

      if (stored) {
        try {
          const parsed =
            JSON.parse(
              stored,
            ) as Transaction[];

          return normalizeTransactions(
            parsed,
          );
        } catch {
          return initialTransactions;
        }
      }

      return initialTransactions;
    },
  );

  useEffect(() => {
    localStorage.setItem(
      'finance-transactions',
      JSON.stringify(
        transactions,
      ),
    );
  }, [transactions]);

  function addTransaction(
    transaction: Transaction,
  ) {
    setTransactions(
      (prev) => [
        {
          ...transaction,

          date:
            normalizeTransactionDate(
              transaction.date,
            ),
        },
        ...prev,
      ],
    );
  }

  function removeTransaction(
    id: number,
  ) {
    setTransactions(
      (prev) =>
        prev.filter(
          (item) =>
            item.id !== id,
        ),
    );
  }

  function updateTransaction(
    updatedTransaction: Transaction,
  ) {
    setTransactions(
      (prev) =>
        prev.map((item) => {
          if (
            item.id ===
            updatedTransaction.id
          ) {
            return {
              ...updatedTransaction,

              date:
                normalizeTransactionDate(
                  updatedTransaction.date,
                ),
            };
          }

          return item;
        }),
    );
  }

  const totalIncome =
    transactions
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

  const totalExpense =
    transactions
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

  const balance =
    totalIncome -
    totalExpense;

  return {
    transactions,

    totalIncome,

    totalExpense,

    balance,

    addTransaction,

    removeTransaction,

    updateTransaction,
  };
}