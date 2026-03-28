import { Income, Expense, FinanceData, InvestmentPosition, AllocationRule } from '../types/finance';
import { 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  addMonths, 
  format,
  isBefore,
  isAfter,
  startOfDay
} from 'date-fns';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getRevenueTotalByMonth = (incomes: Income[], monthStr: string) => {
  const targetDate = parseISO(`${monthStr}-01`);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  return incomes.reduce((total, income) => {
    const incomeDate = parseISO(income.dateReceived);
    
    if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
      return total + income.amount;
    }

    if (income.isRecurring) {
      const projStart = income.projectionStart ? parseISO(income.projectionStart) : incomeDate;
      const projEnd = income.projectionEnd ? parseISO(income.projectionEnd) : addMonths(new Date(), 24);
      
      if (isWithinInterval(targetDate, { start: startOfMonth(projStart), end: endOfMonth(projEnd) })) {
        return total + income.amount;
      }
    }

    return total;
  }, 0);
};

export const getRevenueByCategory = (incomes: Income[], monthStr: string) => {
  const targetDate = parseISO(`${monthStr}-01`);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  const totals: Record<string, number> = {};

  incomes.forEach(income => {
    const incomeDate = parseISO(income.dateReceived);
    let apply = false;

    if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
      apply = true;
    } else if (income.isRecurring) {
      const projStart = income.projectionStart ? parseISO(income.projectionStart) : incomeDate;
      const projEnd = income.projectionEnd ? parseISO(income.projectionEnd) : addMonths(new Date(), 24);
      if (isWithinInterval(targetDate, { start: startOfMonth(projStart), end: endOfMonth(projEnd) })) {
        apply = true;
      }
    }

    if (apply) {
      const cat = income.categoryId || 'inc-5';
      totals[cat] = (totals[cat] || 0) + income.amount;
    }
  });

  return totals;
};

export const getFixedCostsByPaymentMethod = (expenses: Expense[], monthStr: string) => {
  const pix: Expense[] = [];
  const card: Expense[] = [];
  const other: Expense[] = [];

  expenses.forEach(exp => {
    if (exp.paymentMethod === 'pix') pix.push(exp);
    else if (exp.paymentMethod === 'card') card.push(exp);
    else other.push(exp);
  });

  const sortByDate = (a: Expense, b: Expense) => {
    const dateA = a.paymentDate || `2024-01-${String(a.dueDay).padStart(2, '0')}`;
    const dateB = b.paymentDate || `2024-01-${String(b.dueDay).padStart(2, '0')}`;
    return dateA.localeCompare(dateB);
  };

  return {
    pix: pix.sort(sortByDate),
    card: card.sort(sortByDate),
    other: other.sort(sortByDate),
    totals: {
      pix: pix.reduce((acc, e) => acc + e.amount, 0),
      card: card.reduce((acc, e) => acc + e.amount, 0),
      other: other.reduce((acc, e) => acc + e.amount, 0),
      all: expenses.reduce((acc, e) => acc + e.amount, 0)
    }
  };
};

export const calculateTotalAllocation = (rules: AllocationRule[]) => {
  return rules.filter(r => r.active).reduce((acc, r) => acc + r.percent, 0);
};

export const validateAllocationLimit = (rules: AllocationRule[]) => {
  const total = calculateTotalAllocation(rules);
  return total <= 100;
};

export const getAllocationValue = (rule: AllocationRule, totalRevenue: number) => {
  return totalRevenue * (rule.percent / 100);
};

export const getAllocationRulesSummary = (totalIncome: number, rules: AllocationRule[]) => {
  return rules
    .filter(r => r.active)
    .map(rule => ({
      ...rule,
      calculatedValue: getAllocationValue(rule, totalIncome)
    }));
};

export const validateAllocationRulesTotal = (rules: AllocationRule[]) => {
  const total = calculateTotalAllocation(rules);
  return {
    total,
    isValid: total <= 100,
    remaining: 100 - total
  };
};

export const getInvestmentsGroupedByType = (investments: InvestmentPosition[]) => {
  const groups: Record<string, { total: number, items: InvestmentPosition[] }> = {};

  investments.forEach(inv => {
    if (!groups[inv.assetType]) {
      groups[inv.assetType] = { total: 0, items: [] };
    }
    groups[inv.assetType].total += (inv.amountInvested * inv.quantity);
    groups[inv.assetType].items.push(inv);
  });

  return groups;
};

export const getInvestmentsTotalYield = (investments: InvestmentPosition[]) => {
  return investments.reduce((acc, inv) => {
    const yieldAmount = (inv.amountInvested * inv.quantity) * (inv.monthlyYieldPercent / 100);
    return acc + yieldAmount;
  }, 0);
};

export const calculateMonthlyIncome = getRevenueTotalByMonth;

export const calculateMonthlyExpenses = (expenses: Expense[], monthStr: string) => {
  const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const paid = expenses.reduce((acc, exp) => {
    const status = exp.statusByMonth[monthStr];
    return status?.paid ? acc + (status.paidAmount ?? exp.amount) : acc;
  }, 0);
  
  return {
    total,
    paid,
    toPay: total - paid,
    count: expenses.length,
    paidCount: expenses.filter(e => e.statusByMonth[monthStr]?.paid).length
  };
};

export const calculateInvestmentYield = getInvestmentsTotalYield;

export const calculateTotalInvested = (investments: InvestmentPosition[]) => {
  return investments.reduce((acc, inv) => acc + (inv.amountInvested * inv.quantity), 0);
};
