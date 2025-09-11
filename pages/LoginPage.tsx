import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { GoogleIcon } from '../components/icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

interface LoginPageProps {
    onLogin: () => void;
    theme: string;
    toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, toggleTheme }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('user@test.com');
    const [password, setPassword] = useState('password');
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validate = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;
    
        if (!email) {
            newErrors.email = t('validation.required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('validation.invalidEmail');
            isValid = false;
        }
    
        if (!password) {
            newErrors.password = t('validation.required');
            isValid = false;
        }
    
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onLogin();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <LanguageSwitcher />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Declara Mei Express
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('login.subtitle')}
                    </p>
                </div>
                <Card title="">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('login.emailLabel')}
                            </label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                       className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}/>
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('login.passwordLabel')}
                            </label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                       className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}/>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                    {t('login.forgotPassword')}
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full flex justify-center">
                                {t('login.signInButton')}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"/>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                  {t('login.orContinueWith')}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button onClick={onLogin} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <GoogleIcon />
                                <span className="ml-2">Google</span>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default LoginPage;