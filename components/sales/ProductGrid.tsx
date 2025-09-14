import React from 'react';
import { Product, Service } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import { BarcodeIcon } from '../icons';

interface ProductGridProps {
    items: (Product | Service)[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onAddToCart: (item: Product | Service) => void;
    onOpenScanner: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ items, searchTerm, setSearchTerm, onAddToCart, onOpenScanner }) => {
    const { t } = useTranslation();

    const filteredItems = React.useMemo(() => {
        if (!searchTerm) return items;
        const lowercasedSearch = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(lowercasedSearch) ||
            ('sku' in item && item.sku.toLowerCase().includes(lowercasedSearch))
        );
    }, [searchTerm, items]);

    return (
        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col">
            <div className="p-4 flex gap-2">
                <input
                    type="text"
                    placeholder={t('sales.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500"
                />
                <Button variant="secondary" onClick={onOpenScanner} className="flex items-center gap-2">
                    <BarcodeIcon />
                    <span className="hidden sm:inline">{t('sales.scanBarcode')}</span>
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredItems.map(item => (
                        <button key={`${'sku' in item ? 'p' : 's'}-${item.id}`} onClick={() => onAddToCart(item)} className="p-2 border dark:border-gray-700 rounded-lg text-center bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                            <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                                 <span className="text-gray-500 text-xs">Sem Imagem</span>
                            </div>
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400">R$ {item.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductGrid;
