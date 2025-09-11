import React, { useState } from 'react';
import { User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';

interface ProfilePageProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, setUser }) => {
  const { t } = useTranslation();
  const toast = useToast();
  
  if (!user) return null;

  const [formData, setFormData] = useState({ name: user.name, newPassword: '' });
  const [errors, setErrors] = useState({ name: '', newPassword: '' });

  const validate = () => {
    const newErrors = { name: '', newPassword: '' };
    let isValid = true;
    if (!formData.name.trim()) {
        newErrors.name = t('validation.required');
        isValid = false;
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = t('validation.passwordMinLength');
        isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
        setUser(prev => prev ? { ...prev, name: formData.name } : null);
        // Here you would typically also handle the password change logic
        toast.success(t('profile.saveSuccess'));
        setErrors({ name: '', newPassword: '' });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && setUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prevUser => prevUser ? { ...prevUser, profilePicture: reader.result as string } : null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('sidebar.profile')}</h1>
      <Card title={t('profile.profileInfo')}>
        <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col items-center">
                <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
                <label htmlFor="profile-pic-upload" className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    {t('profile.changeImage')}
                </label>
                <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
            </div>
          <form className="w-full space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium">{t('profile.profileName')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} 
                     className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{t('profile.loginEmail')}</label>
              <input type="email" value={user.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('profile.profileType')}</label>
              <input type="text" value={user.profileType} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('profile.newPassword')}</label>
              <input type="password" name="newPassword" placeholder="********" value={formData.newPassword} onChange={handleInputChange}
                     className={`mt-1 block w-full rounded-md shadow-sm dark:bg-gray-700 ${errors.newPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`} />
               {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="submit">{t('common.saveChanges')}</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;