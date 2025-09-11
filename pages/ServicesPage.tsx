import React, { useState } from 'react';
import { Service } from '../types';
import { MOCK_SERVICES } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';

const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '' });
    const [errors, setErrors] = useState({ name: '', price: '' });

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

    const handleOpenModal = (service: Service | null = null) => {
        if (service) {
            setCurrentService(service);
            setFormData({ name: service.name, price: String(service.price) });
        } else {
            setCurrentService(null);
            setFormData({ name: '', price: '' });
        }
        setErrors({ name: '', price: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentService(null);
    };
    
    const handleSave = () => {
        if (!validate()) return;

        const serviceData = {
            name: formData.name,
            price: Number(formData.price),
        };

        if (currentService) {
            // Update
            setServices(services.map(s => s.id === currentService.id ? { ...s, ...serviceData } : s));
        } else {
            // Create
            const newService = {
                id: Date.now(),
                ...serviceData,
            };
            setServices([...services, newService]);
        }
        handleCloseModal();
    };
    
    const handleDelete = (serviceId: number) => {
        if (window.confirm(t('services.deleteConfirm'))) {
            setServices(services.filter(s => s.id !== serviceId));
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.services')}</h1>
            <Card title={t('services.serviceRegistry')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('services.serviceName')}</th>
                                <th scope="col" className="px-6 py-3">{t('services.price')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('services.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4">R$ {service.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(service)}>{t('common.edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>{t('common.delete')}</Button>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t('services.noServices')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleOpenModal(null)}>{t('services.addNew')}</Button>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentService ? t('services.editService') : t('services.addService')}
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.serviceName')}</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                               className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}`} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('services.price')}</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange}
                               className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}`} />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
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

export default ServicesPage;