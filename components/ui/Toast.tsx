import React from 'react';
import { useToastContext } from '../../context/ToastContext';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';

const SuccessIcon = () => (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Toast: React.FC = () => {
    const { toasts, removeToast } = useToastContext();
    const { t } = useTranslation();

    if (!toasts.length) return null;

    const icons = {
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <InfoIcon />,
        confirm: <InfoIcon />,
    };

    return (
        <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(toast => (
                <div key={toast.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {icons[toast.type]}
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {toast.message}
                                </p>
                                {toast.type === 'confirm' && toast.onConfirm && (
                                    <div className="mt-3 flex space-x-3">
                                        <Button size="sm" onClick={() => {
                                            toast.onConfirm?.();
                                            removeToast(toast.id);
                                        }}>
                                            {t('common.yes')}
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => removeToast(toast.id)}>
                                            {t('common.no')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button onClick={() => removeToast(toast.id)} className="inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Toast;
