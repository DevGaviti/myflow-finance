import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Reports from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<MainLayout />}
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/transactions"
            element={
              <Transactions />
            }
          />

          <Route
            path="/categories"
            element={
              <Categories />
            }
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="*"
            element={
              <Navigate to="/dashboard" />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}