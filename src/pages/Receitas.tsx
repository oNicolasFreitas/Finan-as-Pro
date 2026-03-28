import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { Card, Button, Input, Select, LoadingState, EmptyState } from '../components/UI';
import { storage } from '../lib/storage';
import { formatCurrency } from '../lib/financeCalculations';
import { format, addMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Income } from '../types/finance';
import { TrendingUp } from 'lucide-react';
import React, { useEffect } from 'react';

export default function Receitas() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(storage.getData());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const [newIncome, setNewIncome] = useState<Partial<Income>>({
    title: '',
    source: '',
    amount: 0,
    categoryId: '',
    dateReceived: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    recurrenceRule: 'monthly'
  });

  useEffect(() => {
    if (data && data.incomeCategories.length > 0 && !newIncome.categoryId) {
      setNewIncome(prev => ({ ...prev, categoryId: data.incomeCategories[0].id }));
    }
  }, [data]);

  if (loading) return <LoadingState message="Carregando suas receitas..." />;
  if (!data) return <LoadingState />;

  const handleAdd = () => {
    if (!newIncome.title || !newIncome.amount) return;
    
    const income: Income = {
      id: crypto.randomUUID(),
      title: newIncome.title!,
      source: newIncome.source || 'Geral',
      amount: Number(newIncome.amount),
      categoryId: newIncome.categoryId || data.incomeCategories[0]?.id || 'inc-5',
      dateReceived: newIncome.dateReceived!,
      isRecurring: !!newIncome.isRecurring,
      recurrenceRule: newIncome.recurrenceRule as any,
      projectionStart: newIncome.dateReceived,
      projectionEnd: format(addMonths(new Date(), 24), 'yyyy-MM-dd')
    };

    const updated = storage.update(prev => ({
      ...prev,
      incomes: [...prev.incomes, income]
    }));
    
    setData(updated);
    setIsAdding(false);
    setNewIncome({
      title: '',
      source: '',
      amount: 0,
      dateReceived: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      recurrenceRule: 'monthly'
    });
    console.log('[Receitas] Nova receita adicionada', income);
  };

  const handleDelete = (id: string) => {
    const updated = storage.update(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id)
    }));
    setData(updated);
    console.log('[Receitas] Receita removida', id);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Receitas</h2>
          <p className="text-sm sm:text-base text-zinc-500">Gerencie suas entradas e projeções futuras.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 w-full sm:w-auto">
          <Plus size={20} />
          Nova Receita
        </Button>
      </header>

      {isAdding && (
        <Card title="Adicionar Receita" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input 
                placeholder="Ex: Salário Mensal" 
                value={newIncome.title}
                onChange={e => setNewIncome({...newIncome, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fonte</label>
              <Input 
                placeholder="Ex: Empresa X" 
                value={newIncome.source}
                onChange={e => setNewIncome({...newIncome, source: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select 
                value={newIncome.categoryId}
                onChange={e => setNewIncome({...newIncome, categoryId: e.target.value})}
              >
                {data.incomeCategories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input 
                type="number" 
                placeholder="0,00" 
                value={newIncome.amount || ''}
                onChange={e => setNewIncome({...newIncome, amount: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Recebimento</label>
              <Input 
                type="date" 
                value={newIncome.dateReceived}
                onChange={e => setNewIncome({...newIncome, dateReceived: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="recurring"
                checked={newIncome.isRecurring}
                onChange={e => setNewIncome({...newIncome, isRecurring: e.target.checked})}
                className="w-4 h-4 rounded border-zinc-300"
              />
              <label htmlFor="recurring" className="text-sm font-medium">Receita Recorrente</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar Receita</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {data.incomes.length === 0 ? (
          <Card className="text-center py-12">
            <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-zinc-300" size={32} />
            </div>
            <p className="text-zinc-500">Nenhuma receita cadastrada ainda.</p>
          </Card>
        ) : (
          data.incomes.map(income => (
            <Card key={income.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold-soft/10 rounded-xl">
                  <TrendingUp className="text-gold" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900">{income.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>{income.source}</span>
                    <span>•</span>
                    <span>{format(parseISO(income.dateReceived), "dd 'de' MMMM", { locale: ptBR })}</span>
                    {income.isRecurring && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <Calendar size={14} /> Recorrente
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-lg font-bold text-zinc-900">{formatCurrency(income.amount)}</p>
                <button 
                  onClick={() => handleDelete(income.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card title="Projeção de Receitas" subtitle="Estimativa para os próximos 6 meses">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-6 py-3">Mês</th>
                <th className="px-6 py-3">Total Previsto</th>
                <th className="px-6 py-3">Fontes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[0, 1, 2, 3, 4, 5].map(offset => {
                const monthDate = addMonths(new Date(), offset);
                const monthStr = format(monthDate, 'yyyy-MM');
                const monthLabel = format(monthDate, 'MMMM yyyy', { locale: ptBR });
                
                const monthlyTotal = data.incomes.reduce((total, inc) => {
                  const incDate = parseISO(inc.dateReceived);
                  if (inc.isRecurring) return total + inc.amount;
                  if (format(incDate, 'yyyy-MM') === monthStr) return total + inc.amount;
                  return total;
                }, 0);

                return (
                  <tr key={monthStr} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 capitalize">{monthLabel}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(monthlyTotal)}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {data.incomes
                        .filter(inc => inc.isRecurring || format(parseISO(inc.dateReceived), 'yyyy-MM') === monthStr)
                        .map(inc => inc.title)
                        .join(', ') || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
