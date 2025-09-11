
import React, { useState } from 'react';
import { Client } from '../types';
import { MOCK_CLIENTS } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';

type ClientFormData = Omit<Client, 'id'>;

const ClientPage: React.FC = () => {
    const { t } = useTranslation();
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    
    const initialFormData: ClientFormData = { 
        clientType: 'Individual',
        fullName: '', 
        address: '', 
        phone: '', 
        cpf: '',
        companyName: '',
        tradeName: '',
        cnpj: '',
        stateRegistration: ''
    };
    const [formData, setFormData] = useState<ClientFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<ClientFormData>>({});

    const [justification, setJustification] = useState('');
    const [justificationError, setJustificationError] = useState('');

    const validate = () => {
        const newErrors: Partial<ClientFormData> = {};
        if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
        if (!formData.address.trim()) newErrors.address = t('validation.required');
        if (!formData.phone.trim()) newErrors.phone = t('validation.required');

        if (formData.clientType === 'Individual') {
            if (!formData.cpf?.trim()) newErrors.cpf = t('validation.required');
        } else {
            if (!formData.companyName?.trim()) newErrors.companyName = t('validation.required');
            if (!formData.cnpj?.trim()) newErrors.cnpj = t('validation.required');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenModal = (client: Client | null = null) => {
        setErrors({});
        if (client) {
            setCurrentClient(client);
            setFormData({
                ...initialFormData, // Start with defaults for any missing fields
                ...client,
            });
        } else {
            setCurrentClient(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentClient(null);
    };

    const handleSave = () => {
        if (!validate()) return;
        
        const clientData: Client = {
            id: currentClient?.id || Date.now(),
            ...formData,
        };

        if (currentClient) {
            setClients(clients.map(c => c.id === currentClient.id ? clientData : c));
        } else {
            setClients([clientData, ...clients]);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (client: Client) => {
        setCurrentClient(client);
        setJustification('');
        setJustificationError('');
        setIsJustificationModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (!justification.trim()) {
            setJustificationError(t('common.justificationRequired'));
            return;
        }
        if (currentClient) {
            setClients(clients.filter(c => c.id !== currentClient.id));
        }
        setIsJustificationModalOpen(false);
        setCurrentClient(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleClientTypeChange = (type: 'Individual' | 'Company') => {
        setErrors({});
        setFormData(prev => ({...initialFormData, clientType: type, address: prev.address, phone: prev.phone}));
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.clients')}</h1>
            <Card title={t('clients.registry')}>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenModal(null)}>{t('clients.addNew')}</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('clients.nameOrCompany')}</th>
                                <th scope="col" className="px-6 py-3">{t('clients.clientType')}</th>
                                <th scope="col" className="px-6 py-3">{t('clients.document')}</th>
                                <th scope="col" className="px-6 py-3">{t('clients.phone')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {client.clientType === 'Company' ? client.companyName : client.fullName}
                                    </td>
                                    <td className="px-6 py-4">{client.clientType === 'Company' ? t('clients.company') : t('clients.individual')}</td>
                                    <td className="px-6 py-4">{client.clientType === 'Company' ? client.cnpj : client.cpf}</td>
                                    <td className="px-6 py-4">{client.phone}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(client)}>{t('common.edit')}</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(client)}>{t('common.delete')}</Button>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t('clients.noClients')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClient ? t('clients.editClient') : t('clients.addClient')}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('clients.clientType')}</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input type="radio" name="clientType" value="Individual" checked={formData.clientType === 'Individual'} onChange={() => handleClientTypeChange('Individual')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-sm">{t('clients.individual')}</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="clientType" value="Company" checked={formData.clientType === 'Company'} onChange={() => handleClientTypeChange('Company')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-sm">{t('clients.company')}</span>
                            </label>
                        </div>
                    </div>

                    {formData.clientType === 'Individual' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium">{t('clients.fullName')}</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('clients.cpf')}</label>
                                <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium">{t('clients.companyName')}</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.companyName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.companyName && <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('clients.tradeName')}</label>
                                <input type="text" name="tradeName" value={formData.tradeName} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('clients.cnpj')}</label>
                                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.cnpj ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.cnpj && <p className="text-sm text-red-500 mt-1">{errors.cnpj}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('clients.stateRegistration')}</label>
                                <input type="text" name="stateRegistration" value={formData.stateRegistration} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('clients.contactPerson')}</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium">{t('clients.address')}</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('clients.phone')}</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isJustificationModalOpen} onClose={() => setIsJustificationModalOpen(false)} title={t('clients.deleteConfirmTitle')}>
                 <div className="space-y-4">
                    <p>{t('clients.deleteConfirmPrompt')}</p>
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
                        <Button variant="danger" onClick={handleConfirmDelete}>{t('common.delete')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClientPage;