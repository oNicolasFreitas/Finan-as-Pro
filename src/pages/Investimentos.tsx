import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, TrendingUp, Landmark, PieChart as PieIcon } from 'lucide-react';
import { Card, Button, Input, Select, LoadingState, EmptyState } from '../components/UI';
import { storage } from '../lib/storage';
import { formatCurrency, calculateTotalInvested, calculateInvestmentYield } from '../lib/financeCalculations';
import { InvestmentPosition, AssetType } from '../types/finance';
import { cn } from '../lib/utils';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Investimentos() {
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

  const [newInv, setNewInv] = useState<Partial<InvestmentPosition>>({
    assetType: 'renda_fixa',
    tickerOrName: '',
    brokerOrPlatform: '',
    quantity: 1,
    amountInvested: 0,
    monthlyYieldPercent: 0,
    notes: ''
  });

  if (loading) return <LoadingState message="Carregando seus investimentos..." />;
  if (!data) return <LoadingState />;

  const handleAdd = () => {
    if (!newInv.tickerOrName || !newInv.amountInvested) return;
    
    const inv: InvestmentPosition = {
      id: crypto.randomUUID(),
      assetType: newInv.assetType as AssetType,
      tickerOrName: newInv.tickerOrName!,
      brokerOrPlatform: newInv.brokerOrPlatform || 'Outros',
      quantity: Number(newInv.quantity),
      amountInvested: Number(newInv.amountInvested),
      monthlyYieldPercent: Number(newInv.monthlyYieldPercent),
      notes: newInv.notes
    };

    const updated = storage.update(prev => ({
      ...prev,
      investments: [...prev.investments, inv]
    }));
    
    setData(updated);
    setIsAdding(false);
    setNewInv({
      assetType: 'renda_fixa',
      tickerOrName: '',
      brokerOrPlatform: '',
      quantity: 1,
      amountInvested: 0,
      monthlyYieldPercent: 0,
      notes: ''
    });
    console.log('[Investimentos] Novo investimento adicionado', inv);
  };

  const handleDelete = (id: string) => {
    const updated = storage.update(prev => ({
      ...prev,
      investments: prev.investments.filter(i => i.id !== id)
    }));
    setData(updated);
  };

  const totalInvested = calculateTotalInvested(data.investments);
  const estimatedYield = calculateInvestmentYield(data.investments);

  const assetTypeLabels: Record<AssetType, string> = {
    fundo: 'Fundo',
    acao: 'Ação',
    cripto: 'Cripto',
    renda_fixa: 'Renda Fixa',
    outros: 'Outros'
  };

  const pieData = Object.entries(
    data.investments.reduce((acc, inv) => {
      acc[inv.assetType] = (acc[inv.assetType] || 0) + (inv.amountInvested * inv.quantity);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: assetTypeLabels[name as AssetType], value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Investimentos</h2>
          <p className="text-sm sm:text-base text-zinc-500">Acompanhe sua carteira e rendimentos.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 w-full sm:w-auto">
          <Plus size={20} />
          Novo Ativo
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Wallet className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Investido</p>
            <p className="text-xl font-bold text-zinc-900">{formatCurrency(totalInvested)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Rendimento Estimado (Mês)</p>
            <p className="text-xl font-bold text-zinc-900">{formatCurrency(estimatedYield)}</p>
          </div>
        </Card>
      </div>

      {isAdding && (
        <Card title="Adicionar Ativo" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome/Ticker</label>
              <Input 
                placeholder="Ex: PETR4 ou Tesouro Selic" 
                value={newInv.tickerOrName}
                onChange={e => setNewInv({...newInv, tickerOrName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select 
                value={newInv.assetType}
                onChange={e => setNewInv({...newInv, assetType: e.target.value as AssetType})}
              >
                <option value="renda_fixa">Renda Fixa</option>
                <option value="acao">Ação</option>
                <option value="fundo">Fundo</option>
                <option value="cripto">Cripto</option>
                <option value="outros">Outros</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Corretora/Plataforma</label>
              <Input 
                placeholder="Ex: XP, NuInvest" 
                value={newInv.brokerOrPlatform}
                onChange={e => setNewInv({...newInv, brokerOrPlatform: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade</label>
              <Input 
                type="number" 
                value={newInv.quantity}
                onChange={e => setNewInv({...newInv, quantity: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço Médio (R$)</label>
              <Input 
                type="number" 
                value={newInv.amountInvested || ''}
                onChange={e => setNewInv({...newInv, amountInvested: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yield Mensal (%)</label>
              <Input 
                type="number" 
                step="0.01"
                value={newInv.monthlyYieldPercent || ''}
                onChange={e => setNewInv({...newInv, monthlyYieldPercent: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar Ativo</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900">Sua Carteira</h3>
          {data.investments.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-zinc-500">Nenhum investimento cadastrado.</p>
            </Card>
          ) : (
            data.investments.map(inv => (
              <Card key={inv.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <Landmark className="text-zinc-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900">{inv.tickerOrName}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-700">{assetTypeLabels[inv.assetType]}</span>
                      <span>•</span>
                      <span>{inv.brokerOrPlatform}</span>
                      <span>•</span>
                      <span>Qtd: {inv.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-lg font-bold text-zinc-900">{formatCurrency(inv.amountInvested * inv.quantity)}</p>
                    <p className="text-xs text-emerald-600 font-medium">Yield: {inv.monthlyYieldPercent}% a.m.</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(inv.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card title="Distribuição" subtitle="Por tipo de ativo">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-zinc-600">{item.name}</span>
                  </div>
                  <span className="font-medium">
                    {totalInvested > 0 ? (((item.value as any) / (totalInvested as any)) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
