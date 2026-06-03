import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';

type KPIVariant =
  | 'balance'
  | 'income'
  | 'expense'
  | 'transactions';

type Props = {
  label: string;
  value: string;
  variant: KPIVariant;
};

export default function KPICard({
  label,
  value,
  variant,
}: Props) {
  function getIcon() {
    switch (variant) {
      case 'balance':
        return <Wallet size={22} />;

      case 'income':
        return <TrendingUp size={22} />;

      case 'expense':
        return <TrendingDown size={22} />;

      case 'transactions':
        return <Receipt size={22} />;

      default:
        return <Wallet size={22} />;
    }
  }

  return (
    <div
      className={`kpi-card kpi-card-${variant}`}
    >
      <div className="kpi-header">
        <div className="kpi-icon">
          {getIcon()}
        </div>

        <span className="kpi-label">
          {label}
        </span>
      </div>

      <strong className="kpi-value">
        {value}
      </strong>
    </div>
  );
}