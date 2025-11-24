
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleInteraction = () => {
    setIsPressed(true);
    onAdd(product);
    // Reset animation state after a short delay
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <article 
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col
        ${isPressed ? 'scale-[0.98] ring-2 ring-primary/50' : ''}
      `}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Loading Placeholder / Skeleton */}
        <div 
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-hidden="true"
        />
        
        <img 
          src={product.img} 
          alt={product.nome} 
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm scale-105'}`}
        />

        <div className="absolute top-2 right-2 z-10">
             <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-full uppercase font-bold tracking-wider shadow-sm">
                {product.categoria}
             </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">{product.nome}</h3>
        
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(product.preco)}
          </span>
          
          <button 
            onClick={handleInteraction}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95
              ${isPressed 
                ? 'bg-primary text-white scale-95' 
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white'}
            `}
          >
            <Plus size={16} />
            Pedir
          </button>
        </div>
      </div>
    </article>
  );
};
