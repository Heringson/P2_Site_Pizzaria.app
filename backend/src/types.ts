// backend/src/types.ts

export type Tamanho = "Pequena" | "Média" | "Grande" | "Família" | "Padrão";
export type FormaPagamento = "Dinheiro" | "Cartão" | "PIX";
// backend/src/types.ts

// ... (mantenha os types Tamanho e FormaPagamento)

export interface PizzariaEntrada {
  // ... (mantenha os campos antigos: cliente, telefone, etc...)
  
  // ADICIONE ESTES NOVOS CAMPOS:
  cpfNota?: string;      // CPF do cliente
  nfeStatus?: string;    // Ex: "Pendente", "Emitida"
  nfeUrl?: string;       // Link do PDF da nota
}
export interface PizzariaEntrada {
  idPedido?: number; // Opcional ao criar, Obrigatório ao ler
  cliente: string;
  telefone: string;
  
  pedidoPizza: string;
  pedidoBebida: string;
  sobremesa: string;
  
  tamanhoPizza: string; // String para aceitar variações caso mude a regra
  quantidadePizza: number;
  bordaRecheada: boolean;
  quantidadeBebidas: number;
  quantidadeSobremesa: number;
  
  enderecoEntrega: string;
  horaPedido: string;
  formaPagamento: string;
  
  // CAMPOS NOVOS PARA O "ULTIMATE FRONTEND"
  itemExtra?: string;      // Ex: "Sem: Cebola"
  precoItemExtra?: number; 
  precoTotal: number;
  
  horaSaida?: string; // Usado apenas no histórico/CSV
}