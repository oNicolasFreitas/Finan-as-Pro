import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, CreditCard, Wallet, Banknote, Settings } from 'lucide-react';
import { Card, Button, Input, Select, LoadingState, EmptyState } from '../components/UI';
import { storage } from '../lib/storage';
import { formatCurrency } from '../lib/financeCalculations';
import { format } from 'date-fns';
import { Expense, PaymentMethod } from '../types/finance';
import { cn } from '../lib/utils';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Despesas() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(storage.getData());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: '',
    categoryId: '',
    amount: 0,
    dueDay: 1,
    paymentMethod: 'card',
    vendor: '',
    isSubscription: false
  });

  useEffect(() => {
    if (data && data.categories.length > 0 && !newExpense.categoryId) {
      setNewExpense(prev => ({ ...prev, categoryId: data.categories[0].id }));
    }
  }, [data]);

  if (loading) return <LoadingState message="Carregando suas despesas..." />;
  if (!data) return <LoadingState />;

  const handleAdd = () => {
    if (!newExpense.name || !newExpense.amount) return;
    if (newExpense.paymentMethod === 'card' && !newExpense.cardName) {
      alert('Por favor, informe o nome do cartão.');
      return;
    }
    
    const expense: Expense = {
      id: crypto.randomUUID(),
      name: newExpense.name!,
      categoryId: newExpense.categoryId!,
      amount: Number(newExpense.amount),
      dueDay: Number(newExpense.dueDay),
      paymentMethod: newExpense.paymentMethod as PaymentMethod,
      paymentDate: newExpense.paymentDate,
      cardName: newExpense.paymentMethod === 'card' ? newExpense.cardName : undefined,
      vendor: newExpense.vendor || 'Outros',
      isSubscription: !!newExpense.isSubscription,
      statusByMonth: {}
    };

    const updated = storage.update(prev => ({
      ...prev,
      expenses: [...prev.expenses, expense]
    }));
    
    setData(updated);
    setIsAdding(false);
    setNewExpense({
      name: '',
      categoryId: data.categories[0]?.id || '',
      amount: 0,
      dueDay: 1,
      paymentMethod: 'card',
      cardName: '',
      paymentDate: '',
      vendor: '',
      isSubscription: false
    });
    console.log('[Despesas] Nova despesa adicionada', expense);
  };

  const togglePaid = (id: string) => {
    const updated = storage.update(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => {
        if (exp.id === id) {
          const currentStatus = exp.statusByMonth[currentMonth]?.paid || false;
          return {
            ...exp,
            statusByMonth: {
              ...exp.statusByMonth,
              [currentMonth]: {
                paid: !currentStatus,
                paidAt: !currentStatus ? new Date().toISOString() : undefined,
                paidAmount: exp.amount
              }
            }
          };
        }
        return exp;
      })
    }));
    setData(updated);
  };

  const handleDelete = (id: string) => {
    const updated = storage.update(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
    setData(updated);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return <CreditCard size={16} />;
      case 'pix': return <Banknote size={16} />;
      case 'cash': return <Wallet size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Despesas</h2>
          <p className="text-sm sm:text-base text-zinc-500">Controle seus custos fixos e assinaturas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/configuracoes')} className="gap-2 flex-1 sm:flex-none">
            <Settings size={18} />
            <span className="hidden xs:inline">Categorias</span>
          </Button>
          <Button onClick={() => setIsAdding(true)} className="gap-2 flex-1 sm:flex-none">
            <Plus size={20} />
            Nova Despesa
          </Button>
        </div>
      </header>

      {isAdding && (
        <Card title="Adicionar Despesa" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                placeholder="Ex: Aluguel" 
                value={newExpense.name}
                onChange={e => setNewExpense({...newExpense, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select 
                value={newExpense.categoryId}
                onChange={e => setNewExpense({...newExpense, categoryId: e.target.value})}
              >
                {data.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input 
                type="number" 
                placeholder="0,00" 
                value={newExpense.amount || ''}
                onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dia do Vencimento</label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={newExpense.dueDay}
                onChange={e => setNewExpense({...newExpense, dueDay: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Método de Pagamento</label>
              <Select 
                value={newExpense.paymentMethod}
                onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value as PaymentMethod})}
              >
                <option value="card">Cartão de Crédito</option>
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
                <option value="transfer">Transferência</option>
              </Select>
            </div>
            {newExpense.paymentMethod === 'card' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cartão</label>
                <Input 
                  placeholder="Ex: Nubank Black" 
                  value={newExpense.cardName}
                  onChange={e => setNewExpense({...newExpense, cardName: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Pagamento (Opcional)</label>
              <Input 
                type="date" 
                value={newExpense.paymentDate}
                onChange={e => setNewExpense({...newExpense, paymentDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Onde Paga (Banco/Local)</label>
              <Input 
                placeholder="Ex: Nubank" 
                value={newExpense.vendor}
                onChange={e => setNewExpense({...newExpense, vendor: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar Despesa</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {data.expenses.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-zinc-500">Nenhuma despesa cadastrada.</p>
          </Card>
        ) : (
          data.expenses
            .sort((a, b) => a.dueDay - b.dueDay)
            .map(exp => {
              const category = data.categories.find(c => c.id === exp.categoryId);
              const isPaid = exp.statusByMonth[currentMonth]?.paid;

              return (
                <Card key={exp.id} className={cn(
                  "flex items-center justify-between group transition-all",
                  isPaid ? "bg-zinc-50/50 opacity-75" : "bg-white"
                )}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => togglePaid(exp.id)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isPaid ? "text-gold bg-gold-soft/10" : "text-zinc-300 hover:text-gold/50 bg-zinc-50"
                      )}
                    >
                      {isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div>
                      <h4 className={cn("text-sm sm:text-base font-semibold", isPaid ? "text-zinc-500 line-through" : "text-zinc-900")}>
                        {exp.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: category?.color + '20', color: category?.color }}>
                          {category?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getMethodIcon(exp.paymentMethod)} {exp.vendor}
                        </span>
                        <span>•</span>
                        <span>Dia {exp.dueDay}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6">
                    <p className={cn("text-base sm:text-lg font-bold", isPaid ? "text-zinc-400" : "text-zinc-900")}>
                      {formatCurrency(exp.amount)}
                    </p>
                    <button 
                      onClick={() => handleDelete(exp.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}
