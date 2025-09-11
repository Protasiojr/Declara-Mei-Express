
import React from 'react';
import { User } from '../../types';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';

interface HeaderProps {
  user: User | null;
  toggleTheme: () => void;
  theme: string;
}

const Header: React.FC<HeaderProps> = ({ user, toggleTheme, theme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-end items-center space-x-4">
      <LanguageSwitcher />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <div className="flex items-center">
        <span className="text-gray-600 dark:text-gray-300 mr-3 hidden sm:block">{user?.name}</span>
        <img className="w-10 h-10 rounded-full" src={user?.profilePicture} alt="User" />
      </div>
    </header>
  );
};

export default Header;