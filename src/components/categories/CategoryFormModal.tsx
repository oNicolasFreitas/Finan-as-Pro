import React, { useState, useEffect } from 'react';
import { Input, Button } from '../UI';
import { Category } from '../../types/finance';
import { ColorPicker } from '../ui/ColorPicker';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface CategoryFormModalProps {
  category?: Partial<Category>;
  onSave: (category: Partial<Category>) => void;
  onCancel: () => void;
  title: string;
  existingNames: string[];
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onSave,
  onCancel,
  title,
  existingNames
}) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#D4AF37');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === name.trim().toLowerCase() && n.toLowerCase() !== category?.name?.toLowerCase()
    );

    if (isDuplicate) {
      setError('Já existe uma categoria com este nome.');
      return;
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      setError('Cor HEX inválida.');
      return;
    }

    onSave({
      ...category,
      name: name.trim(),
      color,
      iconName: category?.iconName || 'Tag'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-zinc-900 mb-6">{title}</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Nome da Categoria"
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Cor da Categoria</label>
            <ColorPicker selectedColor={color} onSelect={setColor} />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Salvar Categoria
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
