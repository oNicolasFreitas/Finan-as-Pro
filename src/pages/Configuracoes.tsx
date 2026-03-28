import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCcw, Info, PieChart as PieIcon } from 'lucide-react';
import { Card, Button, Input, Select, LoadingState } from '../components/UI';
import { storage } from '../lib/storage';
import { AllocationRule, FinanceData, Category, Expense } from '../types/finance';
import { cn } from '../lib/utils';
import { AllocationRulesSettings } from '../components/settings/AllocationRulesSettings';
import { CategoriesSettings } from '../components/settings/CategoriesSettings';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { calculateTotalAllocation } from '../lib/financeCalculations';

export default function Configuracoes() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedData = storage.getData();
      setData(storedData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) return <LoadingState message="Carregando configurações..." />;

  const handleUpdateRules = (newRules: AllocationRule[]) => {
    setData(prev => prev ? { ...prev, allocationRules: newRules } : null);
  };

  const handleUpdateCategories = (newCategories: Category[], updatedExpenses?: Expense[]) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        categories: newCategories,
        expenses: updatedExpenses || prev.expenses
      };
    });
  };

  const handleUpdateIncomeCategories = (newCategories: Category[], updatedIncomes?: any[]) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        incomeCategories: newCategories,
        incomes: updatedIncomes || prev.incomes
      };
    });
  };

  const handleSave = () => {
    if (!data) return;
    setIsSaving(true);
    
    const total = calculateTotalAllocation(data.allocationRules);
    if (total > 100) {
      alert('A soma das porcentagens não pode ultrapassar 100%!');
      setIsSaving(false);
      return;
    }

    storage.update(prev => ({
      ...prev,
      allocationRules: data.allocationRules,
      categories: data.categories,
      incomeCategories: data.incomeCategories,
      expenses: data.expenses,
      incomes: data.incomes
    }));
    
    setTimeout(() => {
      setIsSaving(false);
      console.log('[Configuracoes] Ajustes salvos com sucesso');
    }, 500);
  };

  const resetToDefault = () => {
    if (confirm('Deseja resetar para as regras padrão?')) {
      const defaults: AllocationRule[] = [
        { id: '1', name: 'Contas a Pagar', percent: 60, active: true },
        { id: '2', name: 'Ofertas e Dízimos', percent: 10, active: true },
        { id: '3', name: 'Investimentos', percent: 15, active: true },
        { id: '4', name: 'Sonhos e Abudar', percent: 15, active: true },
      ];
      handleUpdateRules(defaults);
    }
  };

  const chartData = data.allocationRules
    .filter(r => r.active && r.percent > 0)
    .map(r => ({ name: r.name, value: r.percent, color: r.color || '#D4AF37' }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Configurações</h2>
          <p className="text-sm sm:text-base text-zinc-500">Ajuste as regras do seu orçamento e categorias.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={resetToDefault} className="gap-2 flex-1 sm:flex-none">
            <RefreshCcw size={18} />
            <span className="hidden xs:inline">Resetar</span>
          </Button>
          <Button onClick={handleSave} className="gap-2 flex-1 sm:flex-none" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Ajustes'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AllocationRulesSettings 
            rules={data.allocationRules}
            onUpdate={handleUpdateRules}
          />

          <Card title="Visualização da Distribuição" subtitle="Gráfico de alocação atual">
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Percentual']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 italic">
                  Nenhuma regra ativa para exibir.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <CategoriesSettings 
            title="Categorias de Despesas"
            categories={data.categories}
            expenses={data.expenses}
            onUpdate={handleUpdateCategories}
          />

          <CategoriesSettings 
            title="Categorias de Receitas"
            categories={data.incomeCategories}
            expenses={data.incomes}
            onUpdate={handleUpdateIncomeCategories}
          />
        </div>
      </div>
    </div>
  );
}
