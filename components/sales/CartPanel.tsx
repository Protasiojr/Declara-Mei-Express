import React from 'react';
import { SaleItem } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';

interface CartPanelProps {
    cart: SaleItem[];
    subtotal: number;
    total: number;
    onUpdateQuantity: (itemId: number, isProduct: boolean, newQuantity: number) => void;
    onCancelSale: () => void;
    onFinalizePayment: () => void;
    onOpenHistory: () => void;
}


const CartPanel: React.FC<CartPanelProps> = ({
    cart,
    subtotal,
    total,
    onUpdateQuantity,
    onCancelSale,
    onFinalizePayment,
    onOpenHistory
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('sales.currentSale')}</h2>
                <Button onClick={onOpenHistory} variant="secondary">{t('sales.saleHistory')}</Button>
            </div>
             <div className="flex-grow overflow-y-auto border-y dark:border-gray-700 -mx-4 px-4 py-2 my-4">
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">{t('sales.emptyCart')}</p>
                ) : (
                    cart.map(cartItem => (
                        <div key={`${'sku' in cartItem.item ? 'p' : 's'}-${cartItem.item.id}`} className="flex items-center py-2 border-b dark:border-gray-700 last:border-b-0">
                            <div className="flex-grow">
                                <p className="font-semibold">{cartItem.item.name}</p>
                                <p className="text-sm text-gray-500">R$ {cartItem.unitPrice.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={cartItem.quantity}
                                    onChange={(e) => onUpdateQuantity(cartItem.item.id, 'sku' in cartItem.item, Number(e.target.value))}
                                    className="w-16 p-1 text-center rounded border bg-gray-100 dark:bg-gray-700"
                                    min="0"
                                />
                                <p className="w-20 text-right font-semibold">R$ {cartItem.total.toFixed(2)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <span>{t('sales.subtotal')}</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                    <span>{t('sales.total')}</span>
                    <span>R$ {total.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <Button variant="danger" onClick={onCancelSale} disabled={cart.length === 0}>{t('sales.cancelSale')}</Button>
                <Button onClick={onFinalizePayment} disabled={cart.length === 0}>{t('sales.finalizePayment')}</Button>
            </div>
        </>
    );
};

export default CartPanel;
