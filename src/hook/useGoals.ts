import {
    useEffect,
    useState,
  } from 'react';
  
  import { supabase } from '../lib/supabase';
  
  import {
    useAuth,
  } from '../contexts/AuthContext';
  
  import {
    notifyError,
    notifySuccess,
  } from '../lib/toast';
  
  import type {
    Goal,
  } from '../types/goal';
  
  type SupabaseGoal = {
    id: number;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    user_id: string;
  };
  
  function mapFromSupabase(
    goal: SupabaseGoal,
  ): Goal {
    return {
      id: goal.id,
  
      title: goal.title,
  
      targetAmount:
        Number(goal.target_amount),
  
      currentAmount:
        Number(goal.current_amount),
  
      deadline: goal.deadline,
    };
  }
  
  export function useGoals() {
    const { user } = useAuth();
  
    const [goals, setGoals] =
      useState<Goal[]>([]);
  
    const [isLoading, setIsLoading] =
      useState(true);
  
    async function fetchGoals() {
      if (!user) {
        setGoals([]);
        setIsLoading(false);
        return;
      }
  
      setIsLoading(true);
  
      const { data, error } =
        await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('id', {
            ascending: false,
          });
  
      if (error) {
        notifyError(error.message);
        setIsLoading(false);
        return;
      }
  
      setGoals(
        (data ?? []).map(
          mapFromSupabase,
        ),
      );
  
      setIsLoading(false);
    }
  
    useEffect(() => {
      fetchGoals();
    }, [user?.id]);
  
    async function addGoal(
      goal: Omit<Goal, 'id'>,
    ) {
      if (!user) return;
  
      const { data, error } =
        await supabase
          .from('goals')
          .insert({
            title: goal.title,
  
            target_amount:
              goal.targetAmount,
  
            current_amount:
              goal.currentAmount,
  
            deadline:
              goal.deadline,
  
            user_id: user.id,
          })
          .select()
          .single();
  
      if (error) {
        notifyError(error.message);
        return;
      }
  
      setGoals((prev) => [
        mapFromSupabase(data),
        ...prev,
      ]);
  
      notifySuccess(
        'Meta criada com sucesso!',
      );
    }
  
    async function addGoalContribution({
      goalId,
      amount,
      note,
      date,
    }: {
      goalId: number;
      amount: number;
      note?: string | null;
      date: string;
    }) {
      if (!user) return;
  
      const goal =
        goals.find(
          (item) =>
            item.id === goalId,
        );
  
      if (!goal) {
        notifyError(
          'Meta não encontrada.',
        );
        return;
      }
  
      const { error: contributionError } =
        await supabase
          .from('goal_contributions')
          .insert({
            goal_id: goalId,
            user_id: user.id,
            amount,
            note: note || null,
            date,
          });
  
      if (contributionError) {
        notifyError(
          contributionError.message,
        );
        return;
      }
  
      const newCurrentAmount =
        goal.currentAmount + amount;
  
      const { data, error: goalError } =
        await supabase
          .from('goals')
          .update({
            current_amount:
              newCurrentAmount,
          })
          .eq('id', goalId)
          .eq('user_id', user.id)
          .select()
          .single();
  
      if (goalError) {
        notifyError(goalError.message);
        return;
      }
  
      setGoals((prev) =>
        prev.map((item) =>
          item.id === goalId
            ? mapFromSupabase(data)
            : item,
        ),
      );
  
      notifySuccess(
        'Aporte registrado com sucesso!',
      );
    }
  
    async function removeGoal(
      id: number,
    ) {
      const { error } =
        await supabase
          .from('goals')
          .delete()
          .eq('id', id);
  
      if (error) {
        notifyError(error.message);
        return;
      }
  
      setGoals((prev) =>
        prev.filter(
          (goal) =>
            goal.id !== id,
        ),
      );
  
      notifySuccess(
        'Meta removida.',
      );
    }
  
    return {
      goals,
  
      isLoading,
  
      fetchGoals,
  
      addGoal,
  
      addGoalContribution,
  
      removeGoal,
    };
  }