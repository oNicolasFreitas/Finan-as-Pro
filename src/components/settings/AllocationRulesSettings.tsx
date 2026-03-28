import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, Button, Input } from '../UI';
import { AllocationRule } from '../../types/finance';
import { calculateTotalAllocation, validateAllocationLimit } from '../../lib/financeCalculations';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AllocationRuleForm } from '../forms/AllocationRuleForm';

interface AllocationRulesSettingsProps {
  rules: AllocationRule[];
  onUpdate: (rules: AllocationRule[]) => void;
}

export const AllocationRulesSettings: React.FC<AllocationRulesSettingsProps> = ({ rules, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<AllocationRule>>({
    name: '',
    percent: 0,
    active: true,
  });

  const totalPercent = calculateTotalAllocation(rules);
  const isValid = totalPercent <= 100;
  const maxReached = rules.length >= 7;

  const handleSave = () => {
    if (!newRule.name || newRule.percent === undefined || newRule.percent <= 0) {
      alert('Por favor, preencha o nome e um percentual válido.');
      return;
    }

    let updatedRules: AllocationRule[];
    if (editingId) {
      updatedRules = rules.map(r => r.id === editingId ? { ...r, ...newRule } as AllocationRule : r);
    } else {
      if (maxReached) {
        alert('Limite máximo de 7 princípios atingido.');
        return;
      }
      const rule: AllocationRule = {
        ...newRule,
        id: crypto.randomUUID(),
        active: true
      } as AllocationRule;
      updatedRules = [...rules, rule];
    }

    if (calculateTotalAllocation(updatedRules) > 100) {
      alert('A soma das regras não pode ultrapassar 100%!');
      return;
    }

    onUpdate(updatedRules);
    setIsAdding(false);
    setEditingId(null);
    setNewRule({ name: '', percent: 0, active: true });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este princípio?')) {
      onUpdate(rules.filter(r => r.id !== id));
    }
  };

  return (
    <Card 
      title="Regras de Alocação (%)" 
      subtitle="Defina como sua receita deve ser distribuída (máx. 7 princípios)"
    >
      <div className="space-y-6">
        {/* Status Bar */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-zinc-500">Total Alocado</span>
            <span className={cn(
              "text-lg font-black",
              totalPercent > 100 ? "text-rose-600" : totalPercent === 100 ? "text-emerald-600" : "text-gold"
            )}>
              {totalPercent}%
            </span>
          </div>
          <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(totalPercent, 100)}%` }}
              className={cn(
                "h-full transition-all duration-500",
                totalPercent > 100 ? "bg-rose-500" : totalPercent === 100 ? "bg-emerald-500" : "bg-gold"
              )}
            />
          </div>
          {totalPercent > 100 && (
            <p className="text-[10px] text-rose-600 font-bold mt-2 flex items-center gap-1">
              <AlertCircle size={10} /> A soma das regras não pode ultrapassar 100%
            </p>
          )}
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-xl group hover:border-gold-soft/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-zinc-200 shadow-sm"
                    style={{ backgroundColor: rule.color || '#D4AF37' }}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-900">{rule.name}</h4>
                    {rule.description && <p className="text-[10px] text-zinc-400">{rule.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-gold">{rule.percent}%</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingId(rule.id);
                        setNewRule(rule);
                        setIsAdding(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-gold transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!maxReached ? (
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-6 gap-2 text-zinc-500 hover:text-gold hover:border-gold"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={18} /> Adicionar Princípio
            </Button>
          ) : (
            <div className="p-4 text-center border-2 border-dashed border-zinc-100 rounded-xl">
              <p className="text-xs text-zinc-400 font-medium">
                <AlertCircle size={14} className="inline mr-1" />
                Limite máximo de 7 princípios atingido
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <AllocationRuleForm 
              title={editingId ? 'Editar Princípio' : 'Novo Princípio'}
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
