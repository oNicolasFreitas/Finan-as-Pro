import React from 'react';
import { Card } from '../UI';
import { formatCurrency, getInvestmentsGroupedByType, getInvestmentsTotalYield, calculateTotalInvested } from '../../lib/financeCalculations';
import { InvestmentPosition } from '../../types/finance';
import { TrendingUp, Wallet, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InvestmentsSummaryProps {
  investments: InvestmentPosition[];
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  acao: 'Ações',
  fundo: 'Fundos',
  cripto: 'Cripto',
  renda_fixa: 'Renda Fixa',
  outros: 'Outros'
};

export const InvestmentsSummary: React.FC<InvestmentsSummaryProps> = ({ investments }) => {
  const totalInvested = calculateTotalInvested(investments);
  const totalYield = getInvestmentsTotalYield(investments);
  const grouped = getInvestmentsGroupedByType(investments);

  console.log('[Investments] Summary rendered', { totalInvested, totalYield });

  return (
    <Card title="Investimentos" subtitle="Resumo da sua carteira e rendimentos">
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-900 rounded-2xl text-white">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Wallet size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">Total Investido</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20">
            <div className="flex items-center gap-2 text-gold mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Rendimento Mensal Est.</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalYield)}</p>
          </div>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <PieIcon size={16} className="text-gold" />
            Alocação por Tipo
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(grouped).map(([type, data]) => {
              const percent = totalInvested > 0 ? (data.total / totalInvested) * 100 : 0;
              return (
                <div key={type} className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">{ASSET_TYPE_LABELS[type] || type}</span>
                    <span className="text-xs font-black text-gold">{percent.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{formatCurrency(data.total)}</p>
                  <div className="mt-2 h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Assets List (Top 5) */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-900">Principais Ativos</h4>
          <div className="space-y-2">
            {investments.sort((a, b) => (b.amountInvested * b.quantity) - (a.amountInvested * a.quantity)).slice(0, 5).map(inv => {
              const value = inv.amountInvested * inv.quantity;
              const yieldVal = value * (inv.monthlyYieldPercent / 100);
              return (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-50 hover:border-gold-soft/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-[10px]">
                      {inv.tickerOrName.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{inv.tickerOrName}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{ASSET_TYPE_LABELS[inv.assetType] || inv.assetType} • {inv.quantity} un</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">{formatCurrency(value)}</p>
                    <div className="flex items-center justify-end gap-1 text-emerald-600">
                      <ArrowUpRight size={10} />
                      <span className="text-[10px] font-bold">+{formatCurrency(yieldVal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {investments.length === 0 && (
              <p className="text-sm text-zinc-400 italic text-center py-4">Nenhum investimento registrado.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
