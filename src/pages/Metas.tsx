import React, { useState, useEffect } from 'react';
import { Plus, Target, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Card, Button, Input, Select, LoadingState, EmptyState } from '../components/UI';
import { storage } from '../lib/storage';
import { formatCurrency } from '../lib/financeCalculations';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Goal } from '../types/finance';
import { cn } from '../lib/utils';

export default function Metas() {
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

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    targetAmount: 0,
    targetDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 3,
    currentAmount: 0,
    contributionRule: { type: 'fixed', value: 0 }
  });

  if (loading) return <LoadingState message="Carregando suas metas..." />;
  if (!data) return <LoadingState />;

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    
    const goal: Goal = {
      id: crypto.randomUUID(),
      title: newGoal.title!,
      targetAmount: Number(newGoal.targetAmount),
      targetDate: newGoal.targetDate!,
      priority: Number(newGoal.priority) as any,
      currentAmount: Number(newGoal.currentAmount),
      contributionRule: newGoal.contributionRule as any
    };

    const updated = storage.update(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
    
    setData(updated);
    setIsAdding(false);
    setNewGoal({
      title: '',
      targetAmount: 0,
      targetDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 3,
      currentAmount: 0,
      contributionRule: { type: 'fixed', value: 0 }
    });
    console.log('[Metas] Nova meta adicionada', goal);
  };

  const handleDelete = (id: string) => {
    const updated = storage.update(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
    setData(updated);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Metas</h2>
          <p className="text-sm sm:text-base text-zinc-500">Planeje seus sonhos e acompanhe o progresso.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 w-full sm:w-auto">
          <Plus size={20} />
          Nova Meta
        </Button>
      </header>

      {isAdding && (
        <Card title="Adicionar Meta" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do Sonho</label>
              <Input 
                placeholder="Ex: Viagem para Europa" 
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Alvo (R$)</label>
              <Input 
                type="number" 
                placeholder="0,00" 
                value={newGoal.targetAmount || ''}
                onChange={e => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Limite</label>
              <Input 
                type="date" 
                value={newGoal.targetDate}
                onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade (1-5)</label>
              <Select 
                value={newGoal.priority}
                onChange={e => setNewGoal({...newGoal, priority: Number(e.target.value) as any})}
              >
                <option value="1">1 - Baixa</option>
                <option value="2">2 - Média-Baixa</option>
                <option value="3">3 - Média</option>
                <option value="4">4 - Alta</option>
                <option value="5">5 - Urgente</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Já Guardado (R$)</label>
              <Input 
                type="number" 
                value={newGoal.currentAmount || ''}
                onChange={e => setNewGoal({...newGoal, currentAmount: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar Meta</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.goals.length === 0 ? (
          <Card className="md:col-span-2 text-center py-12">
            <p className="text-zinc-500">Nenhuma meta cadastrada ainda.</p>
          </Card>
        ) : (
          data.goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            
            return (
              <Card key={goal.id} className="group relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 text-white rounded-lg">
                      <Target size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{goal.title}</h4>
                      <p className="text-xs text-zinc-500">
                        Até {format(parseISO(goal.targetDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Progresso</span>
                    <span className="font-bold text-zinc-900">{progress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="h-3 bg-surface rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-gold transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Guardado</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Faltam</p>
                      <p className="text-sm font-bold text-zinc-900">{formatCurrency(remaining)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-zinc-400" />
                      <span className="text-xs text-zinc-500">Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      goal.priority >= 4 ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-600"
                    )}>
                      Prioridade {goal.priority}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
