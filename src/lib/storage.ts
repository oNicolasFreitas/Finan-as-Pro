import { FinanceData, Category } from '../types/finance';

const STORAGE_KEY = 'financas_pro_data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Moradia', color: '#3b82f6', iconName: 'Home', isDefault: true },
  { id: '2', name: 'Alimentação', color: '#ef4444', iconName: 'Utensils', isDefault: true },
  { id: '3', name: 'Transporte', color: '#f59e0b', iconName: 'Car', isDefault: true },
  { id: '4', name: 'Lazer', color: '#10b981', iconName: 'Smile', isDefault: true },
  { id: '5', name: 'Saúde', color: '#ec4899', iconName: 'HeartPulse', isDefault: true },
  { id: '6', name: 'Educação', color: '#8b5cf6', iconName: 'BookOpen', isDefault: true },
  { id: '7', name: 'Assinaturas', color: '#6366f1', iconName: 'CreditCard', isDefault: true },
  { id: '8', name: 'Compras', color: '#f43f5e', iconName: 'ShoppingBag', isDefault: true },
  { id: '9', name: 'Presentes', color: '#d946ef', iconName: 'Gift', isDefault: true },
  { id: '10', name: 'Impostos', color: '#64748b', iconName: 'FileText', isDefault: true },
  { id: '11', name: 'Outros', color: '#94a3b8', iconName: 'MoreHorizontal', isDefault: true },
];

const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-1', name: 'Salário', color: '#D4AF37', iconName: 'Briefcase', isDefault: true },
  { id: 'inc-2', name: 'Freelance', color: '#3b82f6', iconName: 'Code', isDefault: true },
  { id: 'inc-3', name: 'Vendas', color: '#10b981', iconName: 'Tag', isDefault: true },
  { id: 'inc-4', name: 'Rendimentos', color: '#8b5cf6', iconName: 'TrendingUp', isDefault: true },
  { id: 'inc-5', name: 'Outros', color: '#71717a', iconName: 'Plus', isDefault: true },
];

const INITIAL_DATA: FinanceData = {
  incomes: [],
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  incomeCategories: DEFAULT_INCOME_CATEGORIES,
  investments: [],
  snapshots: [],
  goals: [],
  allocationRules: [
    { id: '1', name: 'Contas a Pagar', percent: 60, active: true },
    { id: '2', name: 'Ofertas e Dízimos', percent: 10, active: true },
    { id: '3', name: 'Investimentos', percent: 15, active: true },
    { id: '4', name: 'Sonhos e Abudar', percent: 15, active: true },
  ],
};

export const storage = {
  getData: (): FinanceData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    try {
      const data = JSON.parse(stored);
      // Migration for old data
      if (!data.allocationRules || data.allocationRules.length === 0) {
        data.allocationRules = INITIAL_DATA.allocationRules;
      }
      if (!data.incomeCategories || data.incomeCategories.length === 0) {
        data.incomeCategories = INITIAL_DATA.incomeCategories;
      }
      // Clean up old principles if they exist
      if (data.principles) {
        delete data.principles;
      }
      return data;
    } catch (e) {
      console.error('[Storage] Error parsing data', e);
      return INITIAL_DATA;
    }
  },

  saveData: (data: FinanceData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  update: (updater: (data: FinanceData) => FinanceData) => {
    const current = storage.getData();
    const next = updater(current);
    storage.saveData(next);
    return next;
  },
};
