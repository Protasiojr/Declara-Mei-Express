import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';

interface SettingsPageProps {
  handleLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ handleLogout }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const handleConfirmLogout = () => {
    toast.confirm(t('settings.logoutConfirm'), handleLogout);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.settings')}</h1>
      <Card title={t('settings.general')}>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">{t('settings.meiLimit')}</h4>
                <p className="text-sm text-gray-500 mb-2">{t('settings.limitDescription')}</p>
                <div className="flex items-center space-x-2">
                    <span className="text-lg">R$</span>
                    <input type="number" defaultValue="81000" className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm dark:bg-gray-700" disabled/>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div>
                <h4 className="font-semibold">{t('settings.logout')}</h4>
                <p className="text-sm text-gray-500 mb-2">{t('settings.logoutDescription')}</p>
                <Button variant="danger" onClick={handleConfirmLogout}>{t('settings.logoutButton')}</Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;