import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Card, Button, Input, Select } from '../UI';
import { Category, Expense } from '../../types/finance';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryFormModal } from '../categories/CategoryFormModal';
import { CategoryRow } from '../categories/CategoryRow';

interface CategoriesSettingsProps {
  title?: string;
  categories: Category[];
  expenses: any[];
  onUpdate: (categories: Category[], updatedExpenses?: any[]) => void;
}

export const CategoriesSettings: React.FC<CategoriesSettingsProps> = ({
  title = "Categorias de Gastos",
  categories,
  expenses,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [reattributeToId, setReattributeToId] = useState<string>('');

  const handleSave = (categoryData: Partial<Category>) => {
    let updatedCategories: Category[];
    if (editingCategory) {
      updatedCategories = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, ...categoryData } as Category : c
      );
      console.log('[Categories]', 'update', { id: editingCategory.id, ...categoryData });
    } else {
      const newCategory: Category = {
        ...categoryData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      } as Category;
      updatedCategories = [...categories, newCategory];
      console.log('[Categories]', 'create', { name: newCategory.name, color: newCategory.color });
    }

    onUpdate(updatedCategories);
    setIsAdding(false);
    setEditingCategory(null);
  };

  const handleDeleteAttempt = (category: Category) => {
    if (category.isDefault) return;

    const inUse = expenses.some((e) => e.categoryId === category.id);
    console.log('[Categories]', 'delete:attempt', { id: category.id, inUse });

    if (inUse) {
      setDeletingCategory(category);
      // Default reattribution to the first available category that isn't the one being deleted
      const fallback = categories.find((c) => c.id !== category.id);
      if (fallback) setReattributeToId(fallback.id);
    } else {
      if (confirm(`Tem certeza que deseja remover a categoria "${category.name}"?`)) {
        onUpdate(categories.filter((c) => c.id !== category.id));
        console.log('[Categories]', 'delete:success', { id: category.id });
      }
    }
  };

  const handleConfirmDeleteWithReattribution = () => {
    if (!deletingCategory || !reattributeToId) return;

    const updatedExpenses = expenses.map((e) =>
      e.categoryId === deletingCategory.id ? { ...e, categoryId: reattributeToId } : e
    );

    const updatedCategories = categories.filter((c) => c.id !== deletingCategory.id);

    onUpdate(updatedCategories, updatedExpenses);
    setDeletingCategory(null);
    setReattributeToId('');
    console.log('[Categories]', 'delete:success', { id: deletingCategory.id, reattributedTo: reattributeToId });
  };

  return (
    <Card
      title={title}
      subtitle="Gerencie as categorias e suas cores"
      action={
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="gap-2">
          <Plus size={16} /> Nova Categoria
        </Button>
      }
    >
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl">
            <p className="text-zinc-400 italic">Nenhuma categoria criada ainda.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAdding(true)}>
              Criar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <CategoryRow
                    category={cat}
                    onEdit={(c) => {
                      setEditingCategory(c);
                      setIsAdding(true);
                    }}
                    onDelete={handleDeleteAttempt}
                    onColorClick={(c) => {
                      setEditingCategory(c);
                      setIsAdding(true);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <CategoryFormModal
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          category={editingCategory || {}}
          onSave={handleSave}
          onCancel={() => {
            setIsAdding(false);
            setEditingCategory(null);
          }}
          existingNames={categories.map((c) => c.name)}
        />
      )}

      {/* Reattribution Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold">Categoria em Uso</h3>
            </div>

            <p className="text-sm text-zinc-600 mb-6">
              A categoria <strong>{deletingCategory.name}</strong> está sendo usada em despesas existentes.
              Para removê-la, você deve reatribuir essas despesas para outra categoria.
            </p>

            <div className="space-y-4">
              <Select
                label="Reatribuir despesas para:"
                value={reattributeToId}
                onChange={(e) => setReattributeToId(e.target.value)}
              >
                {categories
                  .filter((c) => c.id !== deletingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setDeletingCategory(null)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleConfirmDeleteWithReattribution}>
                  Reatribuir e Remover
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Card>
  );
};
