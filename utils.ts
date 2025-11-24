
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

  // Modificadores de tamanho para Pizza
  if (categoria === 'pizza') {
    if (tamanho === 'Pequena') unitPrice *= 0.8;
    if (tamanho === 'Grande') unitPrice *= 1.2;
    if (tamanho === 'Família') unitPrice *= 1.4;
    
    // Modificador de massa
    if (tipoMassa === 'Recheada') unitPrice += 5;
  } 
  // Modificadores de tamanho para Bebida
  else if (categoria === 'bebida') {
    if (tamanho === 'Grande') unitPrice *= 1.5;
  }

  return unitPrice * quantidade;
};
