import React, { useState } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';

const ProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    
    const initialFormData = {
        name: '', price: '', type: 'Regular' as 'Regular' | 'Industrializado', sku: '',
        category: '', description: '', unitOfMeasure: 'un', costPrice: '', minStock: '', currentStock: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({ name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' });
    const toast = useToast();

    const regularProducts = products.filter(p => p.type === 'Regular');
    const industrializedProducts = products.filter(p => p.type === 'Industrializado');

    const validate = () => {
        const newErrors = { name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' };
        let isValid = true;
        if (!formData.name.trim()) { newErrors.name = t('validation.required'); isValid = false; }
        if (!formData.sku.trim()) { newErrors.sku = t('validation.required'); isValid = false; }
        if (!formData.category.trim()) { newErrors.category = t('validation.required'); isValid = false; }
        
        const priceNum = Number(formData.price);
        if (!formData.price || isNaN(priceNum) || priceNum <= 0) { newErrors.price = t('validation.invalidPrice'); isValid = false; }

        const costPriceNum = Number(formData.costPrice);
        if (!formData.costPrice || isNaN(costPriceNum) || costPriceNum <= 0) { newErrors.costPrice = t('validation.invalidPrice'); isValid = false; }
        
        const minStockNum = Number(formData.minStock);
        if (formData.minStock === '' || isNaN(minStockNum) || minStockNum < 0) { newErrors.minStock = t('validation.invalidStock'); isValid = false; }

        const currentStockNum = Number(formData.currentStock);
        if (formData.currentStock === '' || isNaN(currentStockNum) || currentStockNum < 0) { newErrors.currentStock = t('validation.invalidStock'); isValid = false; }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                price: String(product.price),
                type: product.type,
                sku: product.sku,
                category: product.category,
                description: product.description,
                unitOfMeasure: product.unitOfMeasure,
                costPrice: String(product.costPrice),
                minStock: String(product.minStock),
                currentStock: String(product.currentStock)
            });
        } else {
            setCurrentProduct(null);
            setFormData(initialFormData);
        }
        setErrors({ name: '', price: '', sku: '', category: '', costPrice: '', minStock: '', currentStock: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleSave = () => {
        if (!validate()) return;

        const productData: Omit<Product, 'id'> = {
            name: formData.name,
            price: Number(formData.price),
            type: formData.type,
            sku: formData.sku,
            category: formData.category,
            description: formData.description,
            unitOfMeasure: formData.unitOfMeasure,
            costPrice: Number(formData.costPrice),
            minStock: Number(formData.minStock),
            currentStock: Number(formData.currentStock),
        };

        if (currentProduct) {
            setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...productData } : p));
            toast.success(t('products.updateSuccess'));
        } else {
            const newProduct = { id: Date.now(), ...productData };
            setProducts([...products, newProduct]);
            toast.success(t('products.addSuccess'));
        }
        handleCloseModal();
    };
    
    const handleDelete = (productId: number) => {
        toast.confirm(t('products.deleteConfirm'), () => {
            setProducts(products.filter(p => p.id !== productId));
            toast.success(t('products.deleteSuccess'));
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExportCSV = (data: Product[], filename: string) => {
        if (!data.length) return;
        const headers = ['id', 'sku', 'name', 'category', 'description', 'unitOfMeasure', 'costPrice', 'price', 'minStock', 'currentStock', 'type'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.id,
                `"${item.sku.replace(/"/g, '""')}"`,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${item.category.replace(/"/g, '""')}"`,
                `"${item.description.replace(/"/g, '""')}"`,
                item.unitOfMeasure,
                item.costPrice,
                item.price,
                item.minStock,
                item.currentStock,
                item.type
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderProductTable = (productList: Product[], title: string, productType: 'Regular' | 'Industrializado') => (
        <Card title={title}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('products.sku')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.productName')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.category')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.costPrice')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.price')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.currentStock')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('products.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map(product => (
                            <tr key={product.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 ${product.currentStock <= product.minStock ? 'bg-red-100 dark:bg-red-900/30' : ''}`}>
                                <td className="px-6 py-4">{product.sku}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">R$ {product.costPrice.toFixed(2)}</td>
                                <td className="px-6 py-4">R$ {product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">{product.currentStock}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="secondary" size="sm" onClick={() => handleOpenModal(product)}>{t('common.edit')}</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>{t('common.delete')}</Button>
                                </td>
                            </tr>
                        ))}
                         {productList.length === 0 && (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    {t('products.noProducts')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => handleExportCSV(productList, `products_${productType.toLowerCase()}.csv`)}>{t('common.exportCsv')}</Button>
                <Button onClick={() => handleOpenModal(null)}>{t('products.addNew')}</Button>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.products')}</h1>
            {renderProductTable(regularProducts, t('products.resaleProducts'), 'Regular')}
            {renderProductTable(industrializedProducts, t('products.industrializedProducts'), 'Industrializado')}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentProduct ? t('products.editProduct') : t('products.addProduct')}
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">{t('products.productName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.sku')}</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.category')}</label>
                            <input type="text" name="category" value={formData.category} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">{t('products.description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.costPrice')}</label>
                            <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.costPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.costPrice && <p className="text-sm text-red-500 mt-1">{errors.costPrice}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.price')}</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.currentStock')}</label>
                            <input type="number" name="currentStock" value={formData.currentStock} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.currentStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.currentStock && <p className="text-sm text-red-500 mt-1">{errors.currentStock}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.minStock')}</label>
                            <input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.minStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.minStock && <p className="text-sm text-red-500 mt-1">{errors.minStock}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('products.unitOfMeasure')}</label>
                            <input type="text" name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium">{t('products.type')}</label>
                             <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <option value="Regular">{t('products.typeRegular')}</option>
                                <option value="Industrializado">{t('products.typeIndustrialized')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductsPage;