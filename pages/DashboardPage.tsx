

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { AccountPayable, AccountReceivable, Sale, Product, Client } from '../types';

const faturamentoData = [
    { name: 'Jan', Faturamento: 4000 },
    { name: 'Fev', Faturamento: 3000 },
    { name: 'Mar', Faturamento: 5000 },
    { name: 'Abr', Faturamento: 4500 },
    { name: 'Mai', Faturamento: 6000 },
    { name: 'Jun', Faturamento: 5500 },
];

interface DashboardPageProps {
  sales: Sale[];
  accountsPayable: AccountPayable[];
  accountsReceivable: AccountReceivable[];
}

const ComparisonBadge: React.FC<{ percentage: number | null }> = ({ percentage }) => {
    const { t } = useTranslation();
    if (percentage === null) {
        return <span className="text-xs font-normal text-gray-500 ml-2">{t('dashboard.noSalesLastMonth')}</span>;
    }
    const isPositive = percentage >= 0;
    const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const arrow = isPositive ? '↑' : '↓';

    return (
        <span className={`text-sm font-semibold ml-2 ${color}`}>
            {arrow} {Math.abs(percentage).toFixed(1)}%
        </span>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ sales, accountsPayable, accountsReceivable }) => {
  type Period = 'daily' | 'monthly' | 'yearly';
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  
  const dashboardMetrics = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const prevMonthDate = new Date(today);
    prevMonthDate.setMonth(currentMonth - 1);
    const previousMonth = prevMonthDate.getMonth();
    const previousMonthYear = prevMonthDate.getFullYear();

    // Helper to calculate profit for a given period
    const calculatePeriodMetrics = (month: number, year: number) => {
        const periodSales = sales.filter(s => {
            const saleDate = new Date(s.date + 'T00:00:00');
            return saleDate.getMonth() === month && saleDate.getFullYear() === year;
        });
        const periodPayables = accountsPayable.filter(p => {
            const paymentDate = p.paymentDate ? new Date(p.paymentDate + 'T00:00:00') : null;
            return paymentDate && paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
        });

        const revenue = periodSales.reduce((sum, s) => sum + s.total, 0);
        const expenses = periodPayables.reduce((sum, p) => sum + p.amount, 0);
        const cogs = periodSales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, saleItem) => {
                if ('costPrice' in saleItem.item) {
                    return itemSum + (saleItem.item.costPrice * saleItem.quantity);
                }
                return itemSum;
            }, 0);
        }, 0);
        
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - expenses;

        return { revenue, expenses, netProfit, salesCount: periodSales.length };
    };

    // Current and Previous month metrics
    const currentMetrics = calculatePeriodMetrics(currentMonth, currentYear);
    const previousMetrics = calculatePeriodMetrics(previousMonth, previousMonthYear);
    
    // Comparisons
    const calculateComparison = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous) * 100;
    };
    
    const profitComparison = calculateComparison(currentMetrics.netProfit, previousMetrics.netProfit);
    const expensesComparison = calculateComparison(currentMetrics.expenses, previousMetrics.expenses);

    // Other Dashboard Metrics for current month
    const pendingPayable = accountsPayable.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const pendingReceivable = accountsReceivable.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
    const averageTicket = currentMetrics.salesCount > 0 ? currentMetrics.revenue / currentMetrics.salesCount : 0;

    // Best Selling Products
    const productSales: { [key: string]: { name: string, quantity: number } } = {};
    sales.filter(s => {
        const saleDate = new Date(s.date + 'T00:00:00');
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).forEach(sale => {
        sale.items.forEach(item => {
            if ('sku' in item.item) { // is a product
                if (!productSales[item.item.id]) {
                    productSales[item.item.id] = { name: item.item.name, quantity: 0 };
                }
                productSales[item.item.id].quantity += item.quantity;
            }
        });
    });
    const bestSellingProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 3);
    
    // Most Active Clients
    const clientSales: { [key: string]: { name: string, totalSpent: number } } = {};
    sales.filter(s => {
        const saleDate = new Date(s.date + 'T00:00:00');
        return s.client && saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).forEach(sale => {
        if (sale.client) {
            if (!clientSales[sale.client.id]) {
                clientSales[sale.client.id] = { name: sale.client.fullName, totalSpent: 0 };
            }
            clientSales[sale.client.id].totalSpent += sale.total;
        }
    });
    const mostActiveClients = Object.values(clientSales).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);

    return { 
        monthlyExpenses: currentMetrics.expenses, 
        monthlyProfit: currentMetrics.netProfit,
        profitComparison: isFinite(profitComparison) ? profitComparison : null,
        expensesComparison: isFinite(expensesComparison) ? expensesComparison : null,
        pendingPayable, 
        pendingReceivable,
        averageTicket,
        bestSellingProducts,
        mostActiveClients
    };
  }, [sales, accountsPayable, accountsReceivable]);


  const data = {
    daily: [
      { name: t('dashboard.resales'), valor: 3 },
      { name: t('dashboard.industrialized'), valor: 1 },
      { name: t('dashboard.services'), valor: 2 },
    ],
    monthly: [
      { name: t('dashboard.resales'), valor: 45 },
      { name: t('dashboard.industrialized'), valor: 12 },
      { name: t('dashboard.services'), valor: 25 },
    ],
    yearly: [
      { name: t('dashboard.resales'), valor: 520 },
      { name: t('dashboard.industrialized'), valor: 150 },
      { name: t('dashboard.services'), valor: 300 },
    ],
  };

  const getPeriodLabel = (p: Period) => {
    if (p === 'daily') return t('dashboard.daily');
    if (p === 'monthly') return t('dashboard.monthly');
    return t('dashboard.yearly');
  };
  
  const currentData = data[period];
  const totalFaturamentoAnual = 81000;
  const faturamentoAtual = 28000;
  const percentualFaturamento = (faturamentoAtual / totalFaturamentoAnual) * 100;


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title={t('dashboard.pendingPayable')}>
              <p className="text-2xl font-bold text-red-500">R$ {dashboardMetrics.pendingPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card title={t('dashboard.pendingReceivable')}>
              <p className="text-2xl font-bold text-green-500">R$ {dashboardMetrics.pendingReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card title={t('dashboard.monthlyExpenses')}>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">R$ {dashboardMetrics.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <ComparisonBadge percentage={dashboardMetrics.expensesComparison} />
              </div>
          </Card>
          <Card title={t('dashboard.monthlyProfit')}>
              <div className="flex items-baseline">
                <p className={`text-2xl font-bold ${dashboardMetrics.monthlyProfit >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>R$ {dashboardMetrics.monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <ComparisonBadge percentage={dashboardMetrics.profitComparison} />
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={t('dashboard.averageTicket')}>
            <p className="text-3xl font-bold">R$ {dashboardMetrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card title={t('dashboard.bestSellingProducts')}>
            {dashboardMetrics.bestSellingProducts.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1">
                    {dashboardMetrics.bestSellingProducts.map((p, i) => (
                        <li key={i} className="truncate">
                            <span className="font-semibold">{p.name}</span> ({p.quantity} {t('sales.quantity').toLowerCase()})
                        </li>
                    ))}
                </ol>
            ) : <p className="text-gray-500">{t('dashboard.noData')}</p>}
        </Card>
        <Card title={t('dashboard.mostActiveClients')}>
            {dashboardMetrics.mostActiveClients.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1">
                    {dashboardMetrics.mostActiveClients.map((c, i) => (
                        <li key={i} className="truncate">
                            <span className="font-semibold">{c.name}</span> (R$ {c.totalSpent.toFixed(2)})
                        </li>
                    ))}
                </ol>
            ) : <p className="text-gray-500">{t('dashboard.noData')}</p>}
        </Card>
      </div>


      <Card title={t('dashboard.annualBillingSummary')}>
        <div className="space-y-2">
            <p>{t('dashboard.meiLimit')}: R$ {totalFaturamentoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p>{t('dashboard.currentBilling')}: R$ {faturamentoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div className="bg-primary-600 h-4 rounded-full" style={{ width: `${percentualFaturamento}%` }}></div>
            </div>
            <p className="text-right text-sm">{percentualFaturamento.toFixed(2)}% {t('dashboard.limitReached')}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title={t('dashboard.productResales')}>
              <p className="text-4xl font-bold">{currentData[0].valor}</p>
          </Card>
          <Card title={t('dashboard.industrializedSales')}>
              <p className="text-4xl font-bold">{currentData[1].valor}</p>
          </Card>
          <Card title={t('dashboard.servicesProvided')}>
              <p className="text-4xl font-bold">{currentData[2].valor}</p>
          </Card>
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        <Button variant={period === 'daily' ? 'primary' : 'secondary'} onClick={() => setPeriod('daily')}>{t('dashboard.daily')}</Button>
        <Button variant={period === 'monthly' ? 'primary' : 'secondary'} onClick={() => setPeriod('monthly')}>{t('dashboard.monthly')}</Button>
        <Button variant={period === 'yearly' ? 'primary' : 'secondary'} onClick={() => setPeriod('yearly')}>{t('dashboard.yearly')}</Button>
      </div>

      <Card title={`${t('dashboard.overview')} - ${getPeriodLabel(period)}`}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </Card>

      <Card title={t('dashboard.monthlyBilling')}>
          <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faturamentoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Faturamento" fill="#1d4ed8" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </Card>
    </div>
  );
};

export default DashboardPage;