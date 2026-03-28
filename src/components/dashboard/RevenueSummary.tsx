import React from 'react';
import { Card } from '../UI';
import { formatCurrency, getRevenueByCategory } from '../../lib/financeCalculations';
import { Income, Category } from '../../types/finance';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

interface RevenueSummaryProps {
  incomes: Income[];
  categories: Category[];
  monthStr: string;
}

export const RevenueSummary: React.FC<RevenueSummaryProps> = ({ incomes, categories, monthStr }) => {
  const categoryTotals = getRevenueByCategory(incomes, monthStr);
  const totalRevenue = Object.values(categoryTotals).reduce((acc, val) => acc + val, 0);

  console.log('[Dashboard] RevenueSummary rendered', { totalRevenue, categoryTotals });

  return (
    <Card title="Receitas" subtitle="Resumo de entradas por categoria">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gold-soft/10 rounded-2xl border border-gold-soft/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Receita Total</p>
              <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(categoryTotals).map(([catId, amount]) => {
            const category = categories.find(c => c.id === catId);
            const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
            const color = category?.color || '#D4AF37';
            const label = category?.name || 'Outros';
            
            return (
              <div key={catId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-zinc-600 font-medium">{label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 block">{formatCurrency(amount)}</span>
                    <span className="text-xs text-zinc-400">{percent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className="h-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(categoryTotals).length === 0 && (
            <p className="text-sm text-zinc-400 italic text-center py-4">Nenhuma receita registrada para este mês.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
