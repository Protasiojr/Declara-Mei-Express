

import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { MOCK_SALES, MOCK_CLIENTS, MOCK_COMPANY, MOCK_CASH_SESSIONS } from '../constants';
import { Sale, Client, Product, Address, Service } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatAddress = (address: Address) => {
    if (!address || !address.street) return '';
    const { street, number, complement, neighborhood, city, state, zipCode } = address;
    return `${street}, ${number}${complement ? ` - ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipCode}`;
};


const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const [salesStartDate, setSalesStartDate] = useState('');
    const [salesEndDate, setSalesEndDate] = useState('');

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

        const doc = new jsPDF();
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
            'ID',
            t('sales.date'),
            t('sales.client'),
            t('sales.items'),
            t('sales.total')
        ]];

        let totalAmount = 0;
        const body = filteredSales.map(sale => {
            totalAmount += sale.total;
            return [
                sale.id,
                new Date(sale.date + 'T00:00:00').toLocaleDateString(),
                getClientDisplayName(sale.client),
                sale.items.map(i => `${i.quantity}x ${i.item.name}`).join(', '),
                `R$ ${sale.total.toFixed(2)}`
            ];
        });

        let finalY = 0;
        autoTable(doc, {
            startY: 42,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
            columnStyles: { 4: { halign: 'right' } },
            didDrawPage: (data: any) => {
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
        const doc = new jsPDF();
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
            t('clients.phone'),
            t('clients.address')
        ]];
        
        const body = MOCK_CLIENTS.map(client => [
            client.clientType === 'Company' ? (client.companyName || client.fullName) : client.fullName,
            client.phone,
            formatAddress(client.address)
        ]);
        
        autoTable(doc, {
            startY: 35,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
        });

        doc.save('lista_clientes.pdf');
    };
    
    const handleGenerateMonthlyReportPDF = () => {
        const doc = new jsPDF();
        const { name: companyName, cnpj } = MOCK_COMPANY;

        // Header
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`${companyName} - CNPJ: ${cnpj}`, 14, 15);

        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(t('reports.monthlyReportTitle'), 14, 28);

        const monthlyTotals: { [key: string]: number } = {};
        MOCK_SALES.forEach(sale => {
            const month = new Date(sale.date + 'T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += sale.total;
        });

        const head = [[t('reports.month'), t('reports.totalBilled')]];
        const body = Object.entries(monthlyTotals).map(([month, total]) => [
            month.charAt(0).toUpperCase() + month.slice(1),
            `R$ ${total.toFixed(2)}`
        ]);
        
        const totalYear = Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0);
        
        autoTable(doc, {
            startY: 35,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
            columnStyles: { 1: { halign: 'right' } },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 0;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `${t('reports.totalAmount')}: R$ ${totalYear.toFixed(2)}`,
            14,
            finalY + 10
        );

        doc.save('relatorio_mensal.pdf');
    };

    const handleGenerateAnnualDeclarationPDF = () => {
        const doc = new jsPDF();
        const { name: companyName, entrepreneur, cnpj } = MOCK_COMPANY;
        const year = "2025"; // Assuming fixed year from mock data

        let resaleRevenue = 0;
        let industrializedRevenue = 0;
        let serviceRevenue = 0;

        MOCK_SALES.forEach(sale => {
            sale.items.forEach(saleItem => {
                const item = saleItem.item;
                 if ('sku' in item) { // It's a Product
                    if (item.type === 'Regular') {
                        resaleRevenue += saleItem.total;
                    } else if (item.type === 'Industrializado') {
                        industrializedRevenue += saleItem.total;
                    }
                } else { // It's a Service
                    serviceRevenue += saleItem.total;
                }
            });
        });
        
        const totalGrossRevenue = resaleRevenue + industrializedRevenue + serviceRevenue;

        // Header
        doc.setFontSize(16);
        doc.text(t('reports.annualDeclarationTitle'), doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${t('reports.year')}: ${year}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

        // Company Info
        doc.setFontSize(10);
        doc.text(`${t('company.companyName')}: ${companyName}`, 14, 35);
        doc.text(`${t('company.cnpj')}: ${cnpj}`, 14, 41);
        doc.text(`${t('company.entrepreneur')}: ${entrepreneur}`, 14, 47);

        // Revenue Summary
        doc.setFontSize(14);
        doc.text(t('reports.annualSummary'), 14, 60);

        const head = [[t('reports.revenueType'), t('reports.totalBilled')]];
        const body = [
            [t('reports.resaleRevenue'), `R$ ${resaleRevenue.toFixed(2)}`],
            [t('reports.industrializedRevenue'), `R$ ${industrializedRevenue.toFixed(2)}`],
            [t('reports.serviceRevenue'), `R$ ${serviceRevenue.toFixed(2)}`],
        ];

        autoTable(doc, {
            startY: 65,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [29, 78, 216], textColor: 255 },
            columnStyles: { 1: { halign: 'right' } },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 0;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        autoTable(doc, {
            startY: finalY,
            body: [[t('reports.totalGrossRevenue'), `R$ ${totalGrossRevenue.toFixed(2)}`]],
            theme: 'grid',
            styles: { fontStyle: 'bold' },
            columnStyles: { 1: { halign: 'right' } },
        });

        doc.save('declaracao_anual_mei.pdf');
    };
    
    const handleExportCashSessionsPDF = () => {
        const doc = new jsPDF();
        const { name: companyName, cnpj } = MOCK_COMPANY;
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`${companyName} - CNPJ: ${cnpj}`, 14, 15);
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(t('reports.cashSessionsReportTitle'), 14, 28);

        const head = [[
            t('cashControl.operator'),
            t('reports.opened'),
            t('reports.closed'),
            t('cashControl.expectedBalance'),
            t('cashControl.countedBalance'),
            t('cashControl.difference')
        ]];
        
        const body = MOCK_CASH_SESSIONS.map(session => [
            session.operatorName,
            new Date(session.openedAt).toLocaleString(),
            session.closedAt ? new Date(session.closedAt).toLocaleString() : '-',
            `R$ ${session.expectedBalance?.toFixed(2) || '0.00'}`,
            `R$ ${session.closingBalance?.toFixed(2) || '0.00'}`,
            `R$ ${session.difference?.toFixed(2) || '0.00'}`
        ]);
        
        autoTable(doc, {
            startY: 35,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [29, 78, 216] },
        });

        doc.save('relatorio_sessoes_caixa.pdf');
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
                                <input type="date" name="salesStartDate" value={salesStartDate} onChange={(e) => setSalesStartDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <div>
                                <label htmlFor="salesEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterEndDate')}</label>
                                <input type="date" name="salesEndDate" value={salesEndDate} onChange={(e) => setSalesEndDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <Button onClick={handleExportSalesPDF}>{t('reports.exportPdf')}</Button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    <div>
                        <h4 className="font-semibold text-lg">{t('reports.cashSessionsReport')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('reports.cashSessionsReportDescription')}</p>
                        <div className="flex justify-start">
                            <Button onClick={handleExportCashSessionsPDF}>{t('reports.exportPdf')}</Button>
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

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    <div>
                        <h4 className="font-semibold text-lg">{t('reports.generateMonthlyReport')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('reports.monthlyReportDescription')}</p>
                        <div className="flex justify-start">
                            <Button onClick={handleGenerateMonthlyReportPDF}>{t('reports.exportPdf')}</Button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    
                    <div>
                        <h4 className="font-semibold text-lg">{t('reports.generateAnnualDeclaration')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('reports.annualDeclarationDescription')}</p>
                        <div className="flex justify-start">
                            <Button onClick={handleGenerateAnnualDeclarationPDF}>{t('reports.exportPdf')}</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;