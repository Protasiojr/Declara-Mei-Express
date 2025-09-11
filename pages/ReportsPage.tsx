
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { MOCK_SALES, MOCK_CLIENTS } from '../constants';
import { Sale, Client } from '../types';

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const [dailyFile, setDailyFile] = useState<File | null>(null);
    const [monthlyFile, setMonthlyFile] = useState<File | null>(null);
    const [salesStartDate, setSalesStartDate] = useState('');
    const [salesEndDate, setSalesEndDate] = useState('');

    const handleDailyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) setDailyFile(e.target.files[0]);
    }
    const handleMonthlyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) setMonthlyFile(e.target.files[0]);
    }

    const handleExportSalesPDF = () => {
        const filteredSales = MOCK_SALES.filter(sale => {
            if (salesStartDate && sale.date < salesStartDate) return false;
            if (salesEndDate && sale.date > salesEndDate) return false;
            return true;
        });
        
        const getClientDisplayName = (client: Client | null) => {
            if (!client) return t('sales.clientTypeConsumer');
            return client.clientType === 'Company' ? client.companyName : client.fullName;
        }

        const reportTitle = t('reports.salesReportTitle');
        const dateRange = salesStartDate && salesEndDate ? `${t('reports.period')}: ${new Date(salesStartDate + 'T00:00:00').toLocaleDateString()} ${t('reports.to')} ${new Date(salesEndDate + 'T00:00:00').toLocaleDateString()}` : t('reports.allSales');
        
        let totalAmount = 0;
        const salesRows = filteredSales.map(sale => {
            totalAmount += sale.total;
            return `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${sale.item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${sale.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(sale.date + 'T00:00:00').toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${getClientDisplayName(sale.client)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R$ ${sale.total.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const reportContent = `
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { text-align: left; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        h1, h2 { text-align: center; }
                        h2 { font-weight: normal; font-size: 1em; }
                        .total { font-weight: bold; text-align: right; margin-top: 20px; font-size: 1.2em;}
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <h2>${dateRange}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('sales.item')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('sales.quantity')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('sales.date')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('sales.client')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">${t('sales.total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${salesRows}
                        </tbody>
                    </table>
                    <div class="total">${t('reports.totalAmount')}: R$ ${totalAmount.toFixed(2)}</div>
                </body>
            </html>
        `;

        const reportWindow = window.open('', '_blank');
        reportWindow?.document.write(reportContent);
        reportWindow?.document.close();
        reportWindow?.focus();
        setTimeout(() => { reportWindow?.print(); }, 500);
    };

    const handleExportClientsPDF = () => {
        const reportTitle = t('reports.clientListTitle');
        const clientsRows = MOCK_CLIENTS.map(client => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${client.clientType === 'Company' ? client.companyName : client.fullName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${client.clientType === 'Company' ? t('clients.company') : t('clients.individual')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${client.clientType === 'Company' ? client.cnpj : client.cpf}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${client.phone}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${client.address}</td>
            </tr>
        `).join('');

        const reportContent = `
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px;}
                        th, td { text-align: left; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        h1 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('clients.nameOrCompany')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('clients.clientType')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('clients.document')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('clients.phone')}</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">${t('clients.address')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clientsRows}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const reportWindow = window.open('', '_blank');
        reportWindow?.document.write(reportContent);
        reportWindow?.document.close();
        reportWindow?.focus();
        setTimeout(() => { reportWindow?.print(); }, 500);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.reports')}</h1>

            <Card title={t('reports.exportData')}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg">{t('reports.salesReport')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('reports.salesReportDescription')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label htmlFor="salesStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterStartDate')}</label>
                                <input type="date" name="salesStartDate" value={salesStartDate} onChange={(e) => setSalesStartDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <div>
                                <label htmlFor="salesEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterEndDate')}</label>
                                <input type="date" name="salesEndDate" value={salesEndDate} onChange={(e) => setSalesEndDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <Button onClick={handleExportSalesPDF}>{t('reports.exportPdf')}</Button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    <div>
                        <h4 className="font-semibold text-lg">{t('reports.clientList')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('reports.clientListDescription')}</p>
                        <div className="flex justify-start">
                            <Button onClick={handleExportClientsPDF}>{t('reports.exportPdf')}</Button>
                        </div>
                    </div>
                </div>
            </Card>

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
