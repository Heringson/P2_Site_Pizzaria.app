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
  removedIngredients: string[]; // O Frontend usa Array
  cliente: string;
  telefone: string;
  endereco: string;
  formaPagamento: string;
  criadoEm?: string;
  precoTotalBackend?: number;
}

// --- AQUI ESTAVA O ERRO ---
// Atualize esta interface para incluir os novos campos
export interface BackendOrder {
  idPedido: number;
  cliente: string;
  telefone: string;
  enderecoEntrega: string;
  formaPagamento: string;
  horaPedido: string;
  
  pedidoPizza: string;
  pedidoBebida: string;
  sobremesa: string;
  
  tamanhoPizza: string;
  quantidadePizza: number;
  bordaRecheada: boolean;
  quantidadeBebidas: number;
  quantidadeSobremesa: number;
  
  precoTotal: number;

  // NOVOS CAMPOS (Isso vai corrigir o erro no api.ts)
  itemExtra?: string;       // O Banco manda String (ex: "Sem: Cebola")
  precoItemExtra?: number;
}
export interface OrderItem {
  // ... campos existentes
  cpfNota?: string;  // NOVO
  nfeUrl?: string;   // NOVO
}
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}