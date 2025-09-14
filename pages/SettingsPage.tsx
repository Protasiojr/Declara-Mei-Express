import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';

interface SettingsPageProps {
  handleLogout: () => void;
  emailSettings: {
    managerEmail: string;
    sendingEmail: string;
    appPassword: string;
  };
  setEmailSettings: React.Dispatch<React.SetStateAction<{
    managerEmail: string;
    sendingEmail: string;
    appPassword: string;
  }>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ handleLogout, emailSettings, setEmailSettings }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const handleConfirmLogout = () => {
    toast.confirm(t('settings.logoutConfirm'), handleLogout);
  };
  
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would encrypt and save this data securely
    toast.success(t('settings.emailSettingsSaved'));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.settings')}</h1>
      
      <Card title={t('settings.emailSettingsTitle')}>
        <form onSubmit={handleSaveEmailSettings} className="space-y-4">
            <p className="text-sm text-gray-500">{t('settings.emailSettingsDescription')}</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.managerEmail')}</label>
                <input 
                    type="email" 
                    name="managerEmail"
                    value={emailSettings.managerEmail}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.sendingEmail')}</label>
                <input 
                    type="email" 
                    name="sendingEmail"
                    value={emailSettings.sendingEmail}
                    onChange={handleEmailSettingsChange}
                    placeholder='seu-email@gmail.com'
                    className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.appPassword')}</label>
                <input 
                    type="password" 
                    name="appPassword"
                    value={emailSettings.appPassword}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-2 text-xs text-gray-500">{t('settings.appPasswordHelp')} <a href="#" className="text-primary-600 hover:underline">{t('settings.learnMore')}</a></p>
            </div>
            <div className="flex justify-end">
                <Button type="submit">{t('common.save')}</Button>
            </div>
        </form>
      </Card>
      
      <Card title={t('settings.general')}>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">{t('settings.meiLimit')}</h4>
                <p className="text-sm text-gray-500 mb-2">{t('settings.limitDescription')}</p>
                <div className="flex items-center space-x-2">
                    <span className="text-lg">R$</span>
                    <input type="number" defaultValue="81000" className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200" disabled/>
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