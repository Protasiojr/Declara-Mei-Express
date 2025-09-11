

import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { MOCK_SALES, MOCK_CLIENTS, MOCK_COMPANY } from '../constants';
import { Sale, Client } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// FIX: Changed interface to a type intersection. An interface extending a class in TypeScript only
// inherits public properties, not methods. A type intersection combines the class type with
// the new property, ensuring all jsPDF methods are available.
// Adiciona a definição do método autoTable à interface do jsPDF para o TypeScript
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF;
}

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
            return client.clientType === 'Company' ? (client.companyName || client.fullName) : client.fullName;
        }

        const doc = new jsPDF() as jsPDFWithAutoTable;
        const { name: companyName, cnpj } = MOCK_COMPANY;
        const reportTitle = t('reports.salesReportTitle');
        const dateRange = salesStartDate && salesEndDate 
            ? `${t('reports.period')}: ${new Date(salesStartDate + 'T00:00:00').toLocaleDateString()} ${t('reports.to')} ${new Date(salesEndDate + 'T00:00:00').toLocaleDateString()}` 
            : t('reports.allSales');
        
        // Header
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`${companyName} - CNPJ: ${cnpj}`, 14, 15);

        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(reportTitle, 14, 28);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(dateRange, 14, 35);

        const head = [[
            t('sales.item'),
            t('sales.quantity'),
            t('sales.date'),
            t('sales.client'),
            t('sales.total')
        ]];

        let totalAmount = 0;
        const body = filteredSales.map(sale => {
            totalAmount += sale.total;
            return [
                sale.item.name,
                sale.quantity,
                new Date(sale.date + 'T00:00:00').toLocaleDateString(),
                getClientDisplayName(sale.client),
                `R$ ${sale.total.toFixed(2)}`
            ];
        });

        let finalY = 0;
        doc.autoTable({
            startY: 42,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
            columnStyles: { 4: { halign: 'right' } },
            didDrawPage: (data) => {
                finalY = data.cursor?.y ?? 0;
            }
        });
        
        finalY = (doc as any).lastAutoTable.finalY || finalY;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `${t('reports.totalAmount')}: R$ ${totalAmount.toFixed(2)}`,
            14,
            finalY + 10
        );
        
        doc.save('relatorio_vendas.pdf');
    };

    const handleExportClientsPDF = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const { name: companyName, cnpj } = MOCK_COMPANY;
        const reportTitle = t('reports.clientListTitle');
        
        // Header
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`${companyName} - CNPJ: ${cnpj}`, 14, 15);

        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(reportTitle, 14, 28);

        const head = [[
            t('clients.nameOrCompany'),
            t('clients.clientType'),
            t('clients.document'),
            t('clients.phone'),
            t('clients.address')
        ]];
        
        const body = MOCK_CLIENTS.map(client => [
            client.clientType === 'Company' ? (client.companyName || client.fullName) : client.fullName,
            client.clientType === 'Company' ? t('clients.company') : t('clients.individual'),
            client.clientType === 'Company' ? (client.cnpj || '-') : (client.cpf || '-'),
            client.phone,
            client.address
        ]);
        
        doc.autoTable({
            startY: 35,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
        });

        doc.save('lista_clientes.pdf');
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