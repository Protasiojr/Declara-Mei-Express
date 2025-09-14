

import React, { useState } from 'react';
import { Client, Address } from '../types';
import { MOCK_CLIENTS } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

type ClientFormData = Omit<Client, 'id'>;
type FormErrors = Partial<Record<keyof Omit<ClientFormData, 'address'> | keyof Address, string>>;


const formatAddress = (address: Address) => {
    if (!address || !address.street) return '';
    const { street, number, complement, neighborhood, city, state, zipCode } = address;
    return `${street}, ${number}${complement ? ` - ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipCode}`;
};


const ClientPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    
    const initialFormData: ClientFormData = { 
        clientType: 'Individual',
        fullName: '', 
        phone: '', 
        cpf: '',
        companyName: '',
        tradeName: '',
        cnpj: '',
        stateRegistration: '',
        address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }
    };
    const [formData, setFormData] = useState<ClientFormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});

    const [justification, setJustification] = useState('');
    const [justificationError, setJustificationError] = useState('');

    const validate = () => {
        const newErrors: FormErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
        if (!formData.phone.trim()) newErrors.phone = t('validation.required');

        if (formData.clientType === 'Individual') {
            if (!formData.cpf?.trim()) newErrors.cpf = t('validation.required');
        } else {
            if (!formData.companyName?.trim()) newErrors.companyName = t('validation.required');
            if (!formData.cnpj?.trim()) newErrors.cnpj = t('validation.required');
        }

        if (!formData.address.street.trim()) newErrors.street = t('validation.required');
        if (!formData.address.number.trim()) newErrors.number = t('validation.required');
        if (!formData.address.neighborhood.trim()) newErrors.neighborhood = t('validation.required');
        if (!formData.address.city.trim()) newErrors.city = t('validation.required');
        if (!formData.address.state.trim()) newErrors.state = t('validation.required');
        if (!formData.address.zipCode.trim()) newErrors.zipCode = t('validation.required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenModal = (client: Client | null = null) => {
        setErrors({});
        if (client) {
            setCurrentClient(client);
            setFormData({
                ...initialFormData, 
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
            toast.success(t('clients.updateSuccess'));
        } else {
            setClients([clientData, ...clients]);
            toast.success(t('clients.addSuccess'));
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const addressKeys: (keyof Address)[] = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode'];
        if (addressKeys.includes(name as keyof Address)) {
            setFormData(prev => ({...prev, address: {...prev.address, [name]: value }}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleClientTypeChange = (type: 'Individual' | 'Company') => {
        setErrors({});
        setFormData(prev => ({...initialFormData, clientType: type, phone: prev.phone}));
    }
    
    const renderInput = (name: keyof Omit<ClientFormData, 'address'>, label: string) => (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input type="text" name={name} value={formData[name] || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors[name as keyof FormErrors] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            {errors[name as keyof FormErrors] && <p className="text-sm text-red-500 mt-1">{errors[name as keyof FormErrors]}</p>}
        </div>
    );
    
    const renderAddressInput = (name: keyof Address, label: string, colSpan: string = 'col-span-2') => (
        <div className={colSpan}>
            <label className="block text-sm font-medium">{label}</label>
            <input type="text" name={name} value={formData.address[name] || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 ${errors[name as keyof FormErrors] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            {errors[name as keyof FormErrors] && <p className="text-sm text-red-500 mt-1">{errors[name as keyof FormErrors]}</p>}
        </div>
    );


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
                                <th scope="col" className="px-6 py-3">{t('clients.phone')}</th>
                                <th scope="col" className="px-6 py-3">{t('clients.address')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {client.clientType === 'Company' ? client.companyName : client.fullName}
                                    </td>
                                    <td className="px-6 py-4">{client.phone}</td>
                                    <td className="px-6 py-4">{formatAddress(client.address)}</td>
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
                            {renderInput('fullName', t('clients.fullName'))}
                            {renderInput('cpf', t('clients.cpf'))}
                        </>
                    ) : (
                        <>
                            {renderInput('companyName', t('clients.companyName'))}
                            {renderInput('tradeName', t('clients.tradeName'))}
                            {renderInput('cnpj', t('clients.cnpj'))}
                            {renderInput('stateRegistration', t('clients.stateRegistration'))}
                            {renderInput('fullName', t('clients.contactPerson'))}
                        </>
                    )}
                    {renderInput('phone', t('clients.phone'))}
                    
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
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 ${justificationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
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