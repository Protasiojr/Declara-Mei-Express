
import React, { useState } from 'react';
import { Employee, Address } from '../types';
import { MOCK_EMPLOYEE } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

type EmployeeFormData = Omit<Employee, 'id'>;
type FormErrors = Partial<Record<keyof Omit<EmployeeFormData, 'address'> | keyof Address, string>>;


const formatAddress = (address: Address) => {
    if (!address || !address.street) return '';
    const { street, number, complement, neighborhood, city, state, zipCode } = address;
    return `${street}, ${number}${complement ? ` - ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipCode}`;
};


const EmployeePage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [employee, setEmployee] = useState<Employee | null>(MOCK_EMPLOYEE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialFormData: EmployeeFormData = {
    fullName: '',
    phone: '',
    pis: '',
    ctps: '',
    vacationStart: '',
    vacationEnd: '',
    address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' }
  };
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    if (!formData.fullName.trim()) { newErrors.fullName = t('validation.required'); isValid = false; }
    if (!formData.phone.trim()) { newErrors.phone = t('validation.required'); isValid = false; }
    if (!formData.pis.trim()) { newErrors.pis = t('validation.required'); isValid = false; }
    if (!formData.ctps.trim()) { newErrors.ctps = t('validation.required'); isValid = false; }

    if (!formData.address.street.trim()) { newErrors.street = t('validation.required'); isValid = false; }
    if (!formData.address.number.trim()) { newErrors.number = t('validation.required'); isValid = false; }
    if (!formData.address.neighborhood.trim()) { newErrors.neighborhood = t('validation.required'); isValid = false; }
    if (!formData.address.city.trim()) { newErrors.city = t('validation.required'); isValid = false; }
    if (!formData.address.state.trim()) { newErrors.state = t('validation.required'); isValid = false; }
    if (!formData.address.zipCode.trim()) { newErrors.zipCode = t('validation.required'); isValid = false; }
    
    if (formData.vacationStart && formData.vacationEnd && formData.vacationStart > formData.vacationEnd) {
      newErrors.vacationEnd = t('validation.endDateAfterStartDate');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleOpenModal = () => {
    if (employee) {
        setFormData({
            ...employee,
            vacationStart: employee.vacationStart || '',
            vacationEnd: employee.vacationEnd || ''
        });
    } else {
        setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const saveData = () => {
        const updatedEmployee: Employee = {
            id: employee?.id || Date.now(),
            ...formData,
            vacationStart: formData.vacationStart || undefined,
            vacationEnd: formData.vacationEnd || undefined,
        };
        setEmployee(updatedEmployee);
        toast.success(employee ? t('employee.updateSuccess') : t('employee.addSuccess'));
        handleCloseModal();
    }
    
    if(employee) {
        toast.confirm(t('employee.confirmSave'), saveData);
    } else {
        saveData();
    }
  };

  const handleDelete = () => {
    toast.confirm(t('employee.confirmDelete'), () => {
        setEmployee(null);
        toast.success(t('employee.deleteSuccess'));
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const addressKeys: (keyof Address)[] = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode'];

    if (addressKeys.includes(name as keyof Address)) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const renderInput = (name: keyof Omit<EmployeeFormData, 'address'> | keyof Address, label: string, isAddressField: boolean = false, type: string = 'text', colSpan: string = 'col-span-2') => {
    const value = isAddressField ? formData.address[name as keyof Address] : formData[name as keyof Omit<EmployeeFormData, 'address'>];
    const error = errors[name as keyof typeof errors];

    return (
        <div className={colSpan}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'}`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.employee')}</h1>
      <p className="text-gray-600 dark:text-gray-400">{t('employee.description')}</p>
      
      <Card title={t('employee.employeeData')}>
        {employee ? (
            <div className="space-y-4">
              <p><strong>{t('employee.nameLabel')}:</strong> {employee.fullName}</p>
              <p><strong>{t('employee.phoneLabel')}:</strong> {employee.phone}</p>
              <p><strong>{t('employee.addressLabel')}:</strong> {formatAddress(employee.address)}</p>
              <p><strong>{t('employee.pisLabel')}:</strong> {employee.pis}</p>
              <p><strong>{t('employee.ctpsLabel')}:</strong> {employee.ctps}</p>
              {employee.vacationStart && employee.vacationEnd && (
                <p>
                  <strong>{t('employee.vacationPeriod')}:</strong> 
                  {` ${new Date(employee.vacationStart + 'T00:00').toLocaleDateString()} - ${new Date(employee.vacationEnd + 'T00:00').toLocaleDateString()}`}
                </p>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
                <Button onClick={handleOpenModal}>{t('common.editData')}</Button>
              </div>
            </div>
        ) : (
            <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('employee.noEmployee')}</p>
                <Button onClick={handleOpenModal}>{t('employee.addEmployee')}</Button>
            </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={employee ? t('employee.editEmployee') : t('employee.addEmployee')}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {renderInput('fullName', t('employee.fullName'))}
                {renderInput('phone', t('employee.phone'))}
                {renderInput('pis', t('employee.pis'))}
                {renderInput('ctps', t('employee.ctps'))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('employee.address')}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {renderInput('street', t('address.street'), true)}
                    {renderInput('number', t('address.number'), true, 'text', 'col-span-1')}
                    {renderInput('complement', t('address.complement'), true, 'text', 'col-span-1')}
                    {renderInput('neighborhood', t('address.neighborhood'), true)}
                    {renderInput('city', t('address.city'), true, 'text', 'col-span-1')}
                    {renderInput('state', t('address.state'), true, 'text', 'col-span-1')}
                    {renderInput('zipCode', t('address.zipCode'), true)}
                </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('employee.vacationPeriod')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {renderInput('vacationStart', t('employee.vacationStart'), false, 'date', 'col-span-1')}
                    {renderInput('vacationEnd', t('employee.vacationEnd'), false, 'date', 'col-span-1')}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                <Button type="submit">{t('common.save')}</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeePage;