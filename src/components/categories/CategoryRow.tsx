import React from 'react';
import { Category } from '../../types/finance';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onColorClick: (category: Category) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
  onColorClick
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-gold-soft/30 transition-all group shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onColorClick(category)}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: category.color }}
          title="Alterar cor"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900">{category.name}</span>
            {category.isDefault && (
              <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                Padrão
              </span>
            )}
          </div>
          {category.createdAt && (
            <span className="text-[10px] text-zinc-400">Criada em {new Date(category.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="p-2 text-zinc-400 hover:text-gold transition-colors"
          title="Editar nome"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(category)}
          disabled={category.isDefault}
          className={cn(
            "p-2 transition-colors",
            category.isDefault ? "text-zinc-200 cursor-not-allowed" : "text-zinc-400 hover:text-rose-500"
          )}
          title={category.isDefault ? "Categoria padrão não pode ser removida" : "Remover categoria"}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
