import {
  useEffect,
  useState,
} from 'react';

import type {
  FormEvent,
  ReactNode,
} from 'react';

import {
  Save,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Target,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Banknote,
  Star,
} from 'lucide-react';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingButton from '../components/LoadingButton';

import { useFinancialProfile } from '../hook/useFinancialProfile';
import { useGoals } from '../hook/useGoals';
import { usePlanningSettings } from '../hook/usePlanningSettings';

import type { FinancialProfileFormData } from '../types/financialProfile';
import type { PlanningSettingsFormData } from '../types/planningSettings';
import type { GoalPriority } from '../types/goal';

import { formatMoney } from '../utils/format';

type FinancialProfileField =
  keyof FinancialProfileFormData;

type PlanningSettingsField =
  keyof PlanningSettingsFormData;

type DiagnosisStatus =
  | 'healthy'
  | 'attention'
  | 'critical';

const initialFormData: FinancialProfileFormData = {
  salary: 0,
  extra_income: 0,
  rent: 0,
  energy: 0,
  water: 0,
  internet: 0,
  financing: 0,
  current_savings: 0,
};

const initialPlanningSettings: PlanningSettingsFormData = {
  goals_percentage: 70,
  reserve_percentage: 20,
  free_percentage: 10,
};

const priorityOrder: Record<GoalPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const priorityLabels: Record<GoalPriority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

function formatNumberForInput(value: number) {
  if (!value) return '';

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyInput(value: string) {
  const cleaned = value
    .replace(/[^\d,.]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function addMonthsToCurrentDate(months: number) {
  const date = new Date();

  date.setMonth(date.getMonth() + months);

  return date.toLocaleDateString('pt-BR');
}

export function Planning() {
  const {
    profile,
    loading,
    saveProfile,
  } = useFinancialProfile();

  const {
    settings,
    loading: loadingSettings,
    saveSettings,
  } = usePlanningSettings();

  const {
    goals,
    isLoading: isLoadingGoals,
  } = useGoals();

  const [
    formData,
    setFormData,
  ] = useState<FinancialProfileFormData>(
    initialFormData,
  );

  const [
    displayValues,
    setDisplayValues,
  ] = useState<Record<FinancialProfileField, string>>({
    salary: '',
    extra_income: '',
    rent: '',
    energy: '',
    water: '',
    internet: '',
    financing: '',
    current_savings: '',
  });

  const [
    planningSettingsForm,
    setPlanningSettingsForm,
  ] = useState<PlanningSettingsFormData>(
    initialPlanningSettings,
  );

  const [saving, setSaving] =
    useState(false);

  const [
    savingSettings,
    setSavingSettings,
  ] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const nextFormData = {
      salary: profile.salary,
      extra_income: profile.extra_income,
      rent: profile.rent,
      energy: profile.energy,
      water: profile.water,
      internet: profile.internet,
      financing: profile.financing,
      current_savings:
        profile.current_savings,
    };

    setFormData(nextFormData);

    setDisplayValues({
      salary: formatNumberForInput(
        nextFormData.salary,
      ),
      extra_income: formatNumberForInput(
        nextFormData.extra_income,
      ),
      rent: formatNumberForInput(
        nextFormData.rent,
      ),
      energy: formatNumberForInput(
        nextFormData.energy,
      ),
      water: formatNumberForInput(
        nextFormData.water,
      ),
      internet: formatNumberForInput(
        nextFormData.internet,
      ),
      financing: formatNumberForInput(
        nextFormData.financing,
      ),
      current_savings:
        formatNumberForInput(
          nextFormData.current_savings,
        ),
    });
  }, [profile]);

  useEffect(() => {
    if (!settings) return;

    setPlanningSettingsForm({
      goals_percentage:
        settings.goals_percentage,
      reserve_percentage:
        settings.reserve_percentage,
      free_percentage:
        settings.free_percentage,
    });
  }, [settings]);

  function handleChange(
    field: FinancialProfileField,
    value: string,
  ) {
    setDisplayValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormData((prev) => ({
      ...prev,
      [field]: parseCurrencyInput(value),
    }));
  }

  function handleBlur(
    field: FinancialProfileField,
  ) {
    setDisplayValues((prev) => ({
      ...prev,
      [field]: formatNumberForInput(
        formData[field],
      ),
    }));
  }

  function handlePlanningSettingsChange(
    field: PlanningSettingsField,
    value: string,
  ) {
    const parsed = Number(value);

    setPlanningSettingsForm((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsed)
        ? 0
        : parsed,
    }));
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);

    try {
      await saveProfile(formData);

      alert(
        'Perfil financeiro salvo com sucesso!',
      );
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao salvar perfil financeiro.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlanningSettings(
    event: FormEvent,
  ) {
    event.preventDefault();

    const total =
      planningSettingsForm.goals_percentage +
      planningSettingsForm.reserve_percentage +
      planningSettingsForm.free_percentage;

    if (total !== 100) {
      alert(
        'A soma dos percentuais precisa ser igual a 100%.',
      );

      return;
    }

    setSavingSettings(true);

    try {
      await saveSettings(
        planningSettingsForm,
      );

      alert(
        'Motor de planejamento salvo com sucesso!',
      );
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao salvar motor de planejamento.',
      );
    } finally {
      setSavingSettings(false);
    }
  }

  const totalIncome =
    formData.salary +
    formData.extra_income;

  const fixedExpenses =
    formData.rent +
    formData.energy +
    formData.water +
    formData.internet +
    formData.financing;

  const monthlySurplus =
    totalIncome - fixedExpenses;

  const positiveMonthlySurplus =
    Math.max(monthlySurplus, 0);

  const savingCapacity =
    totalIncome > 0
      ? (monthlySurplus / totalIncome) * 100
      : 0;

  const fixedExpensesPercentage =
    totalIncome > 0
      ? (fixedExpenses / totalIncome) * 100
      : 0;

  const survivalMonths =
    fixedExpenses > 0
      ? formData.current_savings /
        fixedExpenses
      : 0;

  const planningPercentageTotal =
    planningSettingsForm.goals_percentage +
    planningSettingsForm.reserve_percentage +
    planningSettingsForm.free_percentage;

  const goalsBudget =
    positiveMonthlySurplus *
    (planningSettingsForm.goals_percentage / 100);

  const reserveBudget =
    positiveMonthlySurplus *
    (planningSettingsForm.reserve_percentage / 100);

  const freeBudget =
    positiveMonthlySurplus *
    (planningSettingsForm.free_percentage / 100);

  const diagnosisIssues = [
    monthlySurplus < 0
      ? 'Sua sobra mensal está negativa. Suas despesas fixas estão maiores que sua renda.'
      : null,
    fixedExpensesPercentage > 70
      ? 'Suas despesas fixas estão acima de 70% da renda. Isso reduz sua margem para metas e imprevistos.'
      : null,
    survivalMonths > 0 && survivalMonths < 3
      ? 'Sua reserva cobre menos de 3 meses de despesas fixas.'
      : null,
    formData.current_savings === 0
      ? 'Você ainda não possui reserva financeira cadastrada.'
      : null,
  ].filter(Boolean) as string[];

  const diagnosisStatus: DiagnosisStatus =
    monthlySurplus < 0
      ? 'critical'
      : diagnosisIssues.length > 0
        ? 'attention'
        : 'healthy';

  const diagnosisTitle =
    diagnosisStatus === 'healthy'
      ? 'Saudável'
      : diagnosisStatus === 'attention'
        ? 'Atenção'
        : 'Crítico';

  const diagnosisDescription =
    diagnosisStatus === 'healthy'
      ? 'Seu perfil financeiro apresenta boa margem para manter metas e construir reserva.'
      : diagnosisStatus === 'attention'
        ? 'Seu perfil financeiro tem pontos que merecem acompanhamento antes de assumir novas metas.'
        : 'Seu perfil financeiro exige ajuste antes de avançar com novas metas ou compromissos.';

  const activeGoals = goals
    .filter(
      (goal) =>
        goal.currentAmount <
        goal.targetAmount,
    )
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) {
        return -1;
      }

      if (!a.isPrimary && b.isPrimary) {
        return 1;
      }

      const priorityDifference =
        priorityOrder[a.priority] -
        priorityOrder[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return a.id - b.id;
    });

  const totalMissingForGoals =
    activeGoals.reduce(
      (acc, goal) =>
        acc +
        Math.max(
          goal.targetAmount -
            goal.currentAmount,
          0,
        ),
      0,
    );

  const monthsToCompleteAllGoals =
    goalsBudget > 0 &&
    totalMissingForGoals > 0
      ? Math.ceil(
          totalMissingForGoals /
            goalsBudget,
        )
      : 0;

  let accumulatedMissingAmount = 0;

  const projectedGoals =
    activeGoals.map((goal) => {
      const remainingAmount =
        Math.max(
          goal.targetAmount -
            goal.currentAmount,
          0,
        );

      accumulatedMissingAmount +=
        remainingAmount;

      const monthsToComplete =
        goalsBudget > 0
          ? Math.ceil(
              accumulatedMissingAmount /
                goalsBudget,
            )
          : null;

      return {
        ...goal,
        remainingAmount,
        monthsToComplete,
        projectedDate:
          monthsToComplete !== null
            ? addMonthsToCurrentDate(
                monthsToComplete,
              )
            : null,
      };
    });

  const primaryGoalProjection =
    projectedGoals.find(
      (goal) => goal.isPrimary,
    );

  if (loading || loadingSettings) {
    return (
      <div className="planning-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Planejamento Financeiro
          </h1>

          <p className="dashboard-subtitle">
            Carregando seu planejamento financeiro...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Planejamento Financeiro
        </h1>

        <p className="dashboard-subtitle">
          Organize suas receitas, despesas fixas e reserva para entender sua capacidade real de economia.
        </p>
      </div>

      <Card
        title="Perfil financeiro"
        subtitle="Digite os valores reais. Exemplo: 1000 representa R$ 1.000,00."
      >
        <form
          onSubmit={handleSubmit}
          className="planning-form"
        >
          <section className="planning-section">
            <div className="planning-section-header">
              <span className="goal-eyebrow">
                Receitas mensais
              </span>
            </div>

            <div className="planning-input-grid two">
              <MoneyInput
                label="Salário"
                value={displayValues.salary}
                onChange={(value) =>
                  handleChange(
                    'salary',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur('salary')
                }
              />

              <MoneyInput
                label="Renda extra"
                value={
                  displayValues.extra_income
                }
                onChange={(value) =>
                  handleChange(
                    'extra_income',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'extra_income',
                  )
                }
              />
            </div>
          </section>

          <section className="planning-section">
            <div className="planning-section-header">
              <span className="goal-eyebrow">
                Despesas fixas
              </span>
            </div>

            <div className="planning-input-grid five">
              <MoneyInput
                label="Aluguel"
                value={displayValues.rent}
                onChange={(value) =>
                  handleChange(
                    'rent',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur('rent')
                }
              />

              <MoneyInput
                label="Energia"
                value={displayValues.energy}
                onChange={(value) =>
                  handleChange(
                    'energy',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur('energy')
                }
              />

              <MoneyInput
                label="Água"
                value={displayValues.water}
                onChange={(value) =>
                  handleChange(
                    'water',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur('water')
                }
              />

              <MoneyInput
                label="Internet"
                value={
                  displayValues.internet
                }
                onChange={(value) =>
                  handleChange(
                    'internet',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'internet',
                  )
                }
              />

              <MoneyInput
                label="Financiamento"
                value={
                  displayValues.financing
                }
                onChange={(value) =>
                  handleChange(
                    'financing',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'financing',
                  )
                }
              />
            </div>
          </section>

          <section className="planning-section">
            <div className="planning-section-header">
              <span className="goal-eyebrow">
                Reserva financeira
              </span>
            </div>

            <div className="planning-input-grid two">
              <MoneyInput
                label="Reserva atual"
                value={
                  displayValues.current_savings
                }
                onChange={(value) =>
                  handleChange(
                    'current_savings',
                    value,
                  )
                }
                onBlur={() =>
                  handleBlur(
                    'current_savings',
                  )
                }
              />
            </div>
          </section>

          <div className="planning-actions">
            <LoadingButton
              className="primary-btn"
              isLoading={saving}
            >
              <Save size={18} />
              {saving
                ? 'Salvando...'
                : 'Salvar perfil'}
            </LoadingButton>
          </div>
        </form>
      </Card>

      <Card
        title="Motor de planejamento"
        subtitle="Defina como a sobra mensal será distribuída entre metas, reserva e uso livre."
      >
        <form
          onSubmit={
            handleSavePlanningSettings
          }
          className="planning-form"
        >
          <section className="planning-section">
            <div className="planning-section-header">
              <span className="goal-eyebrow">
                Distribuição da sobra mensal
              </span>

              <span className="planning-input-label">
                Total: {planningPercentageTotal}%
              </span>
            </div>

            <div className="planning-input-grid two">
              <PercentInput
                label="Metas"
                value={
                  planningSettingsForm.goals_percentage
                }
                onChange={(value) =>
                  handlePlanningSettingsChange(
                    'goals_percentage',
                    value,
                  )
                }
              />

              <PercentInput
                label="Reserva"
                value={
                  planningSettingsForm.reserve_percentage
                }
                onChange={(value) =>
                  handlePlanningSettingsChange(
                    'reserve_percentage',
                    value,
                  )
                }
              />

              <PercentInput
                label="Uso livre"
                value={
                  planningSettingsForm.free_percentage
                }
                onChange={(value) =>
                  handlePlanningSettingsChange(
                    'free_percentage',
                    value,
                  )
                }
              />
            </div>
          </section>

          <div className="planning-actions">
            <LoadingButton
              className="primary-btn"
              isLoading={savingSettings}
            >
              <SlidersHorizontal size={18} />
              {savingSettings
                ? 'Salvando...'
                : 'Salvar motor'}
            </LoadingButton>
          </div>
        </form>
      </Card>

      {primaryGoalProjection && (
        <Card
          title="Objetivo principal"
          subtitle="Resumo da sua meta mais importante no planejamento atual."
        >
          <div className="planning-diagnosis-card healthy">
            <div className="planning-diagnosis-header">
              <div>
                <span className="goal-eyebrow">
                  Meta principal
                </span>

                <div className="goal-values">
                  <strong>
                    {primaryGoalProjection.title}
                  </strong>

                  <span>
                    Faltam{' '}
                    {formatMoney(
                      primaryGoalProjection.remainingAmount,
                    )}
                  </span>
                </div>
              </div>

              <div className="planning-metric-icon">
                <Star size={20} />
              </div>
            </div>

            <p className="planning-alert-item">
              Com{' '}
              {formatMoney(goalsBudget)} por mês destinado a metas, sua meta principal será atingida em aproximadamente{' '}
              <strong>
                {primaryGoalProjection.monthsToComplete}{' '}
                meses
              </strong>
              , com previsão para{' '}
              <strong>
                {primaryGoalProjection.projectedDate}
              </strong>
              .
            </p>
          </div>
        </Card>
      )}

      <div className="planning-metrics-grid">
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Receita mensal"
          value={formatMoney(totalIncome)}
          description="Salário mais rendas extras."
        />

        <MetricCard
          icon={<TrendingDown size={20} />}
          label="Despesas fixas"
          value={formatMoney(fixedExpenses)}
          description={`${fixedExpensesPercentage.toFixed(1)}% da sua renda mensal.`}
        />

        <MetricCard
          icon={<Wallet size={20} />}
          label="Sobra mensal"
          value={formatMoney(monthlySurplus)}
          description={
            monthlySurplus >= 0
              ? 'Valor disponível após despesas fixas.'
              : 'Suas despesas fixas superam sua renda.'
          }
        />

        <MetricCard
          icon={<Target size={20} />}
          label="Para metas"
          value={formatMoney(goalsBudget)}
          description={`${planningSettingsForm.goals_percentage}% da sobra mensal positiva.`}
        />

        <MetricCard
          icon={<ShieldCheck size={20} />}
          label="Para reserva"
          value={formatMoney(reserveBudget)}
          description={`${planningSettingsForm.reserve_percentage}% da sobra mensal positiva.`}
        />

        <MetricCard
          icon={<Banknote size={20} />}
          label="Uso livre"
          value={formatMoney(freeBudget)}
          description={`${planningSettingsForm.free_percentage}% da sobra mensal positiva.`}
        />

        <MetricCard
          icon={<PiggyBank size={20} />}
          label="Capacidade de economia"
          value={`${savingCapacity.toFixed(1)}%`}
          description="Percentual da renda que sobra."
        />

        <MetricCard
          icon={<ShieldCheck size={20} />}
          label="Reserva atual"
          value={formatMoney(
            formData.current_savings,
          )}
          description="Valor disponível hoje."
        />

        <MetricCard
          icon={<Wallet size={20} />}
          label="Sobrevivência financeira"
          value={`${survivalMonths.toFixed(
            1,
          )} meses`}
          description="Cobertura considerando despesas fixas."
        />
      </div>

      <Card
        title="Diagnóstico financeiro"
        subtitle="Análise automática baseada no seu perfil financeiro atual."
      >
        <div
          className={`planning-diagnosis-card ${diagnosisStatus}`}
        >
          <div className="planning-diagnosis-header">
            <div>
              <span className="goal-eyebrow">
                Status geral
              </span>

              <div className="goal-values">
                <strong>
                  {diagnosisTitle}
                </strong>

                <span>
                  {diagnosisDescription}
                </span>
              </div>
            </div>

            <div className="planning-metric-icon">
              {diagnosisStatus ===
                'healthy' && (
                <CheckCircle2 size={20} />
              )}

              {diagnosisStatus ===
                'attention' && (
                <AlertTriangle size={20} />
              )}

              {diagnosisStatus ===
                'critical' && (
                <XCircle size={20} />
              )}
            </div>
          </div>

          {diagnosisIssues.length > 0 ? (
            <div className="planning-alert-list">
              {diagnosisIssues.map((issue) => (
                <p
                  key={issue}
                  className="planning-alert-item"
                >
                  • {issue}
                </p>
              ))}
            </div>
          ) : (
            <p className="planning-alert-item">
              Nenhum alerta financeiro relevante identificado neste momento.
            </p>
          )}
        </div>
      </Card>

      <Card
        title="Projeção das metas"
        subtitle="Estimativa sequencial baseada em objetivo principal e prioridade."
      >
        {isLoadingGoals ? (
          <p className="dashboard-subtitle">
            Carregando metas...
          </p>
        ) : activeGoals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Nenhuma meta pendente"
            description="Crie uma meta financeira ou aguarde uma meta existente ter valor pendente para projetar o prazo."
          />
        ) : goalsBudget <= 0 ? (
          <EmptyState
            icon="⚠️"
            title="Valor para metas insuficiente"
            description="Com os dados atuais, não existe valor positivo destinado para metas."
          />
        ) : (
          <div className="planning-form">
            <div className="planning-diagnosis-card">
              <div className="planning-diagnosis-header">
                <div>
                  <span className="goal-eyebrow">
                    Resumo geral
                  </span>

                  <div className="goal-values">
                    <strong>
                      {formatMoney(
                        totalMissingForGoals,
                      )}
                    </strong>

                    <span>
                      pendente em metas
                    </span>
                  </div>
                </div>

                <div className="planning-metric-icon">
                  <CalendarDays size={20} />
                </div>
              </div>

              <p className="planning-alert-item">
                Com{' '}
                {formatMoney(goalsBudget)} por mês destinado a metas, seguindo a ordem de objetivo principal e prioridade, você concluiria todas as metas pendentes em aproximadamente{' '}
                <strong>
                  {monthsToCompleteAllGoals}{' '}
                  meses
                </strong>
                .
              </p>
            </div>

            <div className="planning-metrics-grid">
              {projectedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="planning-metric-card"
                >
                  <div className="planning-metric-top">
                    <div>
                      <span className="planning-metric-label">
                        {goal.isPrimary
                          ? 'Objetivo principal'
                          : `Prioridade ${priorityLabels[goal.priority]}`}
                      </span>

                      <strong className="planning-metric-value">
                        {goal.title}
                      </strong>
                    </div>

                    <div className="planning-metric-icon">
                      {goal.isPrimary ? (
                        <Star size={20} />
                      ) : (
                        <Target size={20} />
                      )}
                    </div>
                  </div>

                  <p className="planning-metric-description">
                    Faltam{' '}
                    <strong>
                      {formatMoney(
                        goal.remainingAmount,
                      )}
                    </strong>
                    . Considerando as metas anteriores da fila, prazo estimado:{' '}
                    <strong>
                      {goal.monthsToComplete}{' '}
                      meses
                    </strong>
                    . Previsão:{' '}
                    <strong>
                      {goal.projectedDate}
                    </strong>
                    .
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

type MoneyInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

function MoneyInput({
  label,
  value,
  onChange,
  onBlur,
}: MoneyInputProps) {
  return (
    <label className="planning-input-field">
      <span className="planning-input-label">
        {label}
      </span>

      <div className="planning-input-wrapper">
        <span className="planning-input-prefix">
          R$
        </span>

        <input
          className="search-input planning-input"
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          onBlur={onBlur}
        />
      </div>
    </label>
  );
}

type PercentInputProps = {
  label: string;
  value: number;
  onChange: (value: string) => void;
};

function PercentInput({
  label,
  value,
  onChange,
}: PercentInputProps) {
  return (
    <label className="planning-input-field">
      <span className="planning-input-label">
        {label}
      </span>

      <div className="planning-input-wrapper">
        <input
          className="search-input planning-input"
          type="number"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        <span
          className="planning-input-prefix"
          style={{
            left: 'auto',
            right: '16px',
          }}
        >
          %
        </span>
      </div>
    </label>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
};

function MetricCard({
  icon,
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="planning-metric-card">
      <div className="planning-metric-top">
        <div>
          <span className="planning-metric-label">
            {label}
          </span>

          <strong className="planning-metric-value">
            {value}
          </strong>
        </div>

        <div className="planning-metric-icon">
          {icon}
        </div>
      </div>

      <p className="planning-metric-description">
        {description}
      </p>
    </div>
  );
}