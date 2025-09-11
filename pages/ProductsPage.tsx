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
    const [formData, setFormData] = useState({ name: '', price: '', type: 'Regular' as 'Regular' | 'Industrializado' });
    const [errors, setErrors] = useState({ name: '', price: '' });
    const toast = useToast();

    const regularProducts = products.filter(p => p.type === 'Regular');
    const industrializedProducts = products.filter(p => p.type === 'Industrializado');

    const validate = () => {
        const newErrors = { name: '', price: '' };
        let isValid = true;
        if (!formData.name.trim()) {
            newErrors.name = t('validation.required');
            isValid = false;
        }
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            newErrors.price = t('validation.invalidPrice');
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({ name: product.name, price: String(product.price), type: product.type });
        } else {
            setCurrentProduct(null);
            setFormData({ name: '', price: '', type: 'Regular' });
        }
        setErrors({ name: '', price: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    const handleSave = () => {
        if (!validate()) return;

        const productData = {
            name: formData.name,
            price: Number(formData.price),
            type: formData.type,
        };

        if (currentProduct) {
            // Update
            setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...productData } : p));
            toast.success(t('products.updateSuccess'));
        } else {
            // Create
            const newProduct = {
                id: Date.now(),
                ...productData,
            };
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExportCSV = (data: Product[], filename: string) => {
        if (!data.length) return;
        const headers = ['id', 'name', 'price', 'type'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.id,
                `"${item.name.replace(/"/g, '""')}"`,
                item.price,
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
                            <th scope="col" className="px-6 py-3">{t('products.productName')}</th>
                            <th scope="col" className="px-6 py-3">{t('products.price')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('products.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map(product => (
                            <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">R$ {product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="secondary" size="sm" onClick={() => handleOpenModal(product)}>{t('common.edit')}</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>{t('common.delete')}</Button>
                                </td>
                            </tr>
                        ))}
                         {productList.length === 0 && (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('products.productName')}</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                               className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}`} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('products.price')}</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange}
                               className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}`} />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('products.type')}</label>
                        <select name="type" id="type" value={formData.type} onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500">
                            <option value="Regular">{t('products.typeRegular')}</option>
                            <option value="Industrializado">{t('products.typeIndustrialized')}</option>
                        </select>
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