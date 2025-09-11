
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Sale } from '../types';
import { MOCK_SALES } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const SalesPage: React.FC = () => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);

    const downloadJSON = (data: any, filename: string) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const isLastDayOfMonth = () => {
        const today = new Date();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        return nextDay.getDate() === 1;
    };
    
    const isLastDayOfYear = () => {
        const today = new Date();
        return today.getMonth() === 11 && today.getDate() === 31;
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sales.title')}</h1>

            <Card title={t('sales.registerNew')}>
                <p className="text-gray-500">{t('sales.formDescription')}</p>
            </Card>

            <Card title={t('sales.history')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('sales.item')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.quantity')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.total')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.client')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.invoice')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sale.item.name}</td>
                                    <td className="px-6 py-4">{sale.quantity}</td>
                                    <td className="px-6 py-4">R$ {sale.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{sale.clientType === 'Empresa' ? t('sales.clientTypeCompany') : t('sales.clientTypeConsumer')}</td>
                                    <td className="px-6 py-4">{sale.withInvoice ? t('common.yes') : t('common.no')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title={t('sales.generateReports')}>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => downloadJSON(sales, 'vendas_diario.json')}>
                        {t('sales.generateDaily')}
                    </Button>
                    <Button onClick={() => downloadJSON(sales, 'vendas_mensal.json')} disabled={!isLastDayOfMonth()}>
                        {t('sales.generateMonthly')}
                    </Button>
                    <Button onClick={() => downloadJSON(sales, 'vendas_anual.json')} disabled={!isLastDayOfYear()}>
                        {t('sales.generateYearly')}
                    </Button>
                </div>
                 <p className="text-sm text-gray-500 mt-4">
                    {t('sales.reportNote')}
                 </p>
            </Card>
        </div>
    );
};

export default SalesPage;