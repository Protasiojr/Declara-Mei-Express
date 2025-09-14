

import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Sale, Product, Service, Client, Address } from '../types';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_CLIENTS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

type SaleFormData = {
  itemId: string;
  quantity: string;
  date: string;
  withInvoice: boolean;
  client: Client | null;
};

type ClientFormData = Omit<Client, 'id'>;

const SalesPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState<Sale | null>(null);
    
    const initialFormData: SaleFormData = {
        itemId: '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0],
        withInvoice: false,
        client: null,
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

    // Client Search State
    const [clientSearch, setClientSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    
    // New Client Modal State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const initialClientFormData: ClientFormData = { 
        clientType: 'Individual', fullName: '', phone: '', cpf: '',
        companyName: '', tradeName: '', cnpj: '', stateRegistration: '',
        address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }
    };
    const [clientFormData, setClientFormData] = useState<ClientFormData>(initialClientFormData);
    const [clientErrors, setClientErrors] = useState<Partial<Record<keyof Omit<ClientFormData, 'address'> | keyof Address, string>>>({});
    
    // Item Search State
    const [itemSearch, setItemSearch] = useState('');
    const [itemSearchResults, setItemSearchResults] = useState<({ value: string; label: string; price: number })[]>([]);

    // New Item Modal State
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [newItemType, setNewItemType] = useState<'product' | 'service'>('product');
    const initialNewItemForm = { name: '', price: '', type: 'Regular' as 'Regular' | 'Industrializado', sku: '', category: '', description: '', unitOfMeasure: 'un', costPrice: '', minStock: '', currentStock: '' };
    const [newItemFormData, setNewItemFormData] = useState(initialNewItemForm);
    const [newItemErrors, setNewItemErrors] = useState({ name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' });

    const findItemByValue = (value: string): Product | Service | undefined => {
        const [type, idStr] = value.split('-');
        const id = parseInt(idStr, 10);
        if (type === 'product') return products.find(p => p.id === id);
        if (type === 'service') return services.find(s => s.id === id);
        return undefined;
    };

    useEffect(() => {
        if (clientSearch.trim() === '') {
            setSearchResults([]);
            return;
        }
        const lowercasedQuery = clientSearch.toLowerCase();
        const results = clients.filter(c =>
            c.fullName.toLowerCase().includes(lowercasedQuery) ||
            (c.companyName && c.companyName.toLowerCase().includes(lowercasedQuery)) ||
            (c.cpf && c.cpf.includes(lowercasedQuery)) ||
            (c.cnpj && c.cnpj.includes(lowercasedQuery))
        );
        setSearchResults(results);
    }, [clientSearch, clients]);

    const availableItems = useMemo(() => {
        const items: ({ value: string; label: string; price: number })[] = [];
        products.forEach(p => items.push({ value: `product-${p.id}`, label: p.name, price: p.price }));
        services.forEach(s => items.push({ value: `service-${s.id}`, label: s.name, price: s.price }));
        return items;
    }, [products, services]);

     useEffect(() => {
        if (itemSearch.trim() === '') {
            setItemSearchResults([]);
            return;
        }
        // Avoid showing search results if an item is already perfectly matched and selected
        const selectedItem = findItemByValue(formData.itemId);
        if (selectedItem && selectedItem.name.toLowerCase() === itemSearch.toLowerCase()) {
            setItemSearchResults([]);
            return;
        }

        const lowercasedQuery = itemSearch.toLowerCase();
        const results = availableItems.filter(item =>
            item.label.toLowerCase().includes(lowercasedQuery)
        );
        setItemSearchResults(results);
    }, [itemSearch, availableItems, formData.itemId]);

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
        setClientSearch('');
        if (sale) {
            setCurrentSale(sale);
            const itemType = 'type' in sale.item ? 'product' : 'service';
            setFormData({
                itemId: `${itemType}-${sale.item.id}`,
                quantity: String(sale.quantity),
                date: sale.date,
                withInvoice: sale.withInvoice,
                client: sale.client,
            });
            setItemSearch(sale.item.name);
        } else {
            setCurrentSale(null);
            setFormData(initialFormData);
            setItemSearch('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = () => {
        if (!validate()) return;
        if (currentSale) {
            setJustification('');
            setJustificationError('');
            setIsJustificationModalOpen(true);
        } else {
            const item = findItemByValue(formData.itemId);
            if (!item) return;

            if ('sku' in item) {
                setProducts(prev => prev.map(p => p.id === item.id ? { ...p, currentStock: p.currentStock - Number(formData.quantity) } : p));
            }

            const newSale: Sale = {
                id: Date.now(),
                item,
                quantity: Number(formData.quantity),
                total: item.price * Number(formData.quantity),
                date: formData.date,
                withInvoice: formData.withInvoice,
                client: formData.client
            };
            setSales(prev => [newSale, ...prev]);
            toast.success(t('sales.addSuccess'));
            handleCloseModal();
        }
    };
    
    const handleConfirmSaveWithJustification = () => {
        if(!justification.trim()){
            setJustificationError(t('common.justificationRequired'));
            return;
        }

        if(currentSale) {
            const newItem = findItemByValue(formData.itemId);
            if (!newItem) return;

            // FIX: Define newQuantity from form data before it is used. This resolves errors on lines that use newQuantity.
            const newQuantity = Number(formData.quantity);

            // Stock adjustment logic
            const originalSale = sales.find(s => s.id === currentSale.id);
            if(originalSale) {
                const isOriginalItemProduct = 'sku' in originalSale.item;
                const isNewItemProduct = 'sku' in newItem;
                
                setProducts(prevProducts => {
                    let tempProducts = [...prevProducts];
                    // Case 1: Item is the same product, quantity might have changed
                    if (isOriginalItemProduct && isNewItemProduct && originalSale.item.id === newItem.id) {
                        const quantityDiff = newQuantity - originalSale.quantity;
                        tempProducts = tempProducts.map(p => p.id === newItem.id ? { ...p, currentStock: p.currentStock - quantityDiff } : p);
                    } else {
                    // Case 2: Item changed
                        // Restore stock for the original item if it was a product
                        if (isOriginalItemProduct) {
                             tempProducts = tempProducts.map(p => p.id === (originalSale.item as Product).id ? { ...p, currentStock: p.currentStock + originalSale.quantity } : p);
                        }
                        // Decrement stock for the new item if it is a product
                        if (isNewItemProduct) {
                            tempProducts = tempProducts.map(p => p.id === newItem.id ? { ...p, currentStock: p.currentStock - newQuantity } : p);
                        }
                    }
                    return tempProducts;
                });
            }

            const updatedSale: Sale = {
                id: currentSale.id,
                item: newItem,
                quantity: newQuantity,
                total: newItem.price * newQuantity,
                date: formData.date,
                withInvoice: formData.withInvoice,
                client: formData.client
            };
            setSales(sales.map(s => s.id === currentSale.id ? updatedSale : s));
            toast.success(t('sales.updateSuccess'));
        }
        
        setIsJustificationModalOpen(false);
        handleCloseModal();
    };

    const handleDelete = (saleId: number) => {
        toast.confirm(t('sales.deleteConfirm'), () => {
            const saleToDelete = sales.find(s => s.id === saleId);
            if (saleToDelete && 'sku' in saleToDelete.item) {
                setProducts(prev => prev.map(p => p.id === saleToDelete.item.id ? { ...p, currentStock: p.currentStock + saleToDelete.quantity } : p));
            }
            setSales(sales.filter(s => s.id !== saleId));
            toast.success(t('sales.deleteSuccess'));
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const clearFilters = () => setFilters({ startDate: '', endDate: '', itemType: 'all' });
    
    const totalValue = useMemo(() => {
        const item = findItemByValue(formData.itemId);
        const quantity = Number(formData.quantity);
        if (item && !isNaN(quantity) && quantity > 0) return item.price * quantity;
        return 0;
    }, [formData.itemId, formData.quantity, products, services]);

    const handleSelectClient = (client: Client) => {
        setFormData(prev => ({...prev, client}));
        setClientSearch('');
        setSearchResults([]);
    };
    
    const handleClearClient = () => {
        setFormData(prev => ({...prev, client: null}));
    };

    // Client Modal Functions
    const validateClient = () => {
        const newErrors: Partial<Record<keyof Omit<ClientFormData, 'address'> | keyof Address, string>> = {};
        if (!clientFormData.fullName.trim()) newErrors.fullName = t('validation.required');
        if (!clientFormData.phone.trim()) newErrors.phone = t('validation.required');
        if (clientFormData.clientType === 'Individual' && !clientFormData.cpf?.trim()) newErrors.cpf = t('validation.required');
        if (clientFormData.clientType === 'Company') {
            if (!clientFormData.companyName?.trim()) newErrors.companyName = t('validation.required');
            if (!clientFormData.cnpj?.trim()) newErrors.cnpj = t('validation.required');
        }
        if (!clientFormData.address.street.trim()) newErrors.street = t('validation.required');
        if (!clientFormData.address.number.trim()) newErrors.number = t('validation.required');
        if (!clientFormData.address.neighborhood.trim()) newErrors.neighborhood = t('validation.required');
        if (!clientFormData.address.city.trim()) newErrors.city = t('validation.required');
        if (!clientFormData.address.state.trim()) newErrors.state = t('validation.required');
        if (!clientFormData.address.zipCode.trim()) newErrors.zipCode = t('validation.required');

        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSaveNewClient = () => {
        if (!validateClient()) return;
        const newClient: Client = {
            id: Date.now(),
            ...clientFormData
        };
        setClients(prev => [newClient, ...prev]);
        handleSelectClient(newClient); // Auto-select the new client
        setIsClientModalOpen(false); // Close client modal
    };
    
    const handleClientTypeChange = (type: 'Individual' | 'Company') => {
        setClientErrors({});
        setClientFormData(prev => ({...initialClientFormData, clientType: type, phone: prev.phone}));
    }

    const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const addressKeys: (keyof Address)[] = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode'];
        if (addressKeys.includes(name as keyof Address)) {
            setClientFormData(prev => ({...prev, address: {...prev.address, [name]: value }}));
        } else {
            setClientFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const getClientDisplayName = (client: Client | null) => {
        if (!client) return t('sales.clientTypeConsumer');
        return client.clientType === 'Company' ? client.companyName : client.fullName;
    }
    
    // Item search and new item functions
    const handleItemSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setItemSearch(newSearchText);

        const currentItem = findItemByValue(formData.itemId);
        if (currentItem && currentItem.name !== newSearchText) {
            setFormData(prev => ({ ...prev, itemId: '' }));
        }
    };
    
    const handleSelectItem = (item: { value: string; label: string }) => {
        setFormData(prev => ({ ...prev, itemId: item.value }));
        setItemSearch(item.label);
        setItemSearchResults([]);
    };
    
    const handleOpenNewItemModal = (type: 'product' | 'service') => {
        setNewItemType(type);
        setNewItemFormData(initialNewItemForm);
        setNewItemErrors({ name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' });
        setIsNewItemModalOpen(true);
    };
    
    const handleSaveNewItem = () => {
        const { name, price, sku, category, costPrice, minStock, currentStock } = newItemFormData;
        const priceNum = Number(price);
        const costPriceNum = Number(costPrice);
        const minStockNum = Number(minStock);
        const currentStockNum = Number(currentStock);

        const newErrors = { name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' };
        let isValid = true;

        if (!name.trim()) { newErrors.name = t('validation.required'); isValid = false; }
        if (!price || isNaN(priceNum) || priceNum <= 0) { newErrors.price = t('validation.invalidPrice'); isValid = false; }
        
        if (newItemType === 'product') {
            if (!sku.trim()) { newErrors.sku = t('validation.required'); isValid = false; }
            if (!category.trim()) { newErrors.category = t('validation.required'); isValid = false; }
            if (!costPrice || isNaN(costPriceNum) || costPriceNum <= 0) { newErrors.costPrice = t('validation.invalidPrice'); isValid = false; }
            if (!minStock || isNaN(minStockNum) || minStockNum < 0) { newErrors.minStock = t('validation.invalidStock'); isValid = false; }
            if (!currentStock || isNaN(currentStockNum) || currentStockNum < 0) { newErrors.currentStock = t('validation.invalidStock'); isValid = false; }
        }

        setNewItemErrors(newErrors);
        if (!isValid) return;

        if (newItemType === 'product') {
            const newProduct: Product = { 
                id: Date.now(), 
                sku, 
                name, 
                price: priceNum, 
                type: newItemFormData.type,
                category,
                description: newItemFormData.description,
                unitOfMeasure: newItemFormData.unitOfMeasure,
                costPrice: costPriceNum,
                minStock: minStockNum,
                currentStock: currentStockNum
            };
            setProducts(prev => [newProduct, ...prev]);
            handleSelectItem({ value: `product-${newProduct.id}`, label: newProduct.name });
        } else {
            const newService: Service = { id: Date.now(), name, price: priceNum };
            setServices(prev => [newService, ...prev]);
            handleSelectItem({ value: `service-${newService.id}`, label: newService.name });
        }
        setIsNewItemModalOpen(false);
    };
    
    const renderClientInput = (name: keyof Omit<ClientFormData, 'address'>, label: string) => (
         <div>
            <label className="block text-sm font-medium">{label}</label>
            <input type="text" name={name} value={clientFormData[name] || ''} onChange={handleClientInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${clientErrors[name as keyof typeof clientErrors] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            {clientErrors[name as keyof typeof clientErrors] && <p className="text-sm text-red-500 mt-1">{clientErrors[name as keyof typeof clientErrors]}</p>}
        </div>
    );
    
     const renderAddressInput = (name: keyof Address, label: string, colSpan: string = 'col-span-2') => (
        <div className={colSpan}>
            <label className="block text-sm font-medium">{label}</label>
            <input type="text" name={name} value={clientFormData.address[name] || ''} onChange={handleClientInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${clientErrors[name as keyof typeof clientErrors] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            {clientErrors[name as keyof typeof clientErrors] && <p className="text-sm text-red-500 mt-1">{clientErrors[name as keyof typeof clientErrors]}</p>}
        </div>
    );


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sales.title')}</h1>

            <Card title={t('sales.history')}>
                <div className="mb-4 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterStartDate')}</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterEndDate')}</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sales.filterItemType')}</label>
                            <select name="itemType" value={filters.itemType} onChange={handleFilterChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500">
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
                                    <th scope="col" className="px-6 py-3">{t('sales.clientLabel')}</th>
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
                                        <td className="px-6 py-4">{new Date(sale.date + 'T00:00').toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{getClientDisplayName(sale.client)}</td>
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
                    <div className="relative">
                        <label className="block text-sm font-medium">{t('sales.item')}</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                type="text"
                                value={itemSearch}
                                onChange={handleItemSearchChange}
                                placeholder={t('sales.searchItemPlaceholder')}
                                className={`block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.itemId && !formData.itemId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                            <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenNewItemModal('product')}>{t('sales.registerNewProduct')}</Button>
                        </div>
                        {errors.itemId && !formData.itemId && <p className="text-sm text-red-500 mt-1">{errors.itemId}</p>}
                        {itemSearchResults.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {itemSearchResults.map(item => (
                                    <li key={item.value} onClick={() => handleSelectItem(item)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        {item.label} (R$ {item.price.toFixed(2)})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.quantity')}</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.date')}</label>
                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium">{t('sales.clientLabel')}</label>
                         {formData.client ? (
                             <div className="flex items-center justify-between mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600">
                                 <span>{getClientDisplayName(formData.client)}</span>
                                 <button type="button" onClick={handleClearClient} className="text-red-500 hover:text-red-700">&times;</button>
                             </div>
                         ) : (
                             <>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        placeholder={t('sales.searchClientPlaceholder')}
                                        className="block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsClientModalOpen(true)}>{t('sales.registerNewClient')}</Button>
                                </div>
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        {searchResults.map(client => (
                                            <li key={client.id} onClick={() => handleSelectClient(client)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                {getClientDisplayName(client)} ({client.clientType === 'Individual' ? client.cpf : client.cnpj})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                         )}
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
                            onChange={(e) => { setJustification(e.target.value); if(justificationError) setJustificationError(''); }}
                            rows={4}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 ${justificationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
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
            
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={t('clients.addClient')}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('clients.clientType')}</label>
                        <div className="flex gap-4">
                            <label className="flex items-center"><input type="radio" name="clientType" checked={clientFormData.clientType === 'Individual'} onChange={() => handleClientTypeChange('Individual')} className="h-4 w-4 text-primary-600" /><span className="ml-2 text-sm">{t('clients.individual')}</span></label>
                            <label className="flex items-center"><input type="radio" name="clientType" checked={clientFormData.clientType === 'Company'} onChange={() => handleClientTypeChange('Company')} className="h-4 w-4 text-primary-600" /><span className="ml-2 text-sm">{t('clients.company')}</span></label>
                        </div>
                    </div>
                    {clientFormData.clientType === 'Individual' ? (
                        <>
                            {renderClientInput('fullName', t('clients.fullName'))}
                            {renderClientInput('cpf', t('clients.cpf'))}
                        </>
                    ) : (
                        <>
                            {renderClientInput('companyName', t('clients.companyName'))}
                            {renderClientInput('tradeName', t('clients.tradeName'))}
                            {renderClientInput('cnpj', t('clients.cnpj'))}
                            {renderClientInput('stateRegistration', t('clients.stateRegistration'))}
                            {renderClientInput('fullName', t('clients.contactPerson'))}
                        </>
                    )}
                    {renderClientInput('phone', t('clients.phone'))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('clients.address')}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                           {renderAddressInput('street', t('address.street'))}
                           {renderAddressInput('number', t('address.number'), 'col-span-1')}
                           {renderAddressInput('complement', t('address.complement'), 'col-span-1')}
                           {renderAddressInput('neighborhood', t('address.neighborhood'))}
                           {renderAddressInput('city', t('address.city'), 'col-span-1')}
                           {renderAddressInput('state', t('address.state'), 'col-span-1')}
                           {renderAddressInput('zipCode', t('address.zipCode'))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsClientModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveNewClient}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
            
            {/* New Item Modal */}
            <Modal isOpen={isNewItemModalOpen} onClose={() => setIsNewItemModalOpen(false)} title={t('sales.addNewItem')}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">{t('products.productName')}</label>
                            <input type="text" value={newItemFormData.name} onChange={(e) => setNewItemFormData(p => ({...p, name: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                            {newItemErrors.name && <p className="text-sm text-red-500 mt-1">{newItemErrors.name}</p>}
                        </div>
                         {newItemType === 'product' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.sku')}</label>
                                    <input type="text" value={newItemFormData.sku} onChange={(e) => setNewItemFormData(p => ({...p, sku: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.sku && <p className="text-sm text-red-500 mt-1">{newItemErrors.sku}</p>}
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">{t('products.category')}</label>
                                    <input type="text" value={newItemFormData.category} onChange={(e) => setNewItemFormData(p => ({...p, category: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.category && <p className="text-sm text-red-500 mt-1">{newItemErrors.category}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">{t('products.description')}</label>
                                    <textarea value={newItemFormData.description} onChange={(e) => setNewItemFormData(p => ({...p, description: e.target.value}))} rows={3} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.costPrice')}</label>
                                    <input type="number" value={newItemFormData.costPrice} onChange={(e) => setNewItemFormData(p => ({...p, costPrice: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.costPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.costPrice && <p className="text-sm text-red-500 mt-1">{newItemErrors.costPrice}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.price')}</label>
                                    <input type="number" value={newItemFormData.price} onChange={(e) => setNewItemFormData(p => ({...p, price: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.price && <p className="text-sm text-red-500 mt-1">{newItemErrors.price}</p>}
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">{t('products.currentStock')}</label>
                                    <input type="number" value={newItemFormData.currentStock} onChange={(e) => setNewItemFormData(p => ({...p, currentStock: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.currentStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.currentStock && <p className="text-sm text-red-500 mt-1">{newItemErrors.currentStock}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.minStock')}</label>
                                    <input type="number" value={newItemFormData.minStock} onChange={(e) => setNewItemFormData(p => ({...p, minStock: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.minStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                    {newItemErrors.minStock && <p className="text-sm text-red-500 mt-1">{newItemErrors.minStock}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.unitOfMeasure')}</label>
                                    <input type="text" value={newItemFormData.unitOfMeasure} onChange={(e) => setNewItemFormData(p => ({...p, unitOfMeasure: e.target.value}))} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('products.type')}</label>
                                    <select value={newItemFormData.type} onChange={(e) => setNewItemFormData(p => ({...p, type: e.target.value as 'Regular' | 'Industrializado'}))} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <option value="Regular">{t('products.typeRegular')}</option>
                                        <option value="Industrializado">{t('products.typeIndustrialized')}</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {newItemType === 'service' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium">{t('sales.itemPrice')}</label>
                                <input type="number" value={newItemFormData.price} onChange={(e) => setNewItemFormData(p => ({...p, price: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${newItemErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                {newItemErrors.price && <p className="text-sm text-red-500 mt-1">{newItemErrors.price}</p>}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsNewItemModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveNewItem}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SalesPage;