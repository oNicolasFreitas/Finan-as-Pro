import React from 'react';
import { Input, Button } from '../UI';
import { AllocationRule } from '../../types/finance';
import { ColorPicker } from '../ui/ColorPicker';

interface AllocationRuleFormProps {
  rule: Partial<AllocationRule>;
  onChange: (rule: Partial<AllocationRule>) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}

export const AllocationRuleForm: React.FC<AllocationRuleFormProps> = ({
  rule,
  onChange,
  onSave,
  onCancel,
  title
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-zinc-900 mb-6">{title}</h3>
      <div className="space-y-4">
        <Input 
          label="Nome do Princípio" 
          placeholder="Ex: Reserva de Emergência" 
          value={rule.name}
          onChange={e => onChange({...rule, name: e.target.value})}
        />
        <div className="relative">
          <Input 
            label="Percentual (%)" 
            type="number" 
            value={rule.percent}
            onChange={e => onChange({...rule, percent: Number(e.target.value)})}
          />
          <span className="absolute right-4 top-9 text-zinc-400">%</span>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Cor do Princípio</label>
          <ColorPicker 
            selectedColor={rule.color || '#D4AF37'} 
            onSelect={color => onChange({...rule, color})} 
          />
        </div>
        <Input 
          label="Descrição (Opcional)" 
          placeholder="Breve descrição..." 
          value={rule.description}
          onChange={e => onChange({...rule, description: e.target.value})}
        />
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={onSave}>
            Salvar Princípio
          </Button>
        </div>
      </div>
    </div>
  );
};
