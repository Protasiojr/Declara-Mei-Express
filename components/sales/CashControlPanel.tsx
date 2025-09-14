import React from 'react';
import { CashSession } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';

interface CashControlPanelProps {
    currentCashSession: CashSession;
    onOpenMovementModal: () => void;
    onOpenClosingModal: () => void;
}

const CashControlPanel: React.FC<CashControlPanelProps> = ({
    currentCashSession,
    onOpenMovementModal,
    onOpenClosingModal
}) => {
    const { t } = useTranslation();

    return (
         <div className="border-t dark:border-gray-700 pt-4 mt-auto space-y-2 text-sm">
            <h3 className="font-bold text-base mb-2">{t('cashControl.title')}</h3>
             <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.status')}</span> <span className="font-semibold text-green-500">{t('cashControl.statusOpen')}</span></div>
             <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.operator')}</span> <span>{currentCashSession.operatorName}</span></div>
             <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.openedAt')}</span> <span>{new Date(currentCashSession.openedAt).toLocaleTimeString()}</span></div>
             <div className="flex justify-between"><span className="text-gray-500">{t('cashControl.openingBalance')}</span> <span>R$ {currentCashSession.openingBalance.toFixed(2)}</span></div>
             <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="secondary" onClick={onOpenMovementModal}>{t('cashControl.cashMovement')}</Button>
                <Button variant="primary" onClick={onOpenClosingModal}>{t('cashControl.closeCash')}</Button>
            </div>
        </div>
    );
}

export default CashControlPanel;
