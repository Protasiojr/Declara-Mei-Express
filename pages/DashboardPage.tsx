
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';

const faturamentoData = [
    { name: 'Jan', Faturamento: 4000 },
    { name: 'Fev', Faturamento: 3000 },
    { name: 'Mar', Faturamento: 5000 },
    { name: 'Abr', Faturamento: 4500 },
    { name: 'Mai', Faturamento: 6000 },
    { name: 'Jun', Faturamento: 5500 },
];

const DashboardPage: React.FC = () => {
  type Period = 'daily' | 'monthly' | 'yearly';
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('daily');

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