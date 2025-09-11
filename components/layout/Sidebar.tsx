
import React from 'react';
import { Page } from '../../types';
import { DashboardIcon, EmployeeIcon, ClientIcon, SalesIcon, ProductsIcon, ServicesIcon, CompanyIcon, ProfileIcon, ReportIcon, SettingsIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string; // Changed from Page to string
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left
          ${isActive 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useTranslation();

  const navItems = [
    { icon: <DashboardIcon />, page: Page.Dashboard, label: t('sidebar.dashboard') },
    { icon: <EmployeeIcon />, page: Page.Employee, label: t('sidebar.employee') },
    { icon: <ClientIcon />, page: Page.Client, label: t('sidebar.clients') },
    { icon: <SalesIcon />, page: Page.Sales, label: t('sidebar.sales') },
    { icon: <ProductsIcon />, page: Page.Products, label: t('sidebar.products') },
    { icon: <ServicesIcon />, page: Page.Services, label: t('sidebar.services') },
    { icon: <CompanyIcon />, page: Page.Company, label: t('sidebar.company') },
    { icon: <ProfileIcon />, page: Page.Profile, label: t('sidebar.profile') },
    { icon: <ReportIcon />, page: Page.Reports, label: t('sidebar.reports') },
    { icon: <SettingsIcon />, page: Page.Settings, label: t('sidebar.settings') },
  ];

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-white dark:bg-gray-800 shadow-lg">
        <a href="#" className="flex items-center pl-2.5 mb-5">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Declara Mei Express</span>
        </a>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.page}
              onClick={() => setCurrentPage(item.page)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;