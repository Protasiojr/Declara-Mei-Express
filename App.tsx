
import React, { useState } from 'react';
import { Page, Product, Sale, AccountPayable, AccountReceivable, StockMovement, CashSession } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';
import ClientPage from './pages/ClientPage';
import SalesPage from './pages/SalesPage';
import ProductsPage from './pages/ProductsPage';
import FinancialPage from './pages/FinancialPage';
import CompanyPage from './pages/CompanyPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_ACCOUNTS_PAYABLE, MOCK_ACCOUNTS_RECEIVABLE, MOCK_STOCK_MOVEMENTS, MOCK_CASH_SESSIONS } from './constants';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const { isAuthenticated, user, handleLogin, handleLogout, setUser } = useAuth();
  
  // Lifted state for data consistency across pages
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>(MOCK_ACCOUNTS_PAYABLE);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>(MOCK_ACCOUNTS_RECEIVABLE);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(MOCK_STOCK_MOVEMENTS);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(MOCK_CASH_SESSIONS);


  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <DashboardPage sales={sales} accountsPayable={accountsPayable} accountsReceivable={accountsReceivable} cashSessions={cashSessions} />;
      case Page.Employee:
        return <EmployeePage />;
      case Page.Client:
        return <ClientPage />;
      case Page.Sales:
        return <SalesPage products={products} setProducts={setProducts} sales={sales} setSales={setSales} setAccountsReceivable={setAccountsReceivable} setCurrentPage={setCurrentPage} cashSessions={cashSessions} setCashSessions={setCashSessions} />;
      case Page.Products:
        return <ProductsPage 
                  products={products} 
                  setProducts={setProducts}
                  stockMovements={stockMovements}
                  setStockMovements={setStockMovements}
                  user={user}
                />;
      case Page.Financial:
        return <FinancialPage 
                  accountsPayable={accountsPayable}
                  setAccountsPayable={setAccountsPayable}
                  accountsReceivable={accountsReceivable}
                  setAccountsReceivable={setAccountsReceivable}
                />;
      case Page.Company:
        return <CompanyPage />;
      case Page.Profile:
        return <ProfilePage user={user} setUser={setUser} />;
      case Page.Reports:
        return <ReportsPage sales={sales} products={products} accountsPayable={accountsPayable} accountsReceivable={accountsReceivable} />;
      case Page.Settings:
        return <SettingsPage handleLogout={handleLogout} />;
      default:
        return <DashboardPage sales={sales} accountsPayable={accountsPayable} accountsReceivable={accountsReceivable} cashSessions={cashSessions} />;
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