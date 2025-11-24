
import React from 'react';
import { OrderItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { calculateItemPrice } from '../utils';

interface StatsDashboardProps {
  orders: OrderItem[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ orders }) => {
  if (orders.length === 0) return null;

  // Data Prep for Pie Chart (Categories)
  const categoryData = Object.values(orders.reduce((acc: Record<string, {name: string, value: number}>, curr) => {
    if (!acc[curr.categoria]) acc[curr.categoria] = { name: curr.categoria, value: 0 };
    acc[curr.categoria].value += curr.quantidade;
    return acc;
  }, {}));

  // Data Prep for Bar Chart (Revenue by Item)
  const revenueData = Object.values(orders.reduce((acc: Record<string, {name: string, revenue: number}>, curr) => {
    if (!acc[curr.nome]) acc[curr.nome] = { name: curr.nome, revenue: 0 };
    
    const price = calculateItemPrice(curr.preco, curr.quantidade, curr.categoria, curr.tamanho, curr.tipoMassa);

    acc[curr.nome].revenue += price;
    return acc;
  }, {})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const COLORS = ['#FF6B00', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="mt-12 mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-l-4 border-primary pl-4">
        Painel de Vendas
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Distribuição por Categoria</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Top 5 Receita (R$)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickFormatter={(val) => val.substring(0, 10) + '...'} />
                <YAxis stroke="#888" />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#FF6B00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
