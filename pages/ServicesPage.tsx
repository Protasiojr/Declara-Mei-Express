import React, { useState, useMemo, useEffect } from 'react';
import { Service, ServiceProvision, Client } from '../types';
import { MOCK_SERVICES, MOCK_SERVICE_PROVISIONS, MOCK_CLIENTS } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

type ClientFormData = Omit<Client, 'id'>;
type ProvisionFormData = {
    serviceId: string;
    quantity: string;
    date: string;
    withInvoice: boolean;
    client: Client | null;
};

const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [serviceProvisions, setServiceProvisions] = useState<ServiceProvision[]>(MOCK_SERVICE_PROVISIONS);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);

    // Catalog Modal State
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [catalogFormData, setCatalogFormData] = useState({ name: '', price: '' });
    const [catalogErrors, setCatalogErrors] = useState({ name: '', price: '' });
    const [pendingServiceData, setPendingServiceData] = useState<{name: string, price: number} | null>(null);
    
    // Provision Modal State
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [currentProvision, setCurrentProvision] = useState<ServiceProvision | null>(null);
    const initialProvisionForm: ProvisionFormData = { serviceId: '', quantity: '1', date: new Date().toISOString().split('T')[0], withInvoice: false, client: null };
    const [provisionFormData, setProvisionFormData] = useState<ProvisionFormData>(initialProvisionForm);
    const [provisionErrors, setProvisionErrors] = useState<Partial<ProvisionFormData>>({});

    // Service Search State
    const [serviceSearch, setServiceSearch] = useState('');
    const [serviceSearchResults, setServiceSearchResults] = useState<Service[]>([]);

    // Justification Modal State
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [justification, setJustification] = useState('');
    const [justificationError, setJustificationError] = useState('');
    const [justificationAction, setJustificationAction] = useState<'editCatalog' | 'editProvision' | null>(null);

    // Client Modal State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const initialClientFormData: ClientFormData = { clientType: 'Individual', fullName: '', address: '', phone: '', cpf: '', companyName: '', tradeName: '', cnpj: '', stateRegistration: '' };
    const [clientFormData, setClientFormData] = useState<ClientFormData>(initialClientFormData);
    const [clientErrors, setClientErrors] = useState<Partial<ClientFormData>>({});
    
     useEffect(() => {
        if (serviceSearch.trim() === '') {
            setServiceSearchResults([]);
            return;
        }
        
        const selectedService = services.find(s => String(s.id) === provisionFormData.serviceId);
        if (selectedService && selectedService.name.toLowerCase() === serviceSearch.toLowerCase()) {
            setServiceSearchResults([]);
            return;
        }

        const lowercasedQuery = serviceSearch.toLowerCase();
        const results = services.filter(service =>
            service.name.toLowerCase().includes(lowercasedQuery)
        );
        setServiceSearchResults(results);
    }, [serviceSearch, provisionFormData.serviceId, services]);

    // --- Catalog Functions ---
    const validateCatalog = () => {
        const newErrors = { name: '', price: '' };
        let isValid = true;
        if (!catalogFormData.name.trim()) { newErrors.name = t('validation.required'); isValid = false; }
        if (!catalogFormData.price || isNaN(Number(catalogFormData.price)) || Number(catalogFormData.price) <= 0) { newErrors.price = t('validation.invalidPrice'); isValid = false; }
        setCatalogErrors(newErrors);
        return isValid;
    };

    const handleOpenCatalogModal = (service: Service | null = null) => {
        if (service) {
            setCurrentService(service);
            setCatalogFormData({ name: service.name, price: String(service.price) });
        } else {
            setCurrentService(null);
            setCatalogFormData({ name: '', price: '' });
        }
        setCatalogErrors({ name: '', price: '' });
        setIsCatalogModalOpen(true);
    };

    const handleSaveCatalog = () => {
        if (!validateCatalog()) return;
        const serviceData = { name: catalogFormData.name, price: Number(catalogFormData.price) };
        if (currentService) {
            setPendingServiceData(serviceData);
            setJustificationAction('editCatalog');
            setIsJustificationModalOpen(true);
        } else {
            setServices([...services, { id: Date.now(), ...serviceData }]);
            toast.success(t('services.addSuccess'));
            setIsCatalogModalOpen(false);
        }
    };
    
    const handleDeleteCatalog = (serviceId: number) => {
        toast.confirm(t('services.deleteConfirm'), () => {
            setServices(services.filter(s => s.id !== serviceId));
            toast.success(t('services.deleteSuccess'));
        });
    };

    // --- Provision Functions ---
    const getClientDisplayName = (client: Client | null) => {
        if (!client) return t('sales.clientTypeConsumer');
        return client.clientType === 'Company' ? client.companyName : client.fullName;
    }

    const validateProvision = () => {
        const newErrors: Partial<ProvisionFormData> = {};
        if (!provisionFormData.serviceId) newErrors.serviceId = t('validation.required');
        const quantityNum = Number(provisionFormData.quantity);
        if (!provisionFormData.quantity || isNaN(quantityNum) || quantityNum <= 0) newErrors.quantity = t('validation.invalidPrice');
        if (!provisionFormData.date) newErrors.date = t('validation.required');
        setProvisionErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenProvisionModal = (provision: ServiceProvision | null) => {
        setProvisionErrors({});
        setClientSearch('');
        if (provision) {
            setCurrentProvision(provision);
            setProvisionFormData({
                serviceId: String(provision.service.id),
                quantity: String(provision.quantity),
                date: provision.date,
                withInvoice: provision.withInvoice,
                client: provision.client,
            });
            setServiceSearch(provision.service.name);
        } else {
            setCurrentProvision(null);
            setProvisionFormData(initialProvisionForm);
            setServiceSearch('');
        }
        setIsProvisionModalOpen(true);
    };
    
    const handleServiceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setServiceSearch(newSearchText);

        const currentService = services.find(s => String(s.id) === provisionFormData.serviceId);
        if (currentService && currentService.name !== newSearchText) {
            setProvisionFormData(prev => ({ ...prev, serviceId: '' }));
        }
    };

    const handleSelectService = (service: Service) => {
        setProvisionFormData(prev => ({ ...prev, serviceId: String(service.id) }));
        setServiceSearch(service.name);
        setServiceSearchResults([]);
    };

    const handleSaveProvision = () => {
        if (!validateProvision()) return;
        if (currentProvision) {
            setJustificationAction('editProvision');
            setIsJustificationModalOpen(true);
        } else {
            const service = services.find(s => s.id === Number(provisionFormData.serviceId));
            if (!service) return;
            const newProvision: ServiceProvision = {
                id: Date.now(),
                service,
                quantity: Number(provisionFormData.quantity),
                total: service.price * Number(provisionFormData.quantity),
                date: provisionFormData.date,
                withInvoice: provisionFormData.withInvoice,
                client: provisionFormData.client
            };
            setServiceProvisions(prev => [newProvision, ...prev]);
            toast.success(t('services.addProvisionSuccess'));
            setIsProvisionModalOpen(false);
        }
    };
    
    const handleDeleteProvision = (provisionId: number) => {
        toast.confirm(t('services.deleteProvisionConfirm'), () => {
            setServiceProvisions(serviceProvisions.filter(p => p.id !== provisionId));
            toast.success(t('services.deleteProvisionSuccess'));
        });
    };

    const totalProvisionValue = useMemo(() => {
        const service = services.find(s => s.id === Number(provisionFormData.serviceId));
        const quantity = Number(provisionFormData.quantity);
        if (service && !isNaN(quantity) && quantity > 0) return service.price * quantity;
        return 0;
    }, [provisionFormData.serviceId, provisionFormData.quantity, services]);
    
    // --- Justification & Client Functions --- (Shared Logic)
     useEffect(() => {
        if (clientSearch.trim() === '') {
            setSearchResults([]);
            return;
        }
        const lowercasedQuery = clientSearch.toLowerCase();
        const results = clients.filter(c => c.fullName.toLowerCase().includes(lowercasedQuery) || (c.companyName && c.companyName.toLowerCase().includes(lowercasedQuery)) || (c.cpf && c.cpf.includes(lowercasedQuery)) || (c.cnpj && c.cnpj.includes(lowercasedQuery)));
        setSearchResults(results);
    }, [clientSearch, clients]);

    const handleConfirmSaveWithJustification = () => {
        if (!justification.trim()) {
            setJustificationError(t('common.justificationRequired'));
            return;
        }
        
        if (justificationAction === 'editCatalog' && currentService && pendingServiceData) {
            setServices(services.map(s => s.id === currentService.id ? { ...s, ...pendingServiceData } : s));
            toast.success(t('services.updateSuccess'));
            setIsCatalogModalOpen(false);
        }

        if (justificationAction === 'editProvision' && currentProvision) {
            const service = services.find(s => s.id === Number(provisionFormData.serviceId));
            if (!service) return;
            const updatedProvision: ServiceProvision = {
                ...currentProvision,
                service,
                quantity: Number(provisionFormData.quantity),
                total: service.price * Number(provisionFormData.quantity),
                date: provisionFormData.date,
                withInvoice: provisionFormData.withInvoice,
                client: provisionFormData.client
            };
            setServiceProvisions(serviceProvisions.map(p => p.id === currentProvision.id ? updatedProvision : p));
            toast.success(t('services.updateProvisionSuccess'));
            setIsProvisionModalOpen(false);
        }

        setIsJustificationModalOpen(false);
        setJustification('');
        setPendingServiceData(null);
        setJustificationAction(null);
    };

    const handleSelectClient = (client: Client) => {
        setProvisionFormData(prev => ({...prev, client}));
        setClientSearch('');
        setSearchResults([]);
    };

    // --- Client Modal Functions (similar to SalesPage)
    const validateClient = () => {
        const newErrors: Partial<ClientFormData> = {};
        if (!clientFormData.fullName.trim()) newErrors.fullName = t('validation.required');
        if (!clientFormData.address.trim()) newErrors.address = t('validation.required');
        if (!clientFormData.phone.trim()) newErrors.phone = t('validation.required');
        if (clientFormData.clientType === 'Individual' && !clientFormData.cpf?.trim()) newErrors.cpf = t('validation.required');
        if (clientFormData.clientType === 'Company') {
            if (!clientFormData.companyName?.trim()) newErrors.companyName = t('validation.required');
            if (!clientFormData.cnpj?.trim()) newErrors.cnpj = t('validation.required');
        }
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveNewClient = () => {
        if (!validateClient()) return;
        const newClient: Client = { id: Date.now(), ...clientFormData };
        setClients(prev => [newClient, ...prev]);
        handleSelectClient(newClient);
        setIsClientModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.services')}</h1>
            
            {/* Service Provision History */}
            <Card title={t('services.provisionHistory')}>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenProvisionModal(null)}>{t('services.registerProvision')}</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('services.serviceName')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.clientLabel')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales.total')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceProvisions.map(p => (
                                <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{p.service.name}</td>
                                    <td className="px-6 py-4">{getClientDisplayName(p.client)}</td>
                                    <td className="px-6 py-4">{new Date(p.date + 'T00:00').toLocaleDateString()}</td>
                                    <td className="px-6 py-4">R$ {p.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenProvisionModal(p)}>{t('common.edit')}</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteProvision(p.id)}>{t('common.delete')}</Button>
                                    </td>
                                </tr>
                            ))}
                            {serviceProvisions.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">{t('services.noProvisions')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Service Catalog */}
            <Card title={t('services.serviceRegistry')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('services.serviceName')}</th>
                                <th scope="col" className="px-6 py-3">{t('services.price')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4">R$ {service.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenCatalogModal(service)}>{t('common.edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteCatalog(service.id)}>{t('common.delete')}</Button>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">{t('services.noServices')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleOpenCatalogModal(null)}>{t('services.addNew')}</Button>
                </div>
            </Card>

            {/* Provision Modal */}
            <Modal isOpen={isProvisionModalOpen} onClose={() => setIsProvisionModalOpen(false)} title={currentProvision ? t('services.editProvision') : t('services.registerProvision')}>
                 <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium">{t('services.serviceName')}</label>
                        <input
                            type="text"
                            value={serviceSearch}
                            onChange={handleServiceSearchChange}
                            placeholder={t('services.searchServicePlaceholder')}
                            className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${provisionErrors.serviceId && !provisionFormData.serviceId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {provisionErrors.serviceId && !provisionFormData.serviceId && <p className="text-sm text-red-500 mt-1">{provisionErrors.serviceId}</p>}
                        {serviceSearchResults.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {serviceSearchResults.map(service => (
                                    <li key={service.id} onClick={() => handleSelectService(service)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        {service.name} (R$ {service.price.toFixed(2)})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.quantity')}</label>
                        <input type="number" name="quantity" value={provisionFormData.quantity} onChange={(e) => setProvisionFormData(p => ({...p, quantity: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${provisionErrors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {provisionErrors.quantity && <p className="text-sm text-red-500 mt-1">{provisionErrors.quantity}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('sales.date')}</label>
                        <input type="date" name="date" value={provisionFormData.date} onChange={(e) => setProvisionFormData(p => ({...p, date: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${provisionErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                         {provisionErrors.date && <p className="text-sm text-red-500 mt-1">{provisionErrors.date}</p>}
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium">{t('sales.clientLabel')}</label>
                         {provisionFormData.client ? (
                             <div className="flex items-center justify-between mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600">
                                 <span>{getClientDisplayName(provisionFormData.client)}</span>
                                 <button type="button" onClick={() => setProvisionFormData(p => ({...p, client: null}))} className="text-red-500 hover:text-red-700">&times;</button>
                             </div>
                         ) : ( <>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder={t('sales.searchClientPlaceholder')} className="block w-full rounded-md shadow-sm dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                                <Button type="button" variant="secondary" size="sm" onClick={() => setIsClientModalOpen(true)}>{t('sales.registerNewClient')}</Button>
                            </div>
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {searchResults.map(client => (
                                        <li key={client.id} onClick={() => handleSelectClient(client)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{getClientDisplayName(client)} ({client.clientType === 'Individual' ? client.cpf : client.cnpj})</li>
                                    ))}
                                </ul>
                            )}
                        </> )}
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" name="withInvoice" id="withInvoice" checked={provisionFormData.withInvoice} onChange={(e) => setProvisionFormData(p => ({...p, withInvoice: e.target.checked}))} className="h-4 w-4 rounded text-primary-600" />
                        <label htmlFor="withInvoice" className="ml-2 block text-sm">{t('sales.invoice')}</label>
                    </div>
                     <div className="text-right font-bold text-lg">{t('sales.total')}: R$ {totalProvisionValue.toFixed(2)}</div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsProvisionModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveProvision}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
            
            {/* Catalog Modal */}
            <Modal isOpen={isCatalogModalOpen} onClose={() => setIsCatalogModalOpen(false)} title={currentService ? t('services.editService') : t('services.addService')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('services.serviceName')}</label>
                        <input type="text" name="name" value={catalogFormData.name} onChange={(e) => setCatalogFormData(p => ({...p, name: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${catalogErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {catalogErrors.name && <p className="text-sm text-red-500 mt-1">{catalogErrors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('services.price')}</label>
                        <input type="number" name="price" value={catalogFormData.price} onChange={(e) => setCatalogFormData(p => ({...p, price: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${catalogErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {catalogErrors.price && <p className="text-sm text-red-500 mt-1">{catalogErrors.price}</p>}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsCatalogModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveCatalog}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>

            {/* Justification Modal */}
            <Modal isOpen={isJustificationModalOpen} onClose={() => setIsJustificationModalOpen(false)} title={t('common.justification')}>
                <div className="space-y-4">
                    <p>{justificationAction === 'editCatalog' ? t('services.editJustificationPrompt') : t('services.editProvisionJustificationPrompt')}</p>
                    <div>
                        <textarea value={justification} onChange={(e) => { setJustification(e.target.value); if(justificationError) setJustificationError(''); }} rows={4} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 ${justificationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder={t('common.justification')} />
                         {justificationError && <p className="mt-1 text-sm text-red-600">{justificationError}</p>}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setIsJustificationModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleConfirmSaveWithJustification}>{t('common.confirm')}</Button>
                    </div>
                </div>
            </Modal>
            
            {/* New Client Modal */}
             <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={t('clients.addClient')}>
                 <div className="space-y-4">
                     <div className="flex gap-4">
                        <label className="flex items-center"><input type="radio" name="clientType" checked={clientFormData.clientType === 'Individual'} onChange={() => setClientFormData({...initialClientFormData, clientType: 'Individual'})} /><span className="ml-2 text-sm">{t('clients.individual')}</span></label>
                        <label className="flex items-center"><input type="radio" name="clientType" checked={clientFormData.clientType === 'Company'} onChange={() => setClientFormData({...initialClientFormData, clientType: 'Company'})} /><span className="ml-2 text-sm">{t('clients.company')}</span></label>
                    </div>
                    {clientFormData.clientType === 'Individual' ? ( <>
                        <div><label>{t('clients.fullName')}</label><input type="text" name="fullName" value={clientFormData.fullName} onChange={(e) => setClientFormData(p=>({...p, fullName: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.fullName && <p className="text-sm text-red-500 mt-1">{clientErrors.fullName}</p>}</div>
                        <div><label>{t('clients.cpf')}</label><input type="text" name="cpf" value={clientFormData.cpf} onChange={(e) => setClientFormData(p=>({...p, cpf: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.cpf && <p className="text-sm text-red-500 mt-1">{clientErrors.cpf}</p>}</div>
                    </> ) : ( <>
                        <div><label>{t('clients.companyName')}</label><input type="text" name="companyName" value={clientFormData.companyName} onChange={(e) => setClientFormData(p=>({...p, companyName: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.companyName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.companyName && <p className="text-sm text-red-500 mt-1">{clientErrors.companyName}</p>}</div>
                        <div><label>{t('clients.cnpj')}</label><input type="text" name="cnpj" value={clientFormData.cnpj} onChange={(e) => setClientFormData(p=>({...p, cnpj: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.cnpj ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.cnpj && <p className="text-sm text-red-500 mt-1">{clientErrors.cnpj}</p>}</div>
                        <div><label>{t('clients.contactPerson')}</label><input type="text" name="fullName" value={clientFormData.fullName} onChange={(e) => setClientFormData(p=>({...p, fullName: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.fullName && <p className="text-sm text-red-500 mt-1">{clientErrors.fullName}</p>}</div>
                    </> )}
                    <div><label>{t('clients.address')}</label><input type="text" name="address" value={clientFormData.address} onChange={(e) => setClientFormData(p=>({...p, address: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.address && <p className="text-sm text-red-500 mt-1">{clientErrors.address}</p>}</div>
                    <div><label>{t('clients.phone')}</label><input type="text" name="phone" value={clientFormData.phone} onChange={(e) => setClientFormData(p=>({...p, phone: e.target.value}))} className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${clientErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />{clientErrors.phone && <p className="text-sm text-red-500 mt-1">{clientErrors.phone}</p>}</div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsClientModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveNewClient}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ServicesPage;