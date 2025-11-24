import React, { useState, useEffect, useMemo } from 'react';
import { Search, Moon, Sun, ShoppingCart, Pizza, Coffee, IceCream, LayoutGrid, ChevronRight, Filter } from 'lucide-react';
import { CATALOGO } from './constants';
import { Category, OrderItem, Product } from './types';
import { ProductCard } from './components/ProductCard';
import { OrderModal } from './components/OrderModal';
import { OrderDrawer } from './components/OrderDrawer';
import { StatsDashboard } from './components/StatsDashboard';
import { api } from './services/api';

function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // App State
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);

  // Initialization Effects
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;

    // Fetch Orders from Backend
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const fetchedOrders = await api.getOrders();
    setOrders(fetchedOrders);
    setLoading(false);
  };

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  // Filter Logic
  const filteredCatalog = useMemo(() => {
    const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    return CATALOGO.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categoria === activeCategory;

      if (!matchesCategory) return false;

      if (terms.length === 0) return true;

      const searchableText = `
        ${item.nome} 
        ${item.categoria} 
        ${item.ingredientes ? item.ingredientes.join(' ') : ''}
      `.toLowerCase();
      
      return terms.every(term => searchableText.includes(term));
    });
  }, [activeCategory, searchTerm]);

  // Handlers
  const handleAddClick = (product: Product) => {
    setSelectedProduct(product);
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (orderData: Omit<OrderItem, 'id' | 'criadoEm'>) => {
    if (editingOrder) {
      alert("Edição direta não suportada no backend atual. Por favor, remova e adicione novamente.");
      setIsModalOpen(false);
      return;
    }

    setLoading(true); 
    
    // Chama a API que criamos
    const newOrder = await api.createOrder(orderData);
    
    if (newOrder) {
      // Adiciona o pedido retornado pelo SQL na lista da tela
      setOrders(prev => [newOrder as OrderItem, ...prev]);
      setIsModalOpen(false);
      if (!isDrawerOpen) setIsDrawerOpen(true);
    }
    setLoading(false);
  };

  // CORREÇÃO: O bloco de código duplicado que estava aqui foi removido.

  const handleRemoveOrder = async (id: number) => {
    if (window.confirm('Remover este pedido?')) {
      const success = await api.deleteOrder(id);
      if (success) {
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        alert('Erro ao remover pedido do servidor.');
      }
    }
  };

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
     if (newQuantity < 1) return;
     alert("Nota: A atualização de quantidade é visual. Para alterar no banco, remova e adicione novamente.");
     setOrders(prev => prev.map(o => o.id === id ? { ...o, quantidade: newQuantity } : o));
  };

  const handleEditOrder = (order: OrderItem) => {
    const originalProduct = CATALOGO.find(p => p.nome === order.nome); 
    
    setEditingOrder(order);
    setSelectedProduct(originalProduct || {
        id: 'temp',
        nome: order.nome,
        preco: order.preco,
        categoria: order.categoria,
        img: '',
        ingredientes: []
    }); 
    
    setIsModalOpen(true);
    setIsDrawerOpen(false);
  };

  const handleCheckout = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Pedido confirmado com sucesso!\n\nSeus ${orders.length} itens já foram enviados para a cozinha.`);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darker transition-colors duration-300 font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-primary p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform">
                <Pizza className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Pizza<span className="text-primary">One</span>
              </h1>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome ou ingredientes..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors group"
              >
                <ShoppingCart size={22} className="group-hover:text-primary transition-colors" />
                {orders.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full border-2 border-white dark:border-gray-900">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            O sabor que você <span className="text-primary">merece</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
             {loading ? 'Carregando cardápio e pedidos...' : 'Monte seu pedido ideal, com os ingredientes que você ama.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 sticky top-24 z-20 py-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}`}
          >
            <LayoutGrid size={18} />
            Todos
          </button>
          <button
            onClick={() => setActiveCategory('pizza')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === 'pizza' ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}`}
          >
            <Pizza size={18} />
            Pizzas
          </button>
          <button
            onClick={() => setActiveCategory('sobremesa')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === 'sobremesa' ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}`}
          >
            <IceCream size={18} />
            Sobremesas
          </button>
          <button
            onClick={() => setActiveCategory('bebida')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === 'bebida' ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}`}
          >
            <Coffee size={18} />
            Bebidas
          </button>
        </div>

        {/* Product Grid */}
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.map(item => (
              <ProductCard key={item.id} product={item} onAdd={handleAddClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <Filter size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Nenhum item encontrado</h3>
          </div>
        )}

        <StatsDashboard orders={orders} />

      </main>

      {/* Drawers & Modals */}
      <OrderDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        orders={orders}
        onEdit={handleEditOrder}
        onRemove={handleRemoveOrder}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />

      <OrderModal 
        isOpen={isModalOpen}
        product={selectedProduct}
        editingOrder={editingOrder}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
      />

    </div>
  );
}

export default App;