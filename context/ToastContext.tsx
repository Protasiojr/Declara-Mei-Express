import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'confirm';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  onConfirm?: () => void;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, onConfirm?: () => void) => void;
  removeToast: (id: number) => void;
  toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, onConfirm?: () => void) => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message, type, onConfirm }]);

    if (type !== 'confirm') {
      setTimeout(() => removeToast(id), 5000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { addToast } = context;

  return {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
    confirm: (message: string, onConfirm: () => void) => addToast(message, 'confirm', onConfirm),
  };
};

// Hook to get access to all toast properties, for the container
export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
}
