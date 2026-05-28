import {
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import { supabase } from '../lib/supabase';

import {
  useAuth,
} from '../contexts/AuthContext';

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
  user_id: string;
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
  userId: string,
) {
  return {
    title: transaction.title,
    amount: transaction.value,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date.split('T')[0],
    user_id: userId,
  };
}

export function useTransactions() {
  const { user } = useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  function handleError(
    message: string,
  ) {
    setError(message);
    toast.error(message);
  }

  async function fetchTransactions() {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } =
      await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', {
          ascending: false,
        })
        .order('id', {
          ascending: false,
        });

    if (error) {
      handleError(error.message);
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
  }, [user?.id]);

  async function addTransaction(
    transaction: Transaction,
  ) {
    if (!user) {
      handleError(
        'Usuário não autenticado.',
      );
      return;
    }

    const { data, error } =
      await supabase
        .from('transactions')
        .insert(
          mapToSupabase(
            transaction,
            user.id,
          ),
        )
        .select()
        .single();

    if (error) {
      handleError(error.message);
      return;
    }

    setTransactions(
      (prev) => [
        mapFromSupabase(data),
        ...prev,
      ],
    );

    toast.success(
      'Transação adicionada com sucesso!',
    );
  }

  async function removeTransaction(
    id: number,
  ) {
    if (!user) {
      handleError(
        'Usuário não autenticado.',
      );
      return;
    }

    const { error } =
      await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
      handleError(error.message);
      return;
    }

    setTransactions(
      (prev) =>
        prev.filter(
          (item) =>
            item.id !== id,
        ),
    );

    toast.success(
      'Transação removida.',
    );
  }

  async function updateTransaction(
    updatedTransaction: Transaction,
  ) {
    if (!user) {
      handleError(
        'Usuário não autenticado.',
      );
      return;
    }

    const { data, error } =
      await supabase
        .from('transactions')
        .update(
          mapToSupabase(
            updatedTransaction,
            user.id,
          ),
        )
        .eq(
          'id',
          updatedTransaction.id,
        )
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
      handleError(error.message);
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

    toast.success(
      'Transação atualizada.',
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
