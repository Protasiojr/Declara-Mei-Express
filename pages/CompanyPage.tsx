import React, { useState } from 'react';
import { Company } from '../types';
import { MOCK_COMPANY } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';

const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company>(MOCK_COMPANY);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Company>(MOCK_COMPANY);
  const [errors, setErrors] = useState<Partial<Record<keyof Company, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof Company, string>> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
        const formKey = key as keyof Company;
        if (!formData[formKey].trim()) {
            newErrors[formKey] = t('validation.required');
            isValid = false;
        }
    });
    
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const InputField = ({ label, name, value, onChange, disabled, error }: {label: string, name: keyof Company, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean, error?: string}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input 
            type="text" 
            name={name} 
            value={value} 
            onChange={onChange}
            disabled={disabled}
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
            <InputField label={t('company.companyName')} name="name" value={isEditing ? formData.name : company.name} onChange={handleInputChange} disabled={!isEditing} error={errors.name} />
            <InputField label={t('company.entrepreneur')} name="entrepreneur" value={isEditing ? formData.entrepreneur : company.entrepreneur} onChange={handleInputChange} disabled={!isEditing} error={errors.entrepreneur} />
            <InputField label={t('company.cnpj')} name="cnpj" value={isEditing ? formData.cnpj : company.cnpj} onChange={handleInputChange} disabled={!isEditing} error={errors.cnpj} />
            <InputField label={t('company.creationDate')} name="creationDate" value={isEditing ? formData.creationDate : company.creationDate} onChange={handleInputChange} disabled={!isEditing} error={errors.creationDate} />
            <InputField label={t('company.address')} name="address" value={isEditing ? formData.address : company.address} onChange={handleInputChange} disabled={!isEditing} error={errors.address} />
          
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