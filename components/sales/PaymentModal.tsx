import React from 'react';
import { Payment, PaymentMethod, Client } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    remainingAmount: number;
    changeDue: number;
    payments: Payment[];
    clients: Client[];
    selectedClient: Client | null;
    onSelectClient: (client: Client | null) => void;
    onAddPayment: (method: PaymentMethod) => void;
    onRemovePayment: (index: number) => void;
    onConfirmPayment: () => void;
    cashTendered: number | null;
    onCashTenderedChange: (value: number | null) => void;
    onAccountDueDate: string;
    onOnAccountDueDateChange: (value: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    total,
    remainingAmount,
    changeDue,
    payments,
    clients,
    selectedClient,
    onSelectClient,
    onAddPayment,
    onRemovePayment,
    onConfirmPayment,
    cashTendered,
    onCashTenderedChange,
    onAccountDueDate,
    onOnAccountDueDateChange,
}) => {
    const { t } = useTranslation();
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('sales.finalizePayment')}>
            <div className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-sm text-gray-500">{t('sales.totalPayable')}</p>
                    <p className="text-4xl font-bold">R$ {total.toFixed(2)}</p>
                </div>
                 {remainingAmount > 0 &&
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-center">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">{t('sales.remaining')}: R$ {remainingAmount.toFixed(2)}</p>
                    </div>
                }
                {total > 0 && totalPaid >= total && changeDue > 0 &&
                     <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('sales.changeDue')}: R$ {changeDue.toFixed(2)}</p>
                    </div>
                }

                <div>
                    <h4 className="font-semibold mb-2">{t('sales.paymentMethod')}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button variant='secondary' onClick={() => onAddPayment('Cash')}>{t('sales.cash')}</Button>
                        <Button variant='secondary' onClick={() => onAddPayment('Debit Card')}>{t('sales.debitcard')}</Button>
                        <Button variant='secondary' onClick={() => onAddPayment('Credit Card')}>{t('sales.creditcard')}</Button>
                        <Button variant='secondary' onClick={() => onAddPayment('Pix')}>{t('sales.pix')}</Button>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('sales.client')}</label>
                        <select
                            value={selectedClient?.id || ''}
                            onChange={(e) => onSelectClient(clients.find(c => c.id === Number(e.target.value)) || null)}
                            className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-700"
                        >
                            <option value="">{t('sales.clientTypeConsumer')}</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                        </select>
                         {selectedClient && !payments.some(p => p.method === 'On Account') && (
                            <div className="mt-2 space-y-2 p-3 border dark:border-gray-600 rounded-md">
                                <p className="text-sm font-semibold">{t('sales.onAccountPaymentFor', { clientName: selectedClient.fullName })}</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.dueDate')}</label>
                                    <input
                                        type="date"
                                        value={onAccountDueDate}
                                        onChange={e => onOnAccountDueDateChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700"
                                    />
                                </div>
                                <Button variant='secondary' onClick={() => onAddPayment('On Account')} className="w-full mt-2" disabled={!selectedClient}>{t('sales.onaccount')}</Button>
                            </div>
                         )}
                    </div>
                </div>

                {payments.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">{t('sales.paymentsMade')}</h4>
                         {payments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                <span>{t(`sales.${p.method.toLowerCase().replace(' ', '')}`)}</span>
                                {p.method === 'Cash' ? (
                                    <input type="number" value={cashTendered ?? ''} onChange={e => onCashTenderedChange(e.target.value ? Number(e.target.value) : null)} placeholder={t('sales.amountTendered')} className="w-28 p-1 text-right rounded border bg-gray-100 dark:bg-gray-700" />
                                ): <span className="font-semibold">R$ {p.amount.toFixed(2)}</span> }
                                <button onClick={() => onRemovePayment(i)} className="text-red-500">X</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button onClick={onConfirmPayment} disabled={remainingAmount > 0.001}>{t('common.confirm')}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;
