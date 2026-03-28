import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '../components/UI';
import { storage } from '../lib/storage';
import { 
  formatCurrency, 
  getRevenueTotalByMonth,
} from '../lib/financeCalculations';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { LoadingState, EmptyState } from '../components/UI';
import { RevenueSummary } from '../components/dashboard/RevenueSummary';
import { FixedCostsSummary } from '../components/dashboard/FixedCostsSummary';
import { AllocationRulesCard } from '../components/dashboard/AllocationRulesCard';
import { InvestmentsSummary } from '../components/dashboard/InvestmentsSummary';
import { AllocationRule } from '../types/finance';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Dashboard] Initializing data fetch');
    const timer = setTimeout(() => {
      setData(storage.getData());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateRules = (newRules: AllocationRule[]) => {
    console.log('[Dashboard] Updating allocation rules', newRules);
    const updated = storage.update(prev => ({
      ...prev,
      allocationRules: newRules
    }));
    setData(updated);
  };

  if (loading) return <LoadingState message="Carregando seu dashboard..." />;
  if (!data) return <LoadingState />;

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyIncome = getRevenueTotalByMonth(data.incomes, currentMonth);
  const hasData = data.incomes.length > 0 || data.expenses.length > 0 || data.investments.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>
          <p className="text-zinc-500">Bem-vindo ao seu controle financeiro premium.</p>
        </header>
        <EmptyState 
          icon={Wallet}
          title="Nenhum dado encontrado"
          description="Comece adicionando suas receitas e despesas para visualizar seu dashboard."
          action={{ label: 'Adicionar Receita', onClick: () => window.location.href = '/receitas' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <header>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Dashboard Geral</h2>
        <p className="text-sm sm:text-base text-zinc-500">Visão consolidada da sua saúde financeira.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco 1: Receitas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RevenueSummary incomes={data.incomes} categories={data.incomeCategories} monthStr={currentMonth} />
        </motion.div>

        {/* Bloco 2: Custos Fixos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FixedCostsSummary expenses={data.expenses} categories={data.categories} monthStr={currentMonth} />
        </motion.div>

        {/* Bloco 3: Distribuição da Receita */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AllocationRulesCard 
            rules={data.allocationRules} 
            totalIncome={monthlyIncome} 
            onUpdate={handleUpdateRules}
          />
        </motion.div>

        {/* Bloco 4: Investimentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InvestmentsSummary investments={data.investments} />
        </motion.div>
      </div>
    </div>
  );
}
