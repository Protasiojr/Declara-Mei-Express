import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Page, Sale, Product, Service, Client, SaleItem, Payment, PaymentMethod, CashSession, CashTransaction, User, AccountReceivable } from '../types';
import { MOCK_SERVICES, MOCK_CLIENTS, MOCK_COMPANY, MOCK_USER } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

interface SalesPageProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    setAccountsReceivable: React.Dispatch<React.SetStateAction<AccountReceivable[]>>;
    setCurrentPage: (page: Page) => void;
    cashSessions: CashSession[];
    setCashSessions: React.Dispatch<React.SetStateAction<CashSession[]>>;
}

const SalesPage: React.FC<SalesPageProps> = ({ products, setProducts, sales, setSales, setAccountsReceivable, setCurrentPage, cashSessions, setCashSessions }) => {
    const { t } = useTranslation();
    const toast = useToast();
    
    const [services] = useState<Service[]>(MOCK_SERVICES);
    const [clients] = useState<Client[]>(MOCK_CLIENTS);
    const [user] = useState<User>(MOCK_USER);

    // POS states
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Cash Control State - Derived from props for consistency
    const currentCashSession = useMemo(() => cashSessions.find(s => s.status === 'Open'), [cashSessions]);

    // Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(true);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
    const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
    const [isPostClosingModalOpen, setIsPostClosingModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [lastClosedSession, setLastClosedSession] = useState<CashSession | null>(null);
    
    // Form & Calculation States
    const [openingBalance, setOpeningBalance] = useState('');
    const [movementType, setMovementType] = useState<'Supply' | 'Withdrawal'>('Supply');
    const [movementAmount, setMovementAmount] = useState('');
    const [movementDescription, setMovementDescription] = useState('');
    const [countedBalance, setCountedBalance] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('manager@example.com');
    
    // Payment states
    const [payments, setPayments] = useState<Payment[]>([]);
    const [cashTendered, setCashTendered] = useState<number | null>(null);
    const [onAccountDueDate, setOnAccountDueDate] = useState<string>('');
    const [gatewayPaymentMethod, setGatewayPaymentMethod] = useState<PaymentMethod | null>(null);
    const [gatewayAmount, setGatewayAmount] = useState(0);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    useEffect(() => {
        if (currentCashSession) {
            setIsOpeningModalOpen(false);
        } else {
            setIsOpeningModalOpen(true);
        }
    }, [currentCashSession]);


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

    const cashClosingTotals = useMemo(() => {
        if (!currentCashSession) return { sales: 0, supplies: 0, withdrawals: 0, expected: 0 };
        const opening = currentCashSession.openingBalance;
        let sales = 0;
        let supplies = 0;
        let withdrawals = 0;

        currentCashSession.transactions.forEach(tx => {
            if (tx.type === 'Sale') sales += tx.amount;
            if (tx.type === 'Supply') supplies += tx.amount;
            if (tx.type === 'Withdrawal') withdrawals += tx.amount;
        });

        const expected = opening + sales + supplies - withdrawals;
        return { sales, supplies, withdrawals, expected };
    }, [currentCashSession]);

    const emailContent = useMemo(() => {
        if (!lastClosedSession) return { subject: '', body: '' };

        const date = new Date(lastClosedSession.closedAt!).toLocaleDateString();
        const subject = t('cashControl.emailSubjectTemplate', { date });
        
        const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

        const body = [
            t('cashControl.emailBodyTemplate.title'),
            '------------------------------------',
            t('cashControl.emailBodyTemplate.operator', { operatorName: lastClosedSession.operatorName }),
            t('cashControl.emailBodyTemplate.openedAt', { time: new Date(lastClosedSession.openedAt).toLocaleString() }),
            t('cashControl.emailBodyTemplate.closedAt', { time: new Date(lastClosedSession.closedAt!).toLocaleString() }),
            '------------------------------------',
            t('cashControl.emailBodyTemplate.openingBalance', { amount: formatCurrency(lastClosedSession.openingBalance) }),
            t('cashControl.emailBodyTemplate.expectedBalance', { amount: formatCurrency(lastClosedSession.expectedBalance ?? 0) }),
            t('cashControl.emailBodyTemplate.countedBalance', { amount: formatCurrency(lastClosedSession.closingBalance ?? 0) }),
            t('cashControl.emailBodyTemplate.difference', { amount: formatCurrency(lastClosedSession.difference ?? 0) }),
        ].join('\n');
        
        return { subject, body };
    }, [lastClosedSession, t]);

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
            setOnAccountDueDate('');
            toast.info(t('sales.saleCanceled'));
        });
    };
    
    const handlePayment = () => {
        if (cart.length === 0) {
            toast.error(t('sales.emptyCartError'));
            return;
        }

        for (const cartItem of cart) {
            if ('sku' in cartItem.item) { // Check stock only for products
                const productInStock = products.find(p => p.id === cartItem.item.id);
                if (!productInStock || productInStock.currentStock < cartItem.quantity) {
                    toast.error(t('sales.insufficientStockError', { productName: cartItem.item.name }));
                    return;
                }
            }
        }

        setIsPaymentModalOpen(true);
    }
    
    const addPayment = (method: PaymentMethod) => {
        if (remainingAmount <= 0) return;

        if (method === 'Credit Card' || method === 'Debit Card') {
            setGatewayPaymentMethod(method);
            setGatewayAmount(remainingAmount);
            setIsGatewayModalOpen(true);
            return;
        }

        if (method === 'On Account') {
            if (!selectedClient) {
                toast.error(t('sales.clientRequiredForOnAccount'));
                return;
            }
             if (!onAccountDueDate) {
                toast.error(t('sales.dueDateRequired'));
                return;
            }
        }
        
        setPayments(prev => [...prev, { method, amount: remainingAmount }]);
    };
    
    const removePayment = (index: number) => {
        const paymentToRemove = payments[index];
        if (paymentToRemove.method === 'Cash') {
            setCashTendered(null);
        }
        if (paymentToRemove.method === 'On Account') {
            setOnAccountDueDate('');
        }
        setPayments(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmPayment = () => {
        if (remainingAmount > 0.001) { // Use a small epsilon for float comparison
            toast.error(t('sales.paymentNotCovered'));
            return;
        }
        
        const onAccountPayment = payments.find(p => p.method === 'On Account');
        if (onAccountPayment && !onAccountDueDate) {
            toast.error(t('sales.dueDateRequired'));
            return;
        }

        const newSaleId = Date.now();
        
        // 1. Update Cash Session Transaction
        const cashPayment = payments.find(p => p.method === 'Cash');
        if (cashPayment && cashPayment.amount > 0 && currentCashSession) {
             const newTransaction: CashTransaction = {
                id: Date.now(),
                type: 'Sale',
                amount: cashPayment.amount - changeDue,
                timestamp: new Date().toISOString(),
                description: `Venda #${newSaleId}`,
                operatorName: user.name,
                saleId: newSaleId
            };
            setCashSessions(prevSessions =>
                prevSessions.map(session =>
                    session.id === currentCashSession.id
                        ? { ...session, transactions: [...session.transactions, newTransaction] }
                        : session
                )
            );
        }

        // 2. Update stock
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

        // 3. Create Sale object
        const newSale: Sale = {
            id: newSaleId,
            items: cart,
            subtotal,
            discount: 0,
            total,
            payments,
            changeDue,
            date: new Date().toISOString().split('T')[0],
            withInvoice: false,
            client: selectedClient
        };
        
        // 4. Create Account Receivable if applicable
        if (onAccountPayment && selectedClient) {
            const newReceivable: AccountReceivable = {
                id: Date.now(),
                saleId: newSale.id,
                client: selectedClient,
                amount: onAccountPayment.amount,
                issueDate: newSale.date,
                dueDate: onAccountDueDate,
                status: 'Pending'
            };
            setAccountsReceivable(prev => [newReceivable, ...prev]);
        }

        setSales(prev => [newSale, ...prev]);
        setLastSale(newSale);

        setCart([]);
        setPayments([]);
        setCashTendered(null);
        setSelectedClient(null);
        setOnAccountDueDate('');
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true);
        toast.success(t('sales.saleCompleted'));
    };
    
    const handleOpenCash = () => {
        const balance = parseFloat(openingBalance);
        if (isNaN(balance) || balance < 0) {
            toast.error(t('cashControl.invalidOpeningBalance'));
            return;
        }
        const openingTransaction: CashTransaction = {
            id: Date.now(),
            type: 'Opening',
            amount: balance,
            timestamp: new Date().toISOString(),
            description: t('cashControl.cashOpened'),
            operatorName: user.name,
        }
        const newSession: CashSession = {
            id: Date.now(),
            operatorName: user.name,
            openingBalance: balance,
            openedAt: new Date().toISOString(),
            status: 'Open',
            transactions: [openingTransaction]
        };
        setCashSessions(prev => [...prev, newSession]);
        setIsOpeningModalOpen(false);
        setOpeningBalance('');
        toast.success(t('cashControl.cashOpenedSuccess'));
    };
    
    const handleCashMovement = () => {
        const amount = parseFloat(movementAmount);
        if(isNaN(amount) || amount <= 0) {
            toast.error(t('cashControl.invalidAmount'));
            return;
        }
        if(!movementDescription.trim()) {
            toast.error(t('validation.requiredDescription'));
            return;
        }
        
        if (currentCashSession) {
            const newTransaction: CashTransaction = {
                id: Date.now(),
                type: movementType,
                amount,
                timestamp: new Date().toISOString(),
                description: movementDescription,
                operatorName: user.name
            };
            setCashSessions(prevSessions =>
                prevSessions.map(session =>
                    session.id === currentCashSession.id
                        ? { ...session, transactions: [...session.transactions, newTransaction] }
                        : session
                )
            );
             toast.success(t('cashControl.movementSuccess'));
             setIsMovementModalOpen(false);
             setMovementAmount('');
             setMovementDescription('');
        }
    };
    
    const handleFinalizeCloseCash = () => {
        const counted = parseFloat(countedBalance);
        if (isNaN(counted) || counted < 0) {
            toast.error(t('cashControl.invalidCountedBalance'));
            return;
        }

        if (currentCashSession) {
            const closedSession: CashSession = {
                ...currentCashSession,
                status: 'Closed',
                closedAt: new Date().toISOString(),
                closingBalance: counted,
                expectedBalance: cashClosingTotals.expected,
                difference: counted - cashClosingTotals.expected
            };
            setCashSessions(prev => prev.map(s => (s.id === currentCashSession.id ? closedSession : s)));
            setLastClosedSession(closedSession);
            setIsClosingModalOpen(false);
            setIsPostClosingModalOpen(true);
            setCountedBalance('');
        }
    }
    
    const handleGatewayPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessingPayment(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (gatewayPaymentMethod) {
            setPayments(prev => [...prev, { method: gatewayPaymentMethod, amount: gatewayAmount }]);
        }
        setIsProcessingPayment(false);
        setIsGatewayModalOpen(false);
        toast.success(t('sales.paymentApproved'));
    }

    const generateReceiptPDF = (sale: Sale) => {
        const doc = new jsPDF();
        const { name: companyName, cnpj, address } = MOCK_COMPANY;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`CNPJ: ${cnpj}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.text(`${address.street}, ${address.number} - ${address.city}`, doc.internal.pageSize.getWidth() / 2, 24, { align: 'center' });
        doc.text(`${t('sales.nonFiscalDocument')}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        
        doc.text(`ID: ${sale.id}`, 14, 40);
        doc.text(`${t('sales.date')}: ${new Date(sale.date + 'T00:00:00').toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 14, 40, { align: 'right' });

        autoTable(doc, {
            startY: 45,
            head: [[t('sales.item'), t('sales.quantity'), 'UN', t('sales.total')]],
            body: sale.items.map(i => [i.item.name, i.quantity, `R$ ${i.unitPrice.toFixed(2)}`, `R$ ${i.total.toFixed(2)}`]),
            theme: 'plain',
            styles: { fontSize: 8 },
            headStyles: { fontStyle: 'bold' }
        });

        let finalY = (doc as any).lastAutoTable.finalY + 5;

        doc.setFontSize(10);
        doc.text(`${t('sales.subtotal')}: R$ ${sale.subtotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, finalY, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('sales.total')}: R$ ${sale.total.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, finalY + 5, { align: 'right' });
        
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
    
    const handleCloseOpeningModal = () => {
        toast.info(t('cashControl.operationCanceled'));
        setCurrentPage(Page.Dashboard);
    };

    const handleFinishClosing = () => {
        setIsPostClosingModalOpen(false);
        setCurrentPage(Page.Dashboard);
    };

    const handleSendByEmail = () => {
        setIsEmailModalOpen(true);
    };
    
    const handleConfirmSendEmail = () => {
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
        window.location.href = mailtoLink;
        setIsEmailModalOpen(false);
        toast.info(t('cashControl.emailClientOpened'));
    };

    const handleSendByWhatsApp = () => {
        toast.info(t('cashControl.summarySentByWhatsApp'));
    };

    if (!currentCashSession) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
                 <Modal isOpen={isOpeningModalOpen} onClose={handleCloseOpeningModal} title={t('cashControl.openCash')}>
                    <div className="space-y-4">
                        <p>{t('cashControl.openCashPrompt')}</p>
                        <div>
                            <label className="block text-sm font-medium">{t('cashControl.openingBalance')}</label>
                            <input
                                type="number"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                placeholder='100.00'
                                className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleOpenCash}>{t('cashControl.openCash')}</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }

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

            {/* Right side: Cart & Cash Control */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('sales.currentSale')}</h2>
                    <Button onClick={() => setIsHistoryModalOpen(true)} variant="secondary">{t('sales.saleHistory')}</Button>
                </div>
                 <div className="flex-grow overflow-y-auto border-y dark:border-gray-700 -mx-4 px-4 py-2 my-4">
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

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span>{t('sales.subtotal')}</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold">
                        <span>{t('sales.total')}</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button variant="danger" onClick={cancelSale} disabled={cart.length === 0}>{t('sales.cancelSale')}</Button>
                    <Button onClick={handlePayment} disabled={cart.length === 0}>{t('sales.finalizePayment')}</Button>
                </div>
                
                {/* Cash Control Panel */}
                <div className="border-t dark:border-gray-700 pt-4 mt-auto space-y-2 text-sm">
                    <h3 className="font-bold text-base mb-2">{t('cashControl.title')}</h3>
                     <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.status')}</span> <span className="font-semibold text-green-500">{t('cashControl.statusOpen')}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.operator')}</span> <span>{currentCashSession.operatorName}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.openedAt')}</span> <span>{new Date(currentCashSession.openedAt).toLocaleTimeString()}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.openingBalance')}</span> <span>R$ {currentCashSession.openingBalance.toFixed(2)}</span></div>
                     <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="secondary" onClick={() => setIsMovementModalOpen(true)}>{t('cashControl.cashMovement')}</Button>
                        <Button variant="primary" onClick={() => setIsClosingModalOpen(true)}>{t('cashControl.closeCash')}</Button>
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
                             {selectedClient && !payments.some(p => p.method === 'On Account') && (
                                <div className="mt-2 space-y-2 p-3 border dark:border-gray-600 rounded-md">
                                    <p className="text-sm font-semibold">{t('sales.onAccountPaymentFor', { clientName: selectedClient.fullName })}</p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.dueDate')}</label>
                                        <input
                                            type="date"
                                            value={onAccountDueDate}
                                            onChange={e => setOnAccountDueDate(e.target.value)}
                                            className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700"
                                        />
                                    </div>
                                    <Button variant='secondary' onClick={() => addPayment('On Account')} className="w-full mt-2" disabled={!selectedClient}>{t('sales.onAccount')}</Button>
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
             
             {/* Cash Movement Modal */}
            <Modal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} title={t('cashControl.cashMovement')}>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <label className="flex items-center"><input type="radio" name="movementType" checked={movementType === 'Supply'} onChange={() => setMovementType('Supply')} /><span className="ml-2">{t('cashControl.supply')}</span></label>
                        <label className="flex items-center"><input type="radio" name="movementType" checked={movementType === 'Withdrawal'} onChange={() => setMovementType('Withdrawal')} /><span className="ml-2">{t('cashControl.withdrawal')}</span></label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('cashControl.amount')}</label>
                        <input type="number" value={movementAmount} onChange={e => setMovementAmount(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('cashControl.description')}</label>
                        <input type="text" value={movementDescription} onChange={e => setMovementDescription(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-end pt-2 space-x-2">
                        <Button variant="secondary" onClick={() => setIsMovementModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleCashMovement}>{t('common.confirm')}</Button>
                    </div>
                </div>
            </Modal>

            {/* Close Cash Modal */}
            <Modal isOpen={isClosingModalOpen} onClose={() => setIsClosingModalOpen(false)} title={t('cashControl.closeCashSummary')}>
                 <div className="space-y-3 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md space-y-2">
                        <div className="flex justify-between"><span>{t('cashControl.openingBalance')}</span> <span>R$ {currentCashSession.openingBalance.toFixed(2)}</span></div>
                        <div className="flex justify-between text-green-600 dark:text-green-400"><span>(+) {t('cashControl.salesInCash')}</span> <span>R$ {cashClosingTotals.sales.toFixed(2)}</span></div>
                        <div className="flex justify-between text-green-600 dark:text-green-400"><span>(+) {t('cashControl.supplies')}</span> <span>R$ {cashClosingTotals.supplies.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-600 dark:text-red-400"><span>(-) {t('cashControl.withdrawals')}</span> <span>R$ {cashClosingTotals.withdrawals.toFixed(2)}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-base p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span>{t('cashControl.expectedBalance')}</span> 
                        <span>R$ {cashClosingTotals.expected.toFixed(2)}</span>
                    </div>
                     <div>
                        <label className="block font-medium text-base">{t('cashControl.countedBalance')}</label>
                        <input type="number" value={countedBalance} onChange={e => setCountedBalance(e.target.value)} className="mt-1 block w-full text-lg p-2 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                    </div>
                    {countedBalance && (
                        <div className={`flex justify-between font-bold text-base p-3 rounded-md ${(parseFloat(countedBalance) - cashClosingTotals.expected) !== 0 ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                            <span>{t('cashControl.difference')}</span> 
                            <span>
                                R$ {(parseFloat(countedBalance) - cashClosingTotals.expected).toFixed(2)}
                                <span className="text-xs ml-1">
                                    ({(parseFloat(countedBalance) - cashClosingTotals.expected) > 0 ? t('cashControl.surplus') : t('cashControl.shortage')})
                                </span>
                            </span>
                        </div>
                    )}
                     <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="secondary" onClick={() => setIsClosingModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleFinalizeCloseCash}>{t('cashControl.confirmCloseCash')}</Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Gateway Modal */}
            <Modal isOpen={isGatewayModalOpen} onClose={() => setIsGatewayModalOpen(false)} title={t('sales.cardPaymentTitle')}>
                <form onSubmit={handleGatewayPayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('sales.cardNumber')}</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('sales.cardHolderName')}</label>
                        <input type="text" placeholder="Nome no Cartão" className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">{t('sales.expiryDate')}</label>
                            <input type="text" placeholder="MM/AA" className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('sales.cvv')}</label>
                            <input type="text" placeholder="123" className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-500">{t('sales.gatewayDisclaimer')}</p>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isProcessingPayment} className="w-full">
                            {isProcessingPayment ? t('sales.processingPayment') : `${t('sales.payAmount')} R$ ${gatewayAmount.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </Modal>
            
            {/* Post-Closing Modal */}
            {lastClosedSession && (
                <Modal isOpen={isPostClosingModalOpen} onClose={handleFinishClosing} title={t('cashControl.postClosingTitle')}>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-center">{t('cashControl.closeCashSummary')}</h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between"><span>{t('cashControl.expectedBalance')}</span> <span className="font-bold">R$ {lastClosedSession.expectedBalance?.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>{t('cashControl.countedBalance')}</span> <span className="font-bold">R$ {lastClosedSession.closingBalance?.toFixed(2)}</span></div>
                            <div className={`flex justify-between font-bold ${(lastClosedSession.difference ?? 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                <span>{t('cashControl.difference')}</span>
                                <span>R$ {lastClosedSession.difference?.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <p className="text-center text-gray-600 dark:text-gray-400 pt-4">{t('cashControl.postClosingDescription')}</p>

                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="secondary" onClick={handleSendByEmail}>{t('cashControl.sendByEmail')}</Button>
                            <Button variant="secondary" onClick={handleSendByWhatsApp}>{t('cashControl.sendByWhatsApp')}</Button>
                        </div>
                        <div className="flex justify-center pt-4">
                            <Button onClick={handleFinishClosing}>{t('cashControl.finish')}</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Email Summary Modal */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title={t('cashControl.emailModalTitle')}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="recipientEmail" className="block text-sm font-medium">{t('cashControl.recipientEmail')}</label>
                        <input
                            type="email"
                            id="recipientEmail"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('cashControl.emailSubject')}</label>
                        <input
                            type="text"
                            value={emailContent.subject}
                            disabled
                            className="mt-1 block w-full rounded-md shadow-sm bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('cashControl.emailBody')}</label>
                        <textarea
                            value={emailContent.body}
                            disabled
                            rows={10}
                            className="mt-1 block w-full rounded-md shadow-sm bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="secondary" onClick={() => setIsEmailModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleConfirmSendEmail}>{t('cashControl.sendEmail')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesPage;