import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
} from '../contexts/AuthContext';

type Props = {
  onNewTransaction: () => void;
};

export default function Topbar({
  onNewTransaction,
}: Props) {
  const {
    user,
    signOut,
  } = useAuth();

  const [darkMode, setDarkMode] =
    useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const userEmail =
    user?.email ?? 'Usuário';

  const userInitials =
    useMemo(() => {
      if (!userEmail)
        return 'US';

      const [name] =
        userEmail.split('@');

      return name
        .slice(0, 2)
        .toUpperCase();
    }, [userEmail]);

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

  async function handleLogout() {
    await signOut();
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
              <strong>
                Notificações
              </strong>

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
            {userInitials}
          </button>

          {showUserMenu && (
            <div className="topbar-dropdown user-dropdown">
              <strong>
                {userEmail}
              </strong>

              <p>
                Conta conectada
              </p>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}