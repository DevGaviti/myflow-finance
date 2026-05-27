import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';

type Props = {
  label: string;
  value: string;
};

export default function KPICard({
  label,
  value,
}: Props) {
  function getIcon() {
    switch (label) {
      case 'Saldo':
        return (
          <Wallet size={22} />
        );

      case 'Entradas':
      case 'Receitas':
        return (
          <TrendingUp size={22} />
        );

      case 'Despesas':
        return (
          <TrendingDown size={22} />
        );

      case 'Transações':
        return (
          <Receipt size={22} />
        );

      default:
        return (
          <Wallet size={22} />
        );
    }
  }

  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon">
          {getIcon()}
        </div>

        <div className="kpi-badge">
          +12%
        </div>
      </div>

      <p className="kpi-label">
        {label}
      </p>

      <h2 className="kpi-value">
        {value}
      </h2>
    </div>
  );
}