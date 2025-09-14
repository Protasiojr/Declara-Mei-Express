
import React, { useState } from 'react';
import { Company, Address } from '../types';
import { MOCK_COMPANY } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';

const formatAddress = (address: Address) => {
    if (!address || !address.street) return '';
    const { street, number, complement, neighborhood, city, state, zipCode } = address;
    return `${street}, ${number}${complement ? ` - ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipCode}`;
};


const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company>(MOCK_COMPANY);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Company>(MOCK_COMPANY);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Company, 'address'> | keyof Address, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof Omit<Company, 'address'> | keyof Address, string>> = {};
    let isValid = true;

    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.entrepreneur.trim()) newErrors.entrepreneur = t('validation.required');
    if (!formData.cnpj.trim()) newErrors.cnpj = t('validation.required');
    if (!formData.creationDate.trim()) newErrors.creationDate = t('validation.required');

    if (!formData.address.street.trim()) newErrors.street = t('validation.required');
    if (!formData.address.number.trim()) newErrors.number = t('validation.required');
    if (!formData.address.neighborhood.trim()) newErrors.neighborhood = t('validation.required');
    if (!formData.address.city.trim()) newErrors.city = t('validation.required');
    if (!formData.address.state.trim()) newErrors.state = t('validation.required');
    if (!formData.address.zipCode.trim()) newErrors.zipCode = t('validation.required');
    
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (formData.cnpj && !cnpjRegex.test(formData.cnpj)) {
        newErrors.cnpj = t('validation.invalidCnpj');
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setCompany(formData);
      setIsEditing(false);
      setErrors({});
    }
  };

  const handleEdit = () => {
    setFormData(company);
    setIsEditing(true);
    setErrors({});
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(company);
    setErrors({});
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
  
  const InputField = ({ label, name, value, error }: {label: string, name: keyof Omit<Company, 'address'>, value: string, error?: string}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input 
            type="text" 
            name={name} 
            value={value} 
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  const AddressInputField = ({ label, name, value, error, colSpan = "col-span-2" }: {label: string, name: keyof Address, value: string | undefined, error?: string, colSpan?: string}) => (
    <div className={colSpan}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input 
            type="text" 
            name={name} 
            value={value || ''} 
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.company')}</h1>
      <Card title={t('company.registrationInfo')}>
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={t('company.companyName')} name="name" value={formData.name} error={errors.name} />
                <InputField label={t('company.entrepreneur')} name="entrepreneur" value={formData.entrepreneur} error={errors.entrepreneur} />
                <InputField label={t('company.cnpj')} name="cnpj" value={formData.cnpj} error={errors.cnpj} />
                <InputField label={t('company.creationDate')} name="creationDate" value={formData.creationDate} error={errors.creationDate} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('company.address')}</h3>
              {!isEditing ? (
                 <p className="mt-2 text-gray-600 dark:text-gray-300">{formatAddress(company.address)}</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <AddressInputField label={t('address.street')} name="street" value={formData.address.street} error={errors.street} colSpan="col-span-2"/>
                    <AddressInputField label={t('address.number')} name="number" value={formData.address.number} error={errors.number} colSpan="col-span-1"/>
                    <AddressInputField label={t('address.complement')} name="complement" value={formData.address.complement} error={errors.complement} colSpan="col-span-1"/>
                    <AddressInputField label={t('address.neighborhood')} name="neighborhood" value={formData.address.neighborhood} error={errors.neighborhood} colSpan="col-span-2"/>
                    <AddressInputField label={t('address.city')} name="city" value={formData.address.city} error={errors.city} colSpan="col-span-1"/>
                    <AddressInputField label={t('address.state')} name="state" value={formData.address.state} error={errors.state} colSpan="col-span-1"/>
                    <AddressInputField label={t('address.zipCode')} name="zipCode" value={formData.address.zipCode} error={errors.zipCode} colSpan="col-span-2"/>
                </div>
              )}
            </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={handleCancel}>{t('common.cancel')}</Button>
                <Button type="submit">{t('common.saveChanges')}</Button>
              </>
            ) : (
                <Button type="button" onClick={handleEdit}>{t('common.editData')}</Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanyPage;