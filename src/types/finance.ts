import { LucideIcon } from 'lucide-react';

export type PaymentMethod = 'card' | 'pix' | 'cash' | 'transfer';
export type AssetType = 'fundo' | 'acao' | 'cripto' | 'renda_fixa' | 'outros';
export type IncomeCategory = 'salario' | 'freelance' | 'vendas' | 'rendimentos' | 'outros';
export type AllocationRuleType = 'fixed' | 'variable' | 'optional';

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string; // Lucide icon name
  isDefault?: boolean;
  createdAt?: string;
}

export interface Income {
  id: string;
  title: string;
  source: string;
  amount: number;
  dateReceived: string; // ISO string
  categoryId: string; // Reference to Category
  isRecurring: boolean;
  recurrenceRule?: 'monthly' | 'biweekly';
  projectionStart?: string;
  projectionEnd?: string;
}

export interface Expense {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  dueDay: number; // 1-31
  paymentMethod: PaymentMethod;
  paymentDate?: string; // Specific date if paid
  cardName?: string; // Required if paymentMethod === 'card'
  vendor: string;
  isSubscription: boolean;
  statusByMonth: Record<string, { // YYYY-MM
    paid: boolean;
    paidAt?: string;
    paidAmount?: number;
  }>;
}

export interface InvestmentPosition {
  id: string;
  assetType: AssetType;
  tickerOrName: string;
  brokerOrPlatform: string;
  quantity: number;
  amountInvested: number; // Cost basis
  monthlyYieldPercent: number; // e.g., 0.8
  notes?: string;
}

export interface InvestmentSnapshot {
  id: string;
  month: string; // YYYY-MM
  totalInvested: number;
  estimatedValue: number;
  yieldValue: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string;
  priority: 1 | 2 | 3 | 4 | 5;
  currentAmount: number;
  contributionRule: {
    type: 'fixed' | 'percent';
    value: number;
  };
}

export interface BudgetPrinciples {
  billsPercent: number; // Default 60
  tithesPercent: number; // Default 10
  investMinPercent: number; // Default 10
  investMaxPercent: number; // Default 15
  dreamsPercent: number; // Default 15
  selectedInvestPercent: number; // User choice between 10-15
}

export interface AllocationRule {
  id: string;
  name: string;
  percent: number;
  color?: string;
  description?: string;
  active: boolean;
}

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  categories: Category[]; // Expense categories
  incomeCategories: Category[]; // Income categories
  investments: InvestmentPosition[];
  snapshots: InvestmentSnapshot[];
  goals: Goal[];
  allocationRules: AllocationRule[];
}
