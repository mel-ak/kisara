import { create } from 'zustand';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

interface FinanceState {
  transactions: any[];
  accounts: any[];
  categories: any[];
  totalBalance: number;
  monthlyStats: { income: number; expense: number };
  categoryStats: { name: string; amount: number; color: string }[];
  budgets: any[];
  insights: string[];
  goals: any[];
  fetchData: () => Promise<void>;
  addTransaction: (transaction: typeof schema.transactions.$inferInsert) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  addAccount: (account: typeof schema.accounts.$inferInsert) => Promise<void>;
  updateAccount: (id: number, data: Partial<typeof schema.accounts.$inferInsert>) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  addCategory: (category: typeof schema.categories.$inferInsert) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addBudget: (budget: typeof schema.budgets.$inferInsert) => Promise<void>;
  updateBudget: (id: number, data: Partial<typeof schema.budgets.$inferInsert>) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  addGoal: (goal: typeof schema.goals.$inferInsert) => Promise<void>;
  updateGoal: (id: number, data: Partial<typeof schema.goals.$inferInsert>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  accounts: [],
  categories: [],
  totalBalance: 0,
  monthlyStats: { income: 0, expense: 0 },
  categoryStats: [],
  budgets: [],
  insights: [],
  goals: [],
  fetchData: async () => {
    const trx = await db.query.transactions.findMany({
      orderBy: [desc(schema.transactions.date)],
      with: {
        category: true,
        account: true,
      },
      limit: 100,
    });
    const accs = await db.query.accounts.findMany();
    const cats = await db.query.categories.findMany();
    const buds = await db.query.budgets.findMany({
        with: { category: true }
    });
    const gls = await db.query.goals.findMany();
    
    // Calculate Monthly Stats
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    // Fetch all transactions for the current month.
    // We handle both seconds and milliseconds for robustness.
    const monthlyTrx = (await db.select().from(schema.transactions)).filter((t: any) => {
        const d = typeof t.date === 'number' ? t.date : (t.date as Date).getTime();
        const normalizedDate = d < 10000000000 ? d * 1000 : d; // Convert seconds to ms if needed
        return normalizedDate >= firstDay;
    });
    
    const stats = monthlyTrx.reduce((acc: any, curr: any) => {
        if (curr.type === 'INCOME') acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
    }, { income: 0, expense: 0 });

    // Category Stats & Budget Progress (Mapping by ID is safer)
    const catTotalMap = new Map<number, number>();
    monthlyTrx.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
        if (t.categoryId) {
            catTotalMap.set(t.categoryId, (catTotalMap.get(t.categoryId) || 0) + t.amount);
        }
    });

    const budgetsWithProgress = buds.map((b: any) => {
        const spent = catTotalMap.get(b.categoryId) || 0;
        return { ...b, spent, progress: b.amount > 0 ? spent / b.amount : 0 };
    });

    const colors = ['#6200ee', '#03dac4', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0'];
    const categoryStats = Array.from(catTotalMap.entries()).map(([id, amount]: any, index) => {
        const cat = cats.find((c: any) => c.id === id);
        return {
            name: cat?.name || 'Other',
            amount,
            color: colors[index % colors.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        };
    });

    const balance = accs.reduce((acc: any, curr: any) => acc + curr.balance, 0);

    // Rule-based Insights
    const insights = [];
    if (balance > 10000) insights.push("Great job! Your savings are growing.");
    if (stats.expense > stats.income && stats.income > 0) insights.push("Your spending exceeds your income this month. Consider cutting down.");
    budgetsWithProgress.forEach((b: any) => {
        if (b.progress > 0.8 && b.progress < 1) insights.push(`Alert: You've used ${Math.round(b.progress * 100)}% of your ${b.category?.name} budget.`);
        if (b.progress >= 1) insights.push(`Critical: ${b.category?.name} budget exceeded!`);
    });
    if (insights.length === 0) insights.push("Keep tracking your expenses for personalized insights.");
    
    set({ 
        transactions: trx, 
        accounts: accs, 
        categories: cats, 
        totalBalance: balance, 
        monthlyStats: stats, 
        categoryStats,
        budgets: budgetsWithProgress,
        insights,
        goals: gls
    });
  },
  addTransaction: async (data) => {
    await db.insert(schema.transactions).values(data).returning();
    if (data.accountId) {
        const amount = data.type === 'INCOME' ? data.amount : -data.amount;
        await db.update(schema.accounts)
            .set({ balance: sql`${schema.accounts.balance} + ${amount}` })
            .where(eq(schema.accounts.id, data.accountId));
    }
    await get().fetchData();
  },
  deleteTransaction: async (id) => {
    const trx = await db.query.transactions.findFirst({ where: eq(schema.transactions.id, id) });
    if (trx) {
        if (trx.accountId) {
            const amount = trx.type === 'INCOME' ? -trx.amount : trx.amount;
            await db.update(schema.accounts)
                .set({ balance: sql`${schema.accounts.balance} + ${amount}` })
                .where(eq(schema.accounts.id, trx.accountId));
        }
        await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
        await get().fetchData();
    }
  },
  addAccount: async (data) => {
    await db.insert(schema.accounts).values(data);
    await get().fetchData();
  },
  updateAccount: async (id, data) => {
    await db.update(schema.accounts).set(data).where(eq(schema.accounts.id, id));
    await get().fetchData();
  },
  deleteAccount: async (id) => {
    await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
    await get().fetchData();
  },
  addCategory: async (data) => {
    await db.insert(schema.categories).values(data);
    await get().fetchData();
  },
  deleteCategory: async (id) => {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
    await get().fetchData();
  },
  addBudget: async (data) => {
    await db.insert(schema.budgets).values(data);
    await get().fetchData();
  },
  updateBudget: async (id, data) => {
    await db.update(schema.budgets).set(data).where(eq(schema.budgets.id, id));
    await get().fetchData();
  },
  deleteBudget: async (id) => {
    await db.delete(schema.budgets).where(eq(schema.budgets.id, id));
    await get().fetchData();
  },
  addGoal: async (data) => {
    await db.insert(schema.goals).values(data);
    await get().fetchData();
  },
  updateGoal: async (id, data) => {
    await db.update(schema.goals).set(data).where(eq(schema.goals.id, id));
    await get().fetchData();
  },
  deleteGoal: async (id) => {
    await db.delete(schema.goals).where(eq(schema.goals.id, id));
    await get().fetchData();
  },
  clearAllData: async () => {
    await db.delete(schema.transactions);
    await db.delete(schema.accounts);
    await db.delete(schema.categories);
    await db.delete(schema.budgets);
    await db.delete(schema.goals);
    await get().fetchData();
  }
}));
