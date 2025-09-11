
import React, { useState } from 'react';
import { Page, User } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';
import SalesPage from './pages/SalesPage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import CompanyPage from './pages/CompanyPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const { isAuthenticated, user, handleLogin, handleLogout, setUser } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <DashboardPage />;
      case Page.Employee:
        return <EmployeePage />;
      case Page.Sales:
        return <SalesPage />;
      case Page.Products:
        return <ProductsPage />;
      case Page.Services:
        return <ServicesPage />;
      case Page.Company:
        return <CompanyPage />;
      case Page.Profile:
        return <ProfilePage user={user} setUser={setUser} />;
      case Page.Reports:
        return <ReportsPage />;
      case Page.Settings:
        return <SettingsPage handleLogout={handleLogout} />;
      default:
        return <DashboardPage />;
    }
  };
  
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} toggleTheme={toggleTheme} theme={theme} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;