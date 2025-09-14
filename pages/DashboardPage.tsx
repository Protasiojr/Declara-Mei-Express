

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { AccountPayable, AccountReceivable, Sale } from '../types';

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


const DashboardPage: React.FC<DashboardPageProps> = ({ sales, accountsPayable, accountsReceivable }) => {
  type Period = 'daily' | 'monthly' | 'yearly';
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');
  
  const { monthlyExpenses, monthlyProfit, pendingPayable, pendingReceivable } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthPayables = accountsPayable.filter(p => {
        const paymentDate = p.paymentDate ? new Date(p.paymentDate + 'T00:00:00') : null;
        return paymentDate && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyExpenses = currentMonthPayables.reduce((sum, p) => sum + p.amount, 0);

    const currentMonthSales = sales.filter(s => {
        const saleDate = new Date(s.date + 'T00:00:00');
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = currentMonthSales.reduce((sum, s) => sum + s.total, 0);
    const monthlyCogs = currentMonthSales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, saleItem) => {
            if ('costPrice' in saleItem.item) {
                return itemSum + (saleItem.item.costPrice * saleItem.quantity);
            }
            return itemSum;
        }, 0);
    }, 0);
    
    const monthlyGrossProfit = monthlyRevenue - monthlyCogs;
    const monthlyProfit = monthlyGrossProfit - monthlyExpenses;

    const pendingPayable = accountsPayable.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const pendingReceivable = accountsReceivable.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);

    return { monthlyExpenses, monthlyProfit, pendingPayable, pendingReceivable };
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
              <p className="text-2xl font-bold text-red-500">R$ {pendingPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card title={t('dashboard.pendingReceivable')}>
              <p className="text-2xl font-bold text-green-500">R$ {pendingReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card title={t('dashboard.monthlyExpenses')}>
              <p className="text-2xl font-bold">R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card title={t('dashboard.monthlyProfit')}>
              <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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