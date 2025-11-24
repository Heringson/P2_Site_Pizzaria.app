import { OrderItem, BackendOrder, Category } from '../types';
import { calculateItemPrice } from '../utils';

const API_URL = 'http://localhost:3000/api/pedidos';
const LOCAL_STORAGE_KEY = 'pizzaone_offline_orders';

// Helper function to map backend data to frontend structure
const mapBackendToFrontend = (backendOrders: BackendOrder[]): OrderItem[] => {
  return backendOrders.map(bo => {
    let categoria: Category = 'pizza';
    let nome = 'Item Desconhecido';
    let quantidade = 1;
    let tamanho = 'Média';

    // Determine primary item type based on filled fields
    if (bo.pedidoPizza && bo.pedidoPizza !== 'N/A') {
      categoria = 'pizza';
      nome = bo.pedidoPizza;
      quantidade = bo.quantidadePizza;
      tamanho = bo.tamanhoPizza;
    } else if (bo.sobremesa && bo.sobremesa !== 'N/A') {
      categoria = 'sobremesa';
      nome = bo.sobremesa;
      quantidade = bo.quantidadeSobremesa;
      tamanho = 'Padrão';
    } else if (bo.pedidoBebida && bo.pedidoBebida !== 'N/A') {
      categoria = 'bebida';
      nome = bo.pedidoBebida;
      quantidade = bo.quantidadeBebidas;
      tamanho = 'Padrão';
    }

    return {
      id: bo.idPedido,
      itemId: 'backend-item', // Placeholder as backend doesn't store original product ID
      nome: nome,
      categoria: categoria,
      preco: bo.precoTotal ? bo.precoTotal / (quantidade || 1) : 0,
      quantidade: quantidade,
      tamanho: tamanho,
      tipoMassa: bo.bordaRecheada ? 'Recheada' : 'Tradicional',
      removedIngredients: [], // Backend doesn't store this detailed info in current schema
      cliente: bo.cliente,
      telefone: bo.telefone,
      endereco: bo.enderecoEntrega,
      formaPagamento: bo.formaPagamento,
      criadoEm: bo.horaPedido,
      precoTotalBackend: bo.precoTotal
    };
  });
};

export const api = {
  /**
   * Fetches all orders from the backend or LocalStorage if backend is offline
   */
  async getOrders(): Promise<OrderItem[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao buscar pedidos');
      
      const backendOrders: BackendOrder[] = await response.json();
      return mapBackendToFrontend(backendOrders);
    } catch (error) {
      console.warn('Backend unavailable, utilizing LocalStorage fallback.');
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const backendOrders: BackendOrder[] = stored ? JSON.parse(stored) : [];
      return mapBackendToFrontend(backendOrders);
    }
  },

  /**
   * Converts Frontend OrderItem to Backend format and POSTs it (or saves to LocalStorage)
   */
  async createOrder(order: Omit<OrderItem, 'id' | 'criadoEm'>): Promise<OrderItem | null> {
    // Construct payload based on category
    const payload: Partial<BackendOrder> = {
      cliente: order.cliente,
      telefone: order.telefone,
      enderecoEntrega: order.endereco,
      formaPagamento: order.formaPagamento,
      
      // Defaults
      pedidoPizza: 'N/A',
      tamanhoPizza: 'Média',
      quantidadePizza: 0,
      bordaRecheada: false,
      pedidoBebida: 'N/A',
      quantidadeBebidas: 0,
      sobremesa: 'N/A',
      quantidadeSobremesa: 0,
      
      itemExtra: order.removedIngredients.length > 0 
        ? `Sem: ${order.removedIngredients.join(', ')}` 
        : undefined,
        
      precoItemExtra: 0 
    };

    if (order.categoria === 'pizza') {
      payload.pedidoPizza = order.nome;
      payload.tamanhoPizza = order.tamanho;
      payload.quantidadePizza = order.quantidade;
      payload.bordaRecheada = order.tipoMassa === 'Recheada';
    } else if (order.categoria === 'sobremesa') {
      payload.sobremesa = order.nome;
      payload.quantidadeSobremesa = order.quantidade;
    } else if (order.categoria === 'bebida') {
      payload.pedidoBebida = order.nome;
      payload.quantidadeBebidas = order.quantidade;
    }

    const frontendPrice = calculateItemPrice(
      order.preco, 
      order.quantidade, 
      order.categoria, 
      order.tamanho, 
      order.tipoMassa
    );

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao criar pedido');

      const newBackendOrder: BackendOrder = await response.json();

      return {
        ...order,
        id: newBackendOrder.idPedido,
        criadoEm: new Date().toISOString(),
        precoTotalBackend: newBackendOrder.precoTotal
      };

    } catch (error) {
      console.warn('Backend unavailable, saving to LocalStorage.');
      
      const mockId = Math.floor(Math.random() * 100000);
      const now = new Date().toISOString();

      // Simulate Backend Object creation
      // CORREÇÃO APLICADA AQUI: O spread (...) vem antes das propriedades fixas
      const newBackendOrder: BackendOrder = {
        // 1. Spread vem primeiro para basear o objeto
        ...(payload as unknown as BackendOrder),

        // 2. Propriedades que NÃO podem ser sobrescritas pelo payload
        idPedido: mockId,
        horaPedido: now,
        precoTotal: frontendPrice,
        
        // 3. Garantias de campos obrigatórios (defaults)
        pedidoPizza: payload.pedidoPizza || 'N/A',
        pedidoBebida: payload.pedidoBebida || 'N/A',
        sobremesa: payload.sobremesa || 'N/A',
        tamanhoPizza: payload.tamanhoPizza || 'Média',
        quantidadePizza: payload.quantidadePizza || 0,
        quantidadeBebidas: payload.quantidadeBebidas || 0,
        quantidadeSobremesa: payload.quantidadeSobremesa || 0,
        bordaRecheada: payload.bordaRecheada || false,
      };

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(newBackendOrder);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));

      return {
        ...order,
        id: mockId,
        criadoEm: now,
        precoTotalBackend: frontendPrice
      };
    }
  },

  async deleteOrder(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend unavailable, deleting from LocalStorage.');
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const orders = JSON.parse(stored) as BackendOrder[];
        const filteredOrders = orders.filter(o => o.idPedido !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredOrders));
        return true;
      }
      return false;
    }
  }
};