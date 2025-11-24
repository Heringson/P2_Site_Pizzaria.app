// src/types.ts

export type Category = 'pizza' | 'sobremesa' | 'bebida';

export interface Product {
  id: string;
  nome: string;
  preco: number;
  categoria: Category;
  img: string;
  ingredientes: string[];
}

export interface OrderItem {
  id: number;
  itemId: string;
  nome: string;
  categoria: Category;
  preco: number;
  quantidade: number;
  tamanho: string;
  tipoMassa: string;
  removedIngredients: string[];
  cliente: string;
  telefone: string;
  endereco: string;
  formaPagamento: string;
  criadoEm?: string;
  precoTotalBackend?: number;
}

// ATUALIZADO: Agora reflete 100% o que o backend envia (incluindo itemExtra)
export interface BackendOrder {
  idPedido: number;
  cliente: string;
  telefone: string;
  enderecoEntrega: string;
  formaPagamento: string;
  horaPedido: string;
  
  pedidoPizza: string;     // Pode vir 'N/A'
  pedidoBebida: string;    // Pode vir 'N/A'
  sobremesa: string;       // Pode vir 'N/A'
  
  tamanhoPizza: string;
  quantidadePizza: number;
  bordaRecheada: boolean;
  quantidadeBebidas: number;
  quantidadeSobremesa: number;
  
  precoTotal: number;
  itemExtra?: string;      // Adicionado: Para ler "Sem: Cebola"
  precoItemExtra?: number; // Adicionado
}