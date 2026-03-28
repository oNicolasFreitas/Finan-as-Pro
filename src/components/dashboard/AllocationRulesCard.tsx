import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../UI';
import { formatCurrency, getAllocationRulesSummary, validateAllocationRulesTotal } from '../../lib/financeCalculations';
import { AllocationRule, AllocationRuleType } from '../../types/finance';
import { PieChart as PieIcon, Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { AllocationRuleForm } from '../forms/AllocationRuleForm';

interface AllocationRulesCardProps {
  rules: AllocationRule[];
  totalIncome: number;
  onUpdate: (rules: AllocationRule[]) => void;
}

export const AllocationRulesCard: React.FC<AllocationRulesCardProps> = ({ rules, totalIncome, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<AllocationRule>>({
    name: '',
    percent: 0,
    active: true,
  });

  const summary = getAllocationRulesSummary(totalIncome, rules);
  const { total: totalPercent, isValid, remaining } = validateAllocationRulesTotal(rules);

  console.log('[AllocationRules] Rendered', { totalPercent, isValid, rulesCount: rules.length });

  const handleSave = () => {
    if (!newRule.name || !newRule.percent) return;

    let updatedRules: AllocationRule[];
    if (editingId) {
      updatedRules = rules.map(r => r.id === editingId ? { ...r, ...newRule } as AllocationRule : r);
    } else {
      const rule: AllocationRule = {
        ...newRule,
        id: crypto.randomUUID(),
      } as AllocationRule;
      updatedRules = [...rules, rule];
    }

    const validation = validateAllocationRulesTotal(updatedRules);
    if (!validation.isValid) {
      alert(`A soma dos percentuais (${validation.total}%) ultrapassa 100%!`);
      return;
    }

    onUpdate(updatedRules);
    setIsAdding(false);
    setEditingId(null);
    setNewRule({ name: '', percent: 0, active: true });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta regra?')) {
      onUpdate(rules.filter(r => r.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    onUpdate(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <Card 
      title="Distribuição da Receita" 
      subtitle="Regras dinâmicas de alocação"
      action={
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="gap-2">
          <Plus size={16} /> Nova Regra
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status Header */}
        <div className={cn(
          "p-4 rounded-2xl border flex items-center justify-between",
          isValid ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-rose-50 border-rose-100 text-rose-900"
        )}>
          <div className="flex items-center gap-3">
            {isValid ? <CheckCircle2 className="text-emerald-600" /> : <AlertCircle className="text-rose-600" />}
            <div>
              <p className="text-sm font-bold">Total Alocado: {totalPercent}%</p>
              <p className="text-xs opacity-80">
                {isValid ? `Disponível: ${remaining}%` : `Excedente: ${Math.abs(remaining)}%`}
              </p>
            </div>
          </div>
          {!isValid && <span className="text-xs font-black uppercase tracking-widest">Ajuste Necessário</span>}
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group p-4 rounded-xl border transition-all",
                  rule.active ? "bg-white border-zinc-100" : "bg-zinc-50 border-zinc-200 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      rule.active ? "" : "bg-zinc-200 text-zinc-500"
                    )} style={rule.active ? { backgroundColor: rule.color + '20', color: rule.color } : {}}>
                      <PieIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{rule.name}</h4>
                      {rule.description && <p className="text-[10px] text-zinc-400">{rule.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingId(rule.id);
                        setNewRule(rule);
                        setIsAdding(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-gold transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div 
                      onClick={() => toggleActive(rule.id)}
                      className={cn(
                        "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                        !rule.active && "bg-zinc-300"
                      )}
                      style={rule.active ? { backgroundColor: rule.color } : {}}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        rule.active ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                  <span className="text-lg font-black text-zinc-900">{rule.percent}%</span>
                  <span className="text-sm font-medium" style={{ color: rule.active ? rule.color : undefined }}>{formatCurrency(totalIncome * (rule.percent / 100))}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {rules.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl">
              <p className="text-zinc-400 italic">Nenhuma regra de alocação definida.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <AllocationRuleForm 
              title={editingId ? 'Editar Regra' : 'Nova Regra de Alocação'}
              rule={newRule}
              onChange={setNewRule}
              onSave={handleSave}
              onCancel={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
            />
          </motion.div>
        </div>
      )}
    </Card>
  );
};
