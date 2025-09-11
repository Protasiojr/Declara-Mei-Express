import React, { useState } from 'react';
import { Employee } from '../types';
import { MOCK_EMPLOYEE } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

type EmployeeFormData = Omit<Employee, 'id'>;

const EmployeePage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [employee, setEmployee] = useState<Employee | null>(MOCK_EMPLOYEE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '', address: '', phone: '', registrationData: '', vacationStart: '', vacationEnd: ''
  });
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});

  const validate = () => {
    const newErrors: Partial<EmployeeFormData> = {};
    let isValid = true;
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('validation.required');
      isValid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = t('validation.required');
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.required');
      isValid = false;
    }
    if (!formData.registrationData.trim()) {
      newErrors.registrationData = t('validation.required');
      isValid = false;
    }
    
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
        setFormData({ fullName: '', address: '', phone: '', registrationData: '', vacationStart: '', vacationEnd: '' });
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
        const updatedEmployee = {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderInput = (name: keyof EmployeeFormData, label: string, type: 'text' | 'textarea' | 'date' = 'text') => {
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';
    const inputType = type === 'textarea' ? undefined : type;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <InputComponent
                type={inputType}
                name={name}
                value={formData[name] || ''}
                onChange={handleInputChange}
                rows={type === 'textarea' ? 3 : undefined}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'}`}
                required={type !== 'date'}
            />
            {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
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
              <p><strong>{t('employee.addressLabel')}:</strong> {employee.address}</p>
              <p><strong>{t('employee.phoneLabel')}:</strong> {employee.phone}</p>
              <p><strong>{t('employee.registrationDataLabel')}:</strong> {employee.registrationData}</p>
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
            {renderInput('fullName', t('employee.fullName'))}
            {renderInput('address', t('employee.address'))}
            {renderInput('phone', t('employee.phone'))}
            {renderInput('registrationData', t('employee.registrationData'), 'textarea')}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('employee.vacationPeriod')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {renderInput('vacationStart', t('employee.vacationStart'), 'date')}
                    {renderInput('vacationEnd', t('employee.vacationEnd'), 'date')}
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