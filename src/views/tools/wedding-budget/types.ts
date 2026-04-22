export type DayAssignment = 'Day 1' | 'Day 2' | 'Both';

export interface LineItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
  day: DayAssignment;
  isCustom: boolean;
  paid: number;
}

export interface Category {
  id: string;
  name: string;
  items: LineItem[];
}

export interface Scenario {
  id: string;
  name: string;
  categories: Category[];
  budgetTarget: number;
}

export interface TodoItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  dueDate?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  day: DayAssignment;
  date: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface BudgetState {
  scenarios: Scenario[];
  activeScenarioId: string;
  compareMode: boolean;
  compareScenarioIds: string[];
  todos: TodoItem[];
  venues: Venue[];
}

export const GUEST_COUNT = 300;
export const STORAGE_KEY = 'wedding-budget-state';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

let counter = 0;
export const uid = (): string => `${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 7)}`;
