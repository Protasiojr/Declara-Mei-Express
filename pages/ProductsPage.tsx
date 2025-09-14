

import React, { useState, useMemo } from 'react';
// FIX: Import StockMovementType to resolve type error.
import { Product, Service, StockMovement, User, StockMovementType } from '../types';
import { MOCK_SERVICES } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';

// FIX: Accept props for state management
interface ProductsPageProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    stockMovements: StockMovement[];
    setStockMovements: React.Dispatch<React.SetStateAction<StockMovement[]>>;
    user: User | null;
}


const ProductsPage: React.FC<ProductsPageProps> = ({ products, setProducts, stockMovements, setStockMovements, user }) => {
    const { t } = useTranslation();
    const toast = useToast();
    // const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
    
    // Modal state for both products and services
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'product' | 'service'>('product');
    const [currentItemId, setCurrentItemId] = useState<number | null>(null);
    
    // FIX: Add state for the new Stock Adjustment Modal
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
    const [adjustmentData, setAdjustmentData] = useState({
        // FIX: Use imported StockMovementType
        movementType: 'Entrada' as StockMovementType,
        quantity: '',
        reason: '',
    });
    
    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [productForHistory, setProductForHistory] = useState<Product | null>(null);


    const initialProductForm = {
        name: '', price: '', type: 'Regular' as 'Regular' | 'Industrializado', sku: '',
        category: '', description: '', unitOfMeasure: 'un', costPrice: '', minStock: '', currentStock: ''
    };
    const initialServiceForm = { name: '', price: '' };

    const [productFormData, setProductFormData] = useState(initialProductForm);
    const [serviceFormData, setServiceFormData] = useState(initialServiceForm);
    const [errors, setErrors] = useState<any>({});
    
    const stockAfterAdjustment = useMemo(() => {
        if (!productToAdjust || adjustmentData.quantity === '') return productToAdjust?.currentStock ?? 0;
        const quantityChange = Number(adjustmentData.quantity);
        if (isNaN(quantityChange)) return productToAdjust.currentStock;
        
        switch (adjustmentData.movementType) {
            case 'Entrada':
                return productToAdjust.currentStock + quantityChange;
            case 'Perda':
                return productToAdjust.currentStock - quantityChange;
            case 'Ajuste':
                return quantityChange; // Sets the new quantity directly
            default:
                return productToAdjust.currentStock;
        }
    }, [productToAdjust, adjustmentData.quantity, adjustmentData.movementType]);


    const validate = () => {
        const newErrors: any = {};
        let isValid = true;
        if (modalType === 'product') {
            if (!productFormData.name.trim()) { newErrors.name = t('validation.required'); isValid = false; }
            if (!productFormData.sku.trim()) { newErrors.sku = t('validation.required'); isValid = false; }
            const priceNum = Number(productFormData.price);
            if (!productFormData.price || isNaN(priceNum) || priceNum <= 0) { newErrors.price = t('validation.invalidPrice'); isValid = false; }
            const costPriceNum = Number(productFormData.costPrice);
            if (!productFormData.costPrice || isNaN(costPriceNum) || costPriceNum <= 0) { newErrors.costPrice = t('validation.invalidPrice'); isValid = false; }
            const currentStockNum = Number(productFormData.currentStock);
            if (productFormData.currentStock === '' || isNaN(currentStockNum) || currentStockNum < 0) { newErrors.currentStock = t('validation.invalidStock'); isValid = false; }
        } else { // service
            if (!serviceFormData.name.trim()) { newErrors.name = t('validation.required'); isValid = false; }
            const priceNum = Number(serviceFormData.price);
            if (!serviceFormData.price || isNaN(priceNum) || priceNum <= 0) { newErrors.price = t('validation.invalidPrice'); isValid = false; }
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleOpenModal = (item: Product | Service | null, type: 'product' | 'service') => {
        setModalType(type);
        setErrors({});
        if (item) {
            setCurrentItemId(item.id);
            if (type === 'product' && 'sku' in item) {
                setProductFormData({
                    ...item,
                    price: String(item.price),
                    costPrice: String(item.costPrice),
                    minStock: String(item.minStock),
                    currentStock: String(item.currentStock)
                });
            } else if (type === 'service' && !('sku' in item)) {
                setServiceFormData({ name: item.name, price: String(item.price) });
            }
        } else {
            setCurrentItemId(null);
            setProductFormData(initialProductForm);
            setServiceFormData(initialServiceForm);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItemId(null);
    };

    const handleSave = () => {
        if (!validate()) return;

        if (modalType === 'product') {
            const productData = {
                name: productFormData.name,
                price: Number(productFormData.price),
                type: productFormData.type,
                sku: productFormData.sku,
                category: productFormData.category,
                description: productFormData.description,
                unitOfMeasure: productFormData.unitOfMeasure,
                costPrice: Number(productFormData.costPrice),
                minStock: Number(productFormData.minStock),
                currentStock: Number(productFormData.currentStock),
            };
            if (currentItemId) {
                setProducts(products.map(p => p.id === currentItemId ? { ...p, ...productData } : p));
                toast.success(t('products.updateSuccess'));
            } else {
                setProducts([...products, { id: Date.now(), ...productData }]);
                toast.success(t('products.addSuccess'));
            }
        } else { // service
             const serviceData = { name: serviceFormData.name, price: Number(serviceFormData.price) };
            if (currentItemId) {
                setServices(services.map(s => s.id === currentItemId ? { ...s, ...serviceData } : s));
                toast.success(t('services.updateSuccess'));
            } else {
                setServices([...services, { id: Date.now(), ...serviceData }]);
                toast.success(t('services.addSuccess'));
            }
        }
        handleCloseModal();
    };
    
    const handleDelete = (id: number, type: 'product' | 'service') => {
        toast.confirm(t(type === 'product' ? 'products.deleteConfirm' : 'services.deleteConfirm'), () => {
            if (type === 'product') {
                setProducts(products.filter(p => p.id !== id));
            } else {
                setServices(services.filter(s => s.id !== id));
            }
            toast.success(t(type === 'product' ? 'products.deleteSuccess' : 'services.deleteSuccess'));
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if(modalType === 'product') {
            setProductFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setServiceFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // Handlers for the Stock Adjustment modal
    const handleOpenAdjustmentModal = (product: Product) => {
        setProductToAdjust(product);
        setAdjustmentData({ movementType: 'Entrada', quantity: '', reason: '' });
        setIsAdjustmentModalOpen(true);
    };

    const handleAdjustmentDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAdjustmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAdjustment = () => {
        if (!productToAdjust || !user) return;
        const quantity = Number(adjustmentData.quantity);
        if (isNaN(quantity) || adjustmentData.quantity === '' || quantity < 0) {
            toast.error(t('validation.invalidStock'));
            return;
        }
        if (!adjustmentData.reason.trim()) {
            toast.error(t('validation.requiredDescription'));
            return;
        }

        const newStock = stockAfterAdjustment;
        
        const newMovement: StockMovement = {
            id: Date.now(),
            productId: productToAdjust.id,
            productName: productToAdjust.name,
            type: adjustmentData.movementType,
            quantity: adjustmentData.movementType === 'Perda' ? -quantity : quantity,
            reason: adjustmentData.reason,
            date: new Date().toISOString(),
            operatorName: user.name,
        };
        
        setStockMovements(prev => [newMovement, ...prev]);

        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productToAdjust.id ? { ...p, currentStock: newStock } : p
            )
        );
        toast.success(t('products.stockAdjustSuccess'));
        setIsAdjustmentModalOpen(false);
    };

    const handleOpenHistoryModal = (product: Product) => {
        setProductForHistory(product);
        setIsHistoryModalOpen(true);
    };

    const TabButton: React.FC<{tabId: 'products' | 'services', title: string}> = ({tabId, title}) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tabId ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
            {title}
        </button>
    );
    
    const getMovementTypeClass = (type: StockMovementType) => {
        switch (type) {
            case 'Entrada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Perda': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Ajuste': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.products')}</h1>
                 <Button onClick={() => handleOpenModal(null, activeTab === 'products' ? 'product' : 'service')}>{t('products.addNew')}</Button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tabId="products" title={t('products.title')} />
                    <TabButton tabId="services" title={t('services.serviceRegistry')} />
                </nav>
            </div>

            {activeTab === 'products' ? (
                 <Card title={t('products.title')}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">{t('products.sku')}</th>
                                    <th className="px-6 py-3">{t('products.productName')}</th>
                                    <th className="px-6 py-3">{t('products.price')}</th>
                                    <th className="px-6 py-3">{t('products.currentStock')}</th>
                                    <th className="px-6 py-3 text-right">{t('products.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4">{product.sku}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                        <td className="px-6 py-4">R$ {product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span>{product.currentStock}</span>
                                                {product.currentStock <= product.minStock && (
                                                    <span className="w-3 h-3 bg-red-500 rounded-full" title={t('products.lowStockWarning')}></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenHistoryModal(product)}>{t('products.history')}</Button>
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenAdjustmentModal(product)}>{t('products.adjustStock')}</Button>
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenModal(product, 'product')}>{t('common.edit')}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(product.id, 'product')}>{t('common.delete')}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card title={t('services.serviceRegistry')}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">{t('services.serviceName')}</th>
                                    <th className="px-6 py-3">{t('services.price')}</th>
                                    <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <tr key={service.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                                        <td className="px-6 py-4">R$ {service.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenModal(service, 'service')}>{t('common.edit')}</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(service.id, 'service')}>{t('common.delete')}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItemId ? t(modalType === 'product' ? 'products.editProduct' : 'services.editService') : t(modalType === 'product' ? 'products.addProduct' : 'services.addService')}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    {modalType === 'product' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium">{t('products.productName')}</label>
                                <input type="text" name="name" value={productFormData.name} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.sku')}</label>
                                <input type="text" name="sku" value={productFormData.sku} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.category')}</label>
                                <input type="text" name="category" value={productFormData.category} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium">{t('products.description')}</label>
                                <textarea name="description" value={productFormData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.costPrice')}</label>
                                <input type="number" name="costPrice" value={productFormData.costPrice} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.costPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.costPrice && <p className="text-sm text-red-500 mt-1">{errors.costPrice}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.price')}</label>
                                <input type="number" name="price" value={productFormData.price} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('products.currentStock')}</label>
                                <input type="number" name="currentStock" value={productFormData.currentStock} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.currentStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.currentStock && <p className="text-sm text-red-500 mt-1">{errors.currentStock}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.minStock')}</label>
                                <input type="number" name="minStock" value={productFormData.minStock} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.unitOfMeasure')}</label>
                                <input type="text" name="unitOfMeasure" value={productFormData.unitOfMeasure} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('products.type')}</label>
                                <select name="type" value={productFormData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <option value="Regular">{t('products.typeRegular')}</option>
                                    <option value="Industrializado">{t('products.typeIndustrialized')}</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium">{t('services.serviceName')}</label>
                                <input type="text" name="name" value={serviceFormData.name} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('services.price')}</label>
                                <input type="number" name="price" value={serviceFormData.price} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
            
            {productToAdjust && (
                <Modal isOpen={isAdjustmentModalOpen} onClose={() => setIsAdjustmentModalOpen(false)} title={`${t('products.stockAdjustmentFor')} "${productToAdjust.name}"`}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('products.movementType')}</label>
                            <select name="movementType" value={adjustmentData.movementType} onChange={handleAdjustmentDataChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <option value="Entrada">{t('products.stockIn')}</option>
                                <option value="Ajuste">{t('products.adjustment')}</option>
                                <option value="Perda">{t('products.loss')}</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">
                                {adjustmentData.movementType === 'Ajuste' ? t('products.newQuantity') : t('sales.quantity')}
                            </label>
                            <input type="number" name="quantity" value={adjustmentData.quantity} onChange={handleAdjustmentDataChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.adjustmentReason')}</label>
                            <textarea name="reason" value={adjustmentData.reason} onChange={handleAdjustmentDataChange} rows={3} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700" />
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('products.currentStockIs')}:</span>
                                <span>{productToAdjust.currentStock}</span>
                            </div>
                             <div className="flex justify-between font-bold">
                                <span className="text-gray-800 dark:text-gray-200">{t('products.stockAfterIs')}:</span>
                                <span className="text-primary-600 dark:text-primary-400">{stockAfterAdjustment}</span>
                            </div>
                        </div>
                         <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="secondary" onClick={() => setIsAdjustmentModalOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleSaveAdjustment}>{t('common.confirm')}</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {productForHistory && (
                 <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`${t('products.movementHistoryFor')} "${productForHistory.name}"`}>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">{t('products.date')}</th>
                                    <th className="px-4 py-2">{t('products.movementType')}</th>
                                    <th className="px-4 py-2">{t('sales.quantity')}</th>
                                    <th className="px-4 py-2">{t('products.reason')}</th>
                                    <th className="px-4 py-2">{t('products.user')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockMovements.filter(m => m.productId === productForHistory.id).map(movement => (
                                     <tr key={movement.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-2">{new Date(movement.date).toLocaleString()}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeClass(movement.type)}`}>
                                                {t(`products.${movement.type.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{movement.quantity}</td>
                                        <td className="px-4 py-2">{movement.reason}</td>
                                        <td className="px-4 py-2">{movement.operatorName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ProductsPage;