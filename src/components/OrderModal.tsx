import React, { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, User, MapPin, Phone, Settings, FileText } from 'lucide-react';
import { Product, OrderItem } from '../types';
import { calculateItemPrice, formatCurrency } from '../utils';

interface OrderModalProps {
  isOpen: boolean;
  product: Product | null;
  editingOrder: OrderItem | null;
  onClose: () => void;
  onConfirm: (orderData: Omit<OrderItem, 'id' | 'criadoEm'>) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, product, editingOrder, onClose, onConfirm }) => {
  // --- STATES ---
  const [quantidade, setQuantidade] = useState(1);
  const [tamanho, setTamanho] = useState('Média');
  const [tipoMassa, setTipoMassa] = useState('Tradicional');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpf, setCpf] = useState(''); // Estado local para armazenar o CPF digitado
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  // Determina o produto alvo
  const targetProduct = product || (editingOrder ? { 
    nome: editingOrder.nome, 
    preco: editingOrder.preco, 
    categoria: editingOrder.categoria, 
    id: editingOrder.itemId,
    img: '',
    ingredientes: [] 
  } as Product : null);

  // --- USE EFFECT (Carregar dados ao editar) ---
  useEffect(() => {
    if (isOpen) {
      if (editingOrder) {
        setQuantidade(editingOrder.quantidade);
        setTamanho(editingOrder.tamanho);
        setTipoMassa(editingOrder.tipoMassa || 'Tradicional');
        setRemovedIngredients(editingOrder.removedIngredients || []);
        setCliente(editingOrder.cliente);
        setTelefone(editingOrder.telefone);
        setEndereco(editingOrder.endereco);
        
        // AQUI: Carrega o 'cpfNota' se estiver editando um pedido existente
        // (Adicionei uma verificação de segurança caso no banco antigo esteja como 'cpf')
        setCpf(editingOrder.cpfNota || (editingOrder as any).cpf || ''); 
        
        setFormaPagamento(editingOrder.formaPagamento);
      } else {
        // Resetar para novo pedido
        setQuantidade(1);
        setTamanho(targetProduct?.categoria === 'bebida' ? 'Padrão' : 'Média');
        setTipoMassa('Tradicional');
        setRemovedIngredients([]);
        setCpf(''); // Limpa o campo CPF
      }
    }
  }, [isOpen, editingOrder, targetProduct?.categoria]);

  if (!isOpen || !targetProduct) return null;

  const handleConfirm = () => {
    if (!cliente.trim() || !telefone.trim() || !endereco.trim()) {
      alert('Por favor, preencha os dados obrigatórios do cliente.');
      return;
    }

    // --- ON CONFIRM (Enviando como cpfNota) ---
    onConfirm({
      itemId: targetProduct.id,
      nome: targetProduct.nome,
      categoria: targetProduct.categoria,
      preco: targetProduct.preco,
      quantidade,
      tamanho,
      tipoMassa,
      removedIngredients,
      cliente,
      telefone,
      endereco,
      cpfNota: cpf, // <--- AQUI: O valor do estado 'cpf' é enviado na chave 'cpfNota'
      formaPagamento
    });
  };

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const total = calculateItemPrice(
    targetProduct.preco,
    quantidade,
    targetProduct.categoria,
    tamanho,
    tipoMassa
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{targetProduct.nome}</h2>
            <p className="text-primary font-medium flex items-center gap-2">
              {targetProduct.categoria.toUpperCase()} 
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Base: {formatCurrency(targetProduct.preco)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quantity & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center dark:text-white">{quantidade}</span>
                <button 
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho</label>
              <select 
                 value={tamanho}
                 onChange={(e) => setTamanho(e.target.value)}
                 className="w-full p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-shadow"
              >
                {targetProduct.categoria === 'pizza' ? (
                  <>
                    <option value="Pequena">Pequena (x0.8)</option>
                    <option value="Média">Média (Padrão)</option>
                    <option value="Grande">Grande (x1.2)</option>
                    <option value="Família">Família (x1.4)</option>
                  </>
                ) : targetProduct.categoria === 'bebida' ? (
                  <>
                     <option value="Padrão">Padrão</option>
                     <option value="Grande">Grande (+50%)</option>
                  </>
                ) : (
                  <option value="Padrão">Padrão</option>
                )}
              </select>
            </div>
          </div>

          {/* Customizations Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <Settings size={20} className="text-primary" />
              Personalização
            </h3>
            
            {/* Pizza Crust */}
            {targetProduct.categoria === 'pizza' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Massa</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Fina', 'Tradicional', 'Recheada'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTipoMassa(type)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        tipoMassa === type 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {type} {type === 'Recheada' && <span className="block text-[10px] opacity-80">+ R$ 5,00</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Toggle */}
            {product && product.ingredientes && product.ingredientes.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingredientes</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Desmarque para remover</p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredientes.map((ing) => (
                    <button
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 transition-all ${
                        !removedIngredients.includes(ing)
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 decoration-slice'
                      }`}
                    >
                      {!removedIngredients.includes(ing) ? <CheckCircle size={14} /> : <X size={14} />}
                      <span className={removedIngredients.includes(ing) ? 'line-through opacity-70' : ''}>{ing}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Section */}
          <div className="pt-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
              <User size={20} className="text-primary" />
              Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative md:col-span-2">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nome Completo" 
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  placeholder="Telefone" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Input do CPF */}
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="CPF (Opcional na Nota)" 
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="relative md:col-span-2">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <textarea 
                  placeholder="Endereço de entrega" 
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  rows={2}
                  className="w-full pl-10 p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>
          </div>

           {/* Payment Section */}
           <div className="pt-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
              <DollarSign size={20} className="text-primary" />
              Pagamento
            </h3>
             <select 
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full p-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="PIX">PIX</option>
              </select>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
             <span className="text-sm text-gray-500 dark:text-gray-400">Total Estimado</span>
             <span className="text-3xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
          
          <button 
            onClick={handleConfirm}
            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/30 text-lg"
          >
            <CheckCircle size={22} />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};