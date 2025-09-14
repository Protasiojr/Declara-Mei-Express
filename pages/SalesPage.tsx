
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Product, Service, Client, SaleItem, Payment, PaymentMethod } from '../types';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_CLIENTS, MOCK_COMPANY } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const SalesPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    
    // Main data states
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [clients] = useState<Client[]>(MOCK_CLIENTS);

    // POS states
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    
    // Payment states
    const [payments, setPayments] = useState<Payment[]>([]);
    const [cashTendered, setCashTendered] = useState<number | null>(null);

    const availableItems: (Product | Service)[] = useMemo(() => [...products, ...services], [products, services]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return availableItems;
        const lowercasedSearch = searchTerm.toLowerCase();
        return availableItems.filter(item =>
            item.name.toLowerCase().includes(lowercasedSearch) ||
            ('sku' in item && item.sku.toLowerCase().includes(lowercasedSearch))
        );
    }, [searchTerm, availableItems]);

    const { subtotal, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + item.total, 0);
        return { subtotal: sub, total: sub }; // Placeholder for discount logic
    }, [cart]);
    
    const { totalPaid, changeDue, remainingAmount } = useMemo(() => {
        const paid = payments.reduce((acc, p) => acc + p.amount, 0);
        const remaining = total - paid;
        let change = 0;
        const cashPayment = payments.find(p => p.method === 'Cash');
        if (cashPayment && cashTendered !== null && paid >= total) {
             change = cashTendered - (cashPayment.amount - (paid - total));
        }

        return { totalPaid: paid, changeDue: change > 0 ? change : 0, remainingAmount: remaining > 0 ? remaining : 0 };
    }, [payments, total, cashTendered]);

    const addToCart = (item: Product | Service) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(cartItem => cartItem.item.id === item.id && ('sku' in cartItem.item) === ('sku' in item));
            if (existingItem) {
                return currentCart.map(cartItem =>
                    cartItem.item.id === item.id && ('sku' in cartItem.item) === ('sku' in item)
                        ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.unitPrice }
                        : cartItem
                );
            } else {
                return [...currentCart, { item, quantity: 1, unitPrice: item.price, total: item.price }];
            }
        });
    };

    const updateQuantity = (itemId: number, isProduct: boolean, newQuantity: number) => {
        setCart(currentCart => {
            if (newQuantity <= 0) {
                return currentCart.filter(cartItem => !(cartItem.item.id === itemId && ('sku' in cartItem.item) === isProduct));
            }
            return currentCart.map(cartItem =>
                cartItem.item.id === itemId && ('sku' in cartItem.item) === isProduct
                    ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.unitPrice }
                    : cartItem
            );
        });
    };
    
    const cancelSale = () => {
        toast.confirm(t('sales.cancelSaleConfirm'), () => {
            setCart([]);
            setPayments([]);
            setSelectedClient(null);
            setCashTendered(null);
            toast.info(t('sales.saleCanceled'));
        });
    };
    
    const handlePayment = () => {
        if (cart.length === 0) {
            toast.error(t('sales.emptyCartError'));
            return;
        }
        setIsPaymentModalOpen(true);
    }
    
    const addPayment = (method: PaymentMethod) => {
        if (remainingAmount <= 0) return;

        if (method === 'On Account' && !selectedClient) {
            toast.error(t('sales.clientRequiredForOnAccount'));
            return;
        }

        setPayments(prev => [...prev, { method, amount: remainingAmount }]);
    };
    
    const removePayment = (index: number) => {
        const paymentToRemove = payments[index];
        if (paymentToRemove.method === 'Cash') {
            setCashTendered(null);
        }
        setPayments(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmPayment = () => {
        if (remainingAmount > 0.001) { // Use a small epsilon for float comparison
            toast.error(t('sales.paymentNotCovered'));
            return;
        }

        // 1. Update stock
        setProducts(currentProducts => {
            const newProducts = [...currentProducts];
            cart.forEach(cartItem => {
                if ('sku' in cartItem.item) {
                    const productIndex = newProducts.findIndex(p => p.id === cartItem.item.id);
                    if (productIndex !== -1) {
                        newProducts[productIndex].currentStock -= cartItem.quantity;
                    }
                }
            });
            return newProducts;
        });

        // 2. Create Sale object
        const newSale: Sale = {
            id: Date.now(),
            items: cart,
            subtotal,
            discount: 0,
            total,
            payments,
            changeDue,
            date: new Date().toISOString().split('T')[0],
            withInvoice: false, // Defaulting this, can be added to UI
            client: selectedClient
        };
        
        // 3. Save sale
        setSales(prev => [newSale, ...prev]);
        setLastSale(newSale);

        // 4. Reset POS state
        setCart([]);
        setPayments([]);
        setCashTendered(null);
        setSelectedClient(null);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true); // Open receipt modal
        toast.success(t('sales.saleCompleted'));
    };
    
    const generateReceiptPDF = (sale: Sale) => {
        const doc = new jsPDF();
        const { name: companyName, cnpj, address } = MOCK_COMPANY;

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`CNPJ: ${cnpj}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.text(`${address.street}, ${address.number} - ${address.city}`, doc.internal.pageSize.getWidth() / 2, 24, { align: 'center' });
        doc.text(`${t('sales.nonFiscalDocument')}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        
        // Sale Info
        doc.text(`ID: ${sale.id}`, 14, 40);
        doc.text(`${t('sales.date')}: ${new Date(sale.date + 'T00:00:00').toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 14, 40, { align: 'right' });

        // Items Table
        autoTable(doc, {
            startY: 45,
            head: [[t('sales.item'), t('sales.quantity'), 'UN', t('sales.total')]],
            body: sale.items.map(i => [i.item.name, i.quantity, `R$ ${i.unitPrice.toFixed(2)}`, `R$ ${i.total.toFixed(2)}`]),
            theme: 'plain',
            styles: { fontSize: 8 },
            headStyles: { fontStyle: 'bold' }
        });

        let finalY = (doc as any).lastAutoTable.finalY + 5;

        // Totals
        doc.setFontSize(10);
        doc.text(`${t('sales.subtotal')}: R$ ${sale.subtotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, finalY, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('sales.total')}: R$ ${sale.total.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, finalY + 5, { align: 'right' });
        
        // Payments
        finalY += 15;
        doc.setFont('helvetica', 'bold');
        doc.text(t('sales.paymentDetails'), 14, finalY);
        doc.setFont('helvetica', 'normal');
        sale.payments.forEach((p, i) => {
            finalY += 5;
            doc.text(`${t(`sales.${p.method.toLowerCase().replace(' ', '')}`)}: R$ ${p.amount.toFixed(2)}`, 14, finalY);
        });
        if(sale.changeDue > 0) {
            finalY += 5;
            doc.text(`${t('sales.changeDue')}: R$ ${sale.changeDue.toFixed(2)}`, 14, finalY);
        }

        doc.save(`recibo_venda_${sale.id}.pdf`);
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-4 -m-6 p-2">
            {/* Left side: Product Selection */}
            <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col">
                <div className="p-4">
                    <input
                        type="text"
                        placeholder={t('sales.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredItems.map(item => (
                            <button key={`${'sku' in item ? 'p' : 's'}-${item.id}`} onClick={() => addToCart(item)} className="p-2 border dark:border-gray-700 rounded-lg text-center bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                                     <span className="text-gray-500 text-xs">Sem Imagem</span>
                                </div>
                                <p className="text-sm font-semibold truncate">{item.name}</p>
                                <p className="text-xs text-primary-600 dark:text-primary-400">R$ {item.price.toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side: Cart */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('sales.currentSale')}</h2>
                    <Button onClick={() => setIsHistoryModalOpen(true)} variant="secondary">{t('sales.saleHistory')}</Button>
                </div>
                <div className="flex-grow overflow-y-auto border-y dark:border-gray-700 -mx-4 px-4 py-2">
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">{t('sales.emptyCart')}</p>
                    ) : (
                        cart.map(cartItem => (
                            <div key={`${'sku' in cartItem.item ? 'p' : 's'}-${cartItem.item.id}`} className="flex items-center py-2 border-b dark:border-gray-700 last:border-b-0">
                                <div className="flex-grow">
                                    <p className="font-semibold">{cartItem.item.name}</p>
                                    <p className="text-sm text-gray-500">R$ {cartItem.unitPrice.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={cartItem.quantity}
                                        onChange={(e) => updateQuantity(cartItem.item.id, 'sku' in cartItem.item, Number(e.target.value))}
                                        className="w-16 p-1 text-center rounded border bg-gray-100 dark:bg-gray-700"
                                    />
                                    <p className="w-20 text-right font-semibold">R$ {cartItem.total.toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="pt-4">
                    <div className="flex justify-between mb-2">
                        <span>{t('sales.subtotal')}</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold mb-4">
                        <span>{t('sales.total')}</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="danger" onClick={cancelSale} disabled={cart.length === 0}>{t('sales.cancelSale')}</Button>
                        <Button onClick={handlePayment} disabled={cart.length === 0}>{t('sales.finalizePayment')}</Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={t('sales.finalizePayment')}>
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
                    {totalPaid > total && 
                         <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('sales.changeDue')}: R$ {changeDue.toFixed(2)}</p>
                        </div>
                    }
                    
                    <div>
                        <h4 className="font-semibold mb-2">{t('sales.paymentMethod')}</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <Button variant='secondary' onClick={() => addPayment('Cash')}>{t('sales.cash')}</Button>
                            <Button variant='secondary' onClick={() => addPayment('Debit Card')}>{t('sales.debitCard')}</Button>
                            <Button variant='secondary' onClick={() => addPayment('Credit Card')}>{t('sales.creditCard')}</Button>
                            <Button variant='secondary' onClick={() => addPayment('Pix')}>{t('sales.pix')}</Button>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">{t('sales.client')}</label>
                            <select
                                value={selectedClient?.id || ''}
                                onChange={(e) => setSelectedClient(clients.find(c => c.id === Number(e.target.value)) || null)}
                                className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-700"
                            >
                                <option value="">{t('sales.clientTypeConsumer')}</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                            </select>
                             <Button variant='secondary' onClick={() => addPayment('On Account')} className="w-full mt-2" disabled={!selectedClient}>{t('sales.onAccount')}</Button>
                        </div>
                    </div>
                    
                    {payments.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">{t('sales.paymentsMade')}</h4>
                             {payments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <span>{t(`sales.${p.method.toLowerCase().replace(' ', '')}`)}</span>
                                    {p.method === 'Cash' ? (
                                        <input type="number" value={cashTendered ?? ''} onChange={e => setCashTendered(Number(e.target.value))} placeholder={t('sales.amountTendered')} className="w-28 p-1 text-right rounded border bg-gray-100 dark:bg-gray-700" />
                                    ): <span className="font-semibold">R$ {p.amount.toFixed(2)}</span> }
                                    <button onClick={() => removePayment(i)} className="text-red-500">X</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleConfirmPayment} disabled={remainingAmount > 0.001}>{t('common.confirm')}</Button>
                    </div>
                </div>
            </Modal>
            
            {/* Sales History Modal */}
            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={t('sales.saleHistory')}>
                <div className="max-h-[70vh] overflow-y-auto">
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">{t('sales.date')}</th>
                                <th className="px-4 py-2">{t('sales.items')}</th>
                                <th className="px-4 py-2">{t('sales.total')}</th>
                                <th className="px-4 py-2">{t('sales.client')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(s => (
                                <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-4 py-2">{new Date(s.date + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{s.items.map(i => `${i.quantity}x ${i.item.name}`).join(', ')}</td>
                                    <td className="px-4 py-2">R$ {s.total.toFixed(2)}</td>
                                    <td className="px-4 py-2">{s.client?.fullName || t('sales.clientTypeConsumer')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Receipt Modal */}
             <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title={t('sales.saleCompleted')}>
                 <div className="text-center space-y-4">
                    <p>{t('sales.receiptPrompt')}</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsReceiptModalOpen(false)}>{t('common.no')}</Button>
                        <Button onClick={() => lastSale && generateReceiptPDF(lastSale)}>{t('sales.printReceipt')}</Button>
                    </div>
                </div>
             </Modal>
        </div>
    );
};

export default SalesPage;
