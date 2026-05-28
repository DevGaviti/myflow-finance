import {
  useEffect,
  useState,
} from 'react';

import { supabase } from '../lib/supabase';

import type {
  Transaction,
} from '../types/transaction';

type SupabaseTransaction = {
  id: number;
  title: string;
  amount: number;
  type: Transaction['type'];
  category: string;
  date: string;
  created_at: string;
};

function mapFromSupabase(
  transaction: SupabaseTransaction,
): Transaction {
  return {
    id: transaction.id,
    title: transaction.title,
    value: Number(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    date: new Date(
      `${transaction.date}T12:00:00`,
    ).toISOString(),
  };
}

function mapToSupabase(
  transaction: Transaction,
) {
  return {
    title: transaction.title,
    amount: transaction.value,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date.split('T')[0],
  };
}

export function useTransactions() {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function fetchTransactions() {
    setIsLoading(true);
    setError(null);

    const { data, error } =
      await supabase
        .from('transactions')
        .select('*')
        .order('date', {
          ascending: false,
        })
        .order('id', {
          ascending: false,
        });

    if (error) {
      setError(error.message);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setTransactions(
      (data ?? []).map(
        mapFromSupabase,
      ),
    );

    setIsLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function addTransaction(
    transaction: Transaction,
  ) {
    const { data, error } =
      await supabase
        .from('transactions')
        .insert(
          mapToSupabase(
            transaction,
          ),
        )
        .select()
        .single();

    if (error) {
      setError(error.message);
      return;
    }

    setTransactions(
      (prev) => [
        mapFromSupabase(data),
        ...prev,
      ],
    );
  }

  async function removeTransaction(
    id: number,
  ) {
    const { error } =
      await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    setTransactions(
      (prev) =>
        prev.filter(
          (item) =>
            item.id !== id,
        ),
    );
  }

  async function updateTransaction(
    updatedTransaction: Transaction,
  ) {
    const { data, error } =
      await supabase
        .from('transactions')
        .update(
          mapToSupabase(
            updatedTransaction,
          ),
        )
        .eq(
          'id',
          updatedTransaction.id,
        )
        .select()
        .single();

    if (error) {
      setError(error.message);
      return;
    }

    setTransactions(
      (prev) =>
        prev.map((item) =>
          item.id ===
          updatedTransaction.id
            ? mapFromSupabase(data)
            : item,
        ),
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

    isLoading,

    error,

    fetchTransactions,

    addTransaction,

    removeTransaction,

    updateTransaction,
  };
}