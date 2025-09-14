

import React, { useState, useMemo } from 'react';
import { AccountPayable, AccountReceivable, ExpenseCategory } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import { EXPENSE_CATEGORIES } from '../constants';

interface FinancialPageProps {
  accountsPayable: AccountPayable[];
  setAccountsPayable: React.Dispatch<React.SetStateAction<AccountPayable[]>>;
  accountsReceivable: AccountReceivable[];
  setAccountsReceivable: React.Dispatch<React.SetStateAction<AccountReceivable[]>>;
}

const FinancialPage: React.FC<FinancialPageProps> = ({ accountsPayable, setAccountsPayable, accountsReceivable, setAccountsReceivable }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'payable' | 'receivable'>('payable');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayable, setCurrentPayable] = useState<AccountPayable | null>(null);

  const initialFormState = {
      description: '',
      category: 'Outros' as ExpenseCategory,
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<any>({});
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { totalPayable, totalReceivable } = useMemo(() => {
    const payable = accountsPayable.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const receivable = accountsReceivable.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
    return { totalPayable: payable, totalReceivable: receivable };
  }, [accountsPayable, accountsReceivable]);

  const filteredPayable = useMemo(() => {
    return accountsPayable.filter(p => {
        if (statusFilter !== 'All' && p.status !== statusFilter) return false;
        const dateToCompare = p.status === 'Paid' ? p.paymentDate : p.dueDate;
        if (!dateToCompare) return true;
        if (startDate && dateToCompare < startDate) return false;
        if (endDate && dateToCompare > endDate) return false;
        return true;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [accountsPayable, statusFilter, startDate, endDate]);

  const filteredReceivable = useMemo(() => {
    return accountsReceivable.filter(r => {
        if (statusFilter !== 'All' && r.status !== statusFilter) return false;
        const dateToCompare = r.status === 'Paid' ? r.paymentDate : r.dueDate;
        if (!dateToCompare) return true;
        if (startDate && dateToCompare < startDate) return false;
        if (endDate && dateToCompare > endDate) return false;
        return true;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [accountsReceivable, statusFilter, startDate, endDate]);


  const validate = () => {
    const newErrors: any = {};
    if (!formData.description.trim()) newErrors.description = t('validation.required');
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) newErrors.amount = t('validation.invalidPrice');
    if (!formData.dueDate) newErrors.dueDate = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleOpenModal = (payable: AccountPayable | null = null) => {
    if (payable) {
      setCurrentPayable(payable);
      setFormData({ description: payable.description, category: payable.category, amount: String(payable.amount), dueDate: payable.dueDate });
    } else {
      setCurrentPayable(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSavePayable = () => {
    if (!validate()) return;
    const newPayable: Omit<AccountPayable, 'id' | 'status'> = {
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
    };
    if (currentPayable) {
      setAccountsPayable(prev => prev.map(p => p.id === currentPayable.id ? { ...currentPayable, ...newPayable } : p));
      toast.success(t('financial.expenseUpdated'));
    } else {
      setAccountsPayable(prev => [{ id: Date.now(), ...newPayable, status: 'Pending' }, ...prev]);
      toast.success(t('financial.expenseAdded'));
    }
    setIsModalOpen(false);
  };
  
  const handleMarkAsPaid = (id: number) => {
      toast.confirm(t('financial.confirmMarkAsPaid'), () => {
        setAccountsPayable(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : p));
        toast.success(t('financial.paymentSuccess'));
      });
  };

  const handleRegisterPayment = (id: number) => {
    toast.confirm(t('financial.confirmReceivePayment'), () => {
      setAccountsReceivable(prev => prev.map(r => r.id === id ? { ...r, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : r));
      toast.success(t('financial.paymentReceivedSuccess'));
    });
  };
  
  const handleDeletePayable = (id: number) => {
    toast.confirm(t('financial.deleteExpenseConfirm'), () => {
        setAccountsPayable(prev => prev.filter(p => p.id !== id));
        toast.success(t('financial.expenseDeleted'));
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value }));
  };
  
  const isOverdue = (item: AccountPayable | AccountReceivable) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return item.status === 'Pending' && new Date(item.dueDate) < today;
  };
  
  const TabButton: React.FC<{tabId: 'payable' | 'receivable', title: string}> = ({tabId, title}) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tabId ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
            {title}
        </button>
  );

  const StatusBadge: React.FC<{status: 'Pending' | 'Paid'}> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
        {t(`financial.${status.toLowerCase()}`)}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('financial.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={t('financial.totalPayable')}>
            <p className="text-3xl font-bold text-red-600">R$ {totalPayable.toFixed(2)}</p>
        </Card>
        <Card title={t('financial.totalReceivable')}>
            <p className="text-3xl font-bold text-green-600">R$ {totalReceivable.toFixed(2)}</p>
        </Card>
         <Card title={t('financial.balanceForecast')}>
            <p className={`text-3xl font-bold ${totalReceivable - totalPayable >= 0 ? 'text-gray-800 dark:text-white' : 'text-orange-500'}`}>R$ {(totalReceivable - totalPayable).toFixed(2)}</p>
        </Card>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <TabButton tabId="payable" title={t('financial.accountsPayable')} />
              <TabButton tabId="receivable" title={t('financial.accountsReceivable')} />
          </nav>
      </div>

      <Card title={t('common.actions')}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium">{t('financial.filterByStatus')}</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <option value="All">{t('financial.all')}</option>
              <option value="Pending">{t('financial.pending')}</option>
              <option value="Paid">{t('financial.paid')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">{t('sales.filterStartDate')}</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
          </div>
           <div>
            <label className="block text-sm font-medium">{t('sales.filterEndDate')}</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
          </div>
          {activeTab === 'payable' && <Button onClick={() => handleOpenModal()}>{t('financial.addExpense')}</Button>}
        </div>
      </Card>

      {activeTab === 'payable' ? (
        <Card title="">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">{t('financial.description')}</th>
                  <th className="px-6 py-3">{t('financial.category')}</th>
                  <th className="px-6 py-3">{t('financial.amount')}</th>
                  <th className="px-6 py-3">{t('financial.dueDate')}</th>
                  <th className="px-6 py-3">{t('financial.status')}</th>
                  <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayable.map(p => (
                  <tr key={p.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isOverdue(p) ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}>
                    <td className="px-6 py-4 font-medium">{p.description} {isOverdue(p) && <span className="text-xs text-red-500 ml-2">({t('financial.overdue')})</span>}</td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">R$ {p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{new Date(p.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {p.status === 'Pending' && <Button size="sm" onClick={() => handleMarkAsPaid(p.id)}>{t('financial.markAsPaid')}</Button>}
                      <Button size="sm" variant="secondary" onClick={() => handleOpenModal(p)}>{t('common.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeletePayable(p.id)}>{t('common.delete')}</Button>
                    </td>
                  </tr>
                ))}
                {filteredPayable.length === 0 && (<tr><td colSpan={6} className="text-center py-4">{t('financial.noPayable')}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
         <Card title="">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">{t('sales.client')}</th>
                  <th className="px-6 py-3">{t('financial.saleId')}</th>
                  <th className="px-6 py-3">{t('financial.amount')}</th>
                  <th className="px-6 py-3">{t('financial.dueDate')}</th>
                  <th className="px-6 py-3">{t('financial.status')}</th>
                  <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivable.map(r => (
                  <tr key={r.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isOverdue(r) ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}>
                    <td className="px-6 py-4 font-medium">{r.client.fullName} {isOverdue(r) && <span className="text-xs text-red-500 ml-2">({t('financial.overdue')})</span>}</td>
                    <td className="px-6 py-4">#{r.saleId}</td>
                    <td className="px-6 py-4">R$ {r.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{new Date(r.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'Pending' && <Button size="sm" onClick={() => handleRegisterPayment(r.id)}>{t('financial.registerPayment')}</Button>}
                    </td>
                  </tr>
                ))}
                {filteredReceivable.length === 0 && (<tr><td colSpan={6} className="text-center py-4">{t('financial.noReceivable')}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPayable ? t('financial.editExpense') : t('financial.addExpense')}>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">{t('financial.description')}</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
             <div>
                <label className="block text-sm font-medium">{t('financial.category')}</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium">{t('financial.amount')}</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
            </div>
             <div>
                <label className="block text-sm font-medium">{t('financial.dueDate')}</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleSavePayable}>{t('common.save')}</Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default FinancialPage;