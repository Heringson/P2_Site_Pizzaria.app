// src/utils.ts

import { OrderItem, Product } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calculateItemPrice = (
  precoBase: number, 
  quantidade: number, 
  categoria: string, 
  tamanho: string, 
  tipoMassa?: string
): number => {
  let unitPrice = precoBase;

  if (categoria === 'pizza') {
    if (tamanho === 'Pequena') unitPrice *= 0.8;
    if (tamanho === 'Grande') unitPrice *= 1.2;
    if (tamanho === 'Família') unitPrice *= 1.4;
    if (tipoMassa === 'Recheada') unitPrice += 5;
  } 
  else if (categoria === 'bebida') {
    if (tamanho === 'Grande') unitPrice *= 1.5;
  }

  return unitPrice * quantidade;
};

// --- FUNÇÕES NOVAS NECESSÁRIAS PARA O API.TS ---

// Converte string do banco ("Sem: Cebola, Tomate") para array (['Cebola', 'Tomate'])
export const parseExtraToIngredients = (extraString?: string): string[] => {
  if (!extraString || !extraString.startsWith('Sem: ')) return [];
  return extraString.replace('Sem: ', '').split(',').map(s => s.trim());
};

// Converte array do front (['Cebola']) para string do banco ("Sem: Cebola")
export const formatIngredientsToExtra = (ingredients: string[]): string | undefined => {
  if (!ingredients || ingredients.length === 0) return undefined;
  return `Sem: ${ingredients.join(', ')}`;
};