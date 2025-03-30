import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(value);
}

export function calculatePercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Get priority badge color
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get status badge color
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'not started':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Group expenses by category
export type ExpenseSummary = {
  category: string;
  amount: number;
  percentage: number;
};

export function groupExpensesByCategory(expenses: any[]): ExpenseSummary[] {
  if (!expenses || expenses.length === 0) return [];
  
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const groupedExpenses: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const category = expense.category;
    groupedExpenses[category] = (groupedExpenses[category] || 0) + expense.amount;
  });
  
  return Object.entries(groupedExpenses).map(([category, amount]) => ({
    category,
    amount,
    percentage: calculatePercentage(amount, totalAmount)
  }));
}

// Save data to local storage
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to local storage: ${error}`);
  }
}

// Load data from local storage
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from local storage: ${error}`);
    return defaultValue;
  }
}
