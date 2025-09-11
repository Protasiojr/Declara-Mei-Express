import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Sale, Product, Service } from '../types';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_SERVICES } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';

type SaleFormData = {
  itemId: string;
  quantity: string;
  date: string;
  withInvoice: boolean;
  clientType: 'Empresa' | 'Consumidor Comum';
};

const SalesPage: React.FC = () => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState<Sale | null>(null);
    
    const initialFormData: SaleFormData = {
        itemId: '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0],
        withInvoice: false,
        clientType: 'Consumidor Comum',
    };
    const [formData, setFormData] = useState<SaleFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<SaleFormData>>({});
    
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [justification, setJustification] = useState('');
    const [justificationError, setJustificationError] = useState('');

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        itemType: 'all', // 'all', 'product', 'service'
    });

    const availableItems = useMemo(() => {
        const items: ({ value: string; label: string; price: number })[] = [];
        MOCK_PRODUCTS.forEach(p => items.push({ value: `product-${p.id}`, label: p.name, price: p.price }));
        MOCK_SERVICES.forEach(s => items.push({ value: `service-${s.id}`, label: s.name, price: s.price }));
        return items;
    }, []);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            if (filters.startDate && sale.date < filters.startDate) {
                return false;
            }
            if (filters.endDate && sale.date > filters.endDate) {
                return false;
            }
            if (filters.itemType === 'product' && !('type' in sale.item)) {
                return false;
            }
            if (filters.itemType === 'service' && 'type' in sale.item) {
                return false;
            }
            return true;
        });
    }, [sales, filters]);

    const findItemByValue = (value: string): Product | Service | undefined => {
        const [type, idStr] = value.split('-');
        const id = parseInt(idStr, 10);
        if (type === 'product') {
            return MOCK_PRODUCTS.find(p => p.id === id);
        }
        if (type === 'service') {
            return MOCK_SERVICES.find(s => s.id === id);
        }
        return undefined;
    };

    const validate = () => {
        const newErrors: Partial<SaleFormData> = {};
        if (!formData.itemId) newErrors.itemId = t('validation.required');
        const quantityNum = Number(formData.quantity);
        if (!formData.quantity || isNaN(quantityNum) || quantityNum <= 0) newErrors.quantity = t('validation.invalidPrice');
        if (!formData.date) newErrors.date = t('validation.required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleOpenModal = (sale: Sale | null) => {
        setErrors({});
        if (sale) {
            setCurrentSale(sale);
            const itemType = 'type' in sale.item ? 'product' : 'service';
            setFormData({
                itemId: `${itemType}-${sale.item.id}`,
                quantity: String(sale.quantity),
                date: sale.date,
                withInvoice: sale.withInvoice,
                clientType: sale.clientType,
            });
        } else {
            setCurrentSale(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = () => {
        if (!validate()) return;
        if (currentSale) {
            // Editing existing sale, open justification modal
            setJustification('');
            setJustificationError('');
            setIsJustificationModalOpen(true);
        } else {
            // Adding new sale
            const item = findItemByValue(formData.itemId);
            if (!item) return;
            const newSale: Sale = {
                id: Date.now(),
                item,
                quantity: Number(formData.quantity),
                total: item.price * Number(formData.quantity),
                date: formData.date,
                withInvoice: formData.withInvoice,
                clientType: formData.clientType
            };
            setSales(prev => [newSale, ...prev]);
            handleCloseModal();
        }
    };
    
    const handleConfirmSaveWithJustification = () => {
        if(!justification.trim()){
            setJustificationError(t('common.justificationRequired'));
            return;
        }

        if(currentSale) {
            const item = findItemByValue(formData.itemId);
            if (!item) return;

            const updatedSale: Sale = {
                id: currentSale.id,
                item,
                quantity: Number(formData.quantity),
                total: item.price * Number(formData.quantity),
                date: formData.date,
                withInvoice: formData.withInvoice,
                clientType: formData.clientType
            };
            setSales(sales.map(s => s.id === currentSale.id ? updatedSale : s));
        }
        
        setIsJustificationModalOpen(false);
        handleCloseModal();
    };


    const handleDelete = (saleId: number) => {
        if (window.confirm(t('sales.deleteConfirm'))) {
            setSales(sales.filter(s => s.id !== saleId));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            itemType: 'all',
        });
    };
    
    const totalValue = useMemo(() => {
        const item = findItemByValue(formData.itemId);
        const quantity = Number(formData.quantity);
        if (item && !isNaN(quantity) && quantity > 0) {
            return item.price * quantity;
        }
        return 0;
    }, [formData.itemId, formData.quantity]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sales.title')}</h1>

            <Card title={t('sales.history')}>
                <div className="mb-4 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterStartDate')}</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterEndDate')}</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterItemType')}</label>
                            <select name="itemType" value={filters.itemType} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500">
                                <option value="all">{t('sales.filterAllItems')}</option>
                                <option value="product">{t('sales.filterProducts')}</option>
                                <option value="service">{t('sales.filterServices')}</option>
                            </select>
                        </div>
                        <div className="flex justify-start">
                                <Button variant="secondary" onClick={clearFilters}>{t('sales.clearFilters')}</Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenModal(null)}>{t('sales.registerNewSale')}</Button>
                </div>
                <div className="overflow-x-auto">
                    {filteredSales.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('sales.item')}</th>
                                    <th scope="col" className="px-6 py-3">{t('sales.quantity')}</th>
                                    <th scope="col" className="px-6 py-3">{t('sales.total')}</th>
                                    <th scope="col" className="px-6 py-3">{t('sales.date')}</th>
                                    <th scope="col" className="px-6 py-3">{t('sales.client')}</th>
                                    <th scope="col" className="px-6 py-3">{t('sales.invoice')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map(sale => (
                                    <tr key={sale.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sale.item.name}</td>
                                        <td className="px-6 py-4">{sale.quantity}</td>
                                        <td className="px-6 py-4">R$ {sale.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{sale.clientType === 'Empresa' ? t('sales.clientTypeCompany') : t('sales.clientTypeConsumer')}</td>
                                        <td className="px-6 py-4">{sale.withInvoice ? t('common.yes') : t('common.no')}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenModal(sale)}>{t('common.edit')}</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(sale.id)}>{t('common.delete')}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">{t('sales.noResults')}</p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentSale ? t('sales.editSale') : t('sales.addSale')}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('sales.item')}</label>
                        <select name="itemId" value={formData.itemId} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.itemId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            <option value="">{t('sales.selectItem')}</option>
                            {availableItems.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                         {errors.itemId && <p className="text-sm text-red-500 mt-1">{errors.itemId}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.quantity')}</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.date')}</label>
                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.client')}</label>
                        <select name="clientType" value={formData.clientType} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            <option value="Consumidor Comum">{t('sales.clientTypeConsumer')}</option>
                            <option value="Empresa">{t('sales.clientTypeCompany')}</option>
                        </select>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" name="withInvoice" id="withInvoice" checked={formData.withInvoice} onChange={handleInputChange} className="h-4 w-4 rounded text-primary-600" />
                        <label htmlFor="withInvoice" className="ml-2 block text-sm">{t('sales.invoice')}</label>
                    </div>
                     <div className="text-right font-bold text-lg">
                        {t('sales.total')}: R$ {totalValue.toFixed(2)}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isJustificationModalOpen} onClose={() => setIsJustificationModalOpen(false)} title={t('common.justification')}>
                 <div className="space-y-4">
                    <p>{t('common.justificationPrompt')}</p>
                    <div>
                        <textarea
                            value={justification}
                            onChange={(e) => {
                                setJustification(e.target.value);
                                if(justificationError) setJustificationError('');
                            }}
                            rows={4}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 ${justificationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder={t('common.justification')}
                        />
                        {justificationError && <p className="mt-1 text-sm text-red-600">{justificationError}</p>}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setIsJustificationModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleConfirmSaveWithJustification}>{t('common.confirm')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesPage;