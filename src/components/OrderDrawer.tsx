
import React, { useState } from 'react';
import { X, Trash2, Edit2, ShoppingBag, CreditCard, Plus, Minus, Loader2, CheckCircle } from 'lucide-react';
import { OrderItem } from '../types';
import { calculateItemPrice, formatCurrency } from '../utils';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  onEdit: (order: OrderItem) => void;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onCheckout: () => Promise<void>;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({ isOpen, onClose, orders, onEdit, onRemove, onUpdateQuantity, onCheckout }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const getPrice = (order: OrderItem) => {
    // Prioritize backend calculated price if available (from API response)
    if (order.precoTotalBackend !== undefined) {
        return order.precoTotalBackend;
    }
    return calculateItemPrice(order.preco, order.quantidade, order.categoria, order.tamanho, order.tipoMassa);
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + getPrice(curr), 0);

  const handleCheckoutClick = async () => {
    setIsProcessing(true);
    // Aguarda a função passada pelo pai (App.tsx)
    await onCheckout();
    setIsProcessing(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 bg-primary text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6" />
            <h2 className="text-xl font-bold">Pedidos Realizados</h2>
            <span className="bg-white text-primary px-2 py-0.5 rounded-full text-sm font-bold">{orders.length}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg font-medium">Nenhum pedido registrado</p>
              <p className="text-sm text-center max-w-[200px]">Seus pedidos confirmados no servidor aparecerão aqui.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col animate-fade-in group">
                
                {/* Header Info */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">{order.nome}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide font-semibold">
                            {order.categoria}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {order.tamanho} 
                        {order.tipoMassa && order.tipoMassa !== 'Tradicional' && (
                            <span className="text-primary font-medium"> • {order.tipoMassa}</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Cliente: {order.cliente}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-primary text-lg">{formatCurrency(getPrice(order))}</span>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
                    
                    {/* Quantity (Visual Only for Backend items) */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 opacity-70" title="A quantidade só pode ser alterada removendo e recriando o pedido">
                        <span className="w-8 text-center font-bold text-sm">{order.quantidade}x</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {/* Edit removed as backend doesn't easily support PUT without ID mapping */}
                        <button 
                            onClick={() => onRemove(order.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                            title="Cancelar Pedido"
                        >
                            <span className="text-xs font-medium">Cancelar</span>
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {orders.length > 0 && (
           <div className="p-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <div className="flex justify-between items-end mb-4">
               <span className="text-gray-500 dark:text-gray-400 font-medium text-lg">Total Consolidado</span>
               <span className="text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</span>
             </div>
             <div className="text-center text-xs text-gray-400 mb-4">
                Pedidos sincronizados com o servidor
             </div>
             
             <button 
               onClick={handleCheckoutClick}
               disabled={isProcessing}
               className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all uppercase tracking-wide text-lg flex items-center justify-center gap-2
                 ${isProcessing 
                   ? 'bg-gray-400 cursor-not-allowed' 
                   : 'bg-green-600 hover:bg-green-700 shadow-green-500/20 active:scale-95'
                 }`}
             >
               {isProcessing ? (
                 <>
                   <Loader2 className="animate-spin" size={24} />
                   Aguarde...
                 </>
               ) : (
                 <>
                   <CheckCircle size={24} />
                   Finalizar Compra
                 </>
               )}
             </button>
           </div>
        )}
      </div>
    </>
  );
};
