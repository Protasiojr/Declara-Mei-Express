
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const [dailyFile, setDailyFile] = useState<File | null>(null);
    const [monthlyFile, setMonthlyFile] = useState<File | null>(null);

    const handleDailyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) setDailyFile(e.target.files[0]);
    }
    const handleMonthlyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) setMonthlyFile(e.target.files[0]);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.reports')}</h1>

            <Card title={t('reports.generateMonthly')}>
                <p className="mb-2">{t('reports.monthlyDescription')}</p>
                <div className="flex items-center space-x-4">
                    <input type="file" multiple accept=".json" onChange={handleDailyFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    <Button disabled={!dailyFile}>{t('reports.generateMonthlyButton')}</Button>
                </div>
            </Card>

            <Card title={t('reports.generateAnnual')}>
                <p className="mb-2">{t('reports.annualDescription')}</p>
                 <div className="flex items-center space-x-4">
                    <input type="file" multiple accept=".json" onChange={handleMonthlyFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    <Button disabled={!monthlyFile}>{t('reports.generateAnnualButton')}</Button>
                </div>
            </Card>

            <Card title={t('reports.download')}>
                <p>{t('reports.downloadDescription')}</p>
                {/* Links to download reports would appear here */}
            </Card>
        </div>
    );
};

export default ReportsPage;