import {
  useEffect,
  useState,
} from 'react';

type Props = {
  onNewTransaction: () => void;
};

export default function Topbar({
  onNewTransaction,
}: Props) {
  const [darkMode, setDarkMode] =
    useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  function toggleTheme() {
    const isDark =
      document.body.classList.toggle('dark');

    localStorage.setItem(
      'theme',
      isDark ? 'dark' : 'light',
    );

    setDarkMode(isDark);
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">
          Dashboard Financeiro
        </h2>
      </div>

      <div className="topbar-right">
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title="Alternar tema"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="topbar-menu-wrapper">
          <button
            className="icon-btn"
            title="Notificações"
            onClick={() => {
              setShowNotifications(
                !showNotifications,
              );
              setShowUserMenu(false);
            }}
          >
            🔔
          </button>

          {showNotifications && (
            <div className="topbar-dropdown">
              <strong>Notificações</strong>

              <p>
                Nenhuma notificação no momento.
              </p>
            </div>
          )}
        </div>

        <button
          className="primary-btn"
          onClick={onNewTransaction}
        >
          + Nova transação
        </button>

        <div className="topbar-menu-wrapper">
          <button
            className="topbar-avatar"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            title="Menu do usuário"
          >
            LG
          </button>

          {showUserMenu && (
            <div className="topbar-dropdown user-dropdown">
              <strong>Lucas</strong>

              <p>Finance App</p>

              <span>
                Perfil e configurações em breve.
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}