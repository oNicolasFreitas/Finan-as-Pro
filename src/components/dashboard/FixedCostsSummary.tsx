import React from 'react';
import { Card } from '../UI';
import { formatCurrency, getFixedCostsByPaymentMethod } from '../../lib/financeCalculations';
import { Expense, Category } from '../../types/finance';
import { CreditCard, Smartphone, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FixedCostsSummaryProps {
  expenses: Expense[];
  categories: Category[];
  monthStr: string;
}

const ExpenseItem: React.FC<{ exp: Expense, categories: Category[], monthStr: string }> = ({ exp, categories, monthStr }) => {
  const status = exp.statusByMonth[monthStr];
  const isPaid = status?.paid;
  const category = categories.find(c => c.id === exp.categoryId);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-white hover:border-gold-soft/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        )}>
          {isPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{exp.name}</p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ backgroundColor: category?.color + '20', color: category?.color }}>
              {category?.name}
            </span>
            <span>•</span>
            <span>{exp.paymentDate ? `Pago em ${exp.paymentDate}` : `Vence dia ${exp.dueDay}`}</span>
            {exp.cardName && ` • ${exp.cardName}`}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-zinc-900">{formatCurrency(exp.amount)}</p>
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isPaid ? "text-emerald-600" : "text-amber-600"
        )}>
          {isPaid ? 'Pago' : 'Pendente'}
        </p>
      </div>
    </div>
  );
};

export const FixedCostsSummary: React.FC<FixedCostsSummaryProps> = ({ expenses, categories, monthStr }) => {
  const { pix, card, totals } = getFixedCostsByPaymentMethod(expenses, monthStr);

  console.log('[Dashboard] FixedCostsSummary rendered', { totals });

  return (
    <Card title="Custos Fixos" subtitle="Despesas recorrentes separadas por método">
      <div className="space-y-8">
        {/* Pix Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900">
              <Smartphone size={18} className="text-gold" />
              <h4 className="font-bold">Pagos por Pix</h4>
            </div>
            <span className="text-sm font-bold text-gold">{formatCurrency(totals.pix)}</span>
          </div>
          <div className="space-y-2">
            {pix.map(exp => <ExpenseItem key={exp.id} exp={exp} categories={categories} monthStr={monthStr} />)}
            {pix.length === 0 && (
              <p className="text-xs text-zinc-400 italic py-2">Nenhum custo fixo por Pix.</p>
            )}
          </div>
        </div>

        {/* Card Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900">
              <CreditCard size={18} className="text-gold" />
              <h4 className="font-bold">Pagos no Cartão</h4>
            </div>
            <span className="text-sm font-bold text-gold">{formatCurrency(totals.card)}</span>
          </div>
          <div className="space-y-2">
            {card.map(exp => <ExpenseItem key={exp.id} exp={exp} categories={categories} monthStr={monthStr} />)}
            {card.length === 0 && (
              <p className="text-xs text-zinc-400 italic py-2">Nenhum custo fixo no Cartão.</p>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-500">Total de Custos Fixos</span>
          <span className="text-xl font-black text-zinc-900">{formatCurrency(totals.pix + totals.card)}</span>
        </div>
      </div>
    </Card>
  );
};
