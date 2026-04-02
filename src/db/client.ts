import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

let db: any;
let expoDb: SQLiteDatabase | null = null;

// Helper to get or open the database
const getDatabase = () => {
    if (Platform.OS === 'web') return null;
    if (expoDb) return expoDb;
    
    try {
        expoDb = openDatabaseSync('kisara.db');
        return expoDb;
    } catch (e) {
        console.error('[kisara] Failed to open database:', e);
        return null;
    }
};

const internalDb = getDatabase();

if (internalDb) {
    db = drizzle(internalDb, { schema });
} else {
    // Provide a mock or alert for web users
    db = {
        query: {
            transactions: { findMany: async () => [] },
            accounts: { findMany: async () => [] },
            categories: { findMany: async () => [] },
            budgets: { findMany: async () => [] },
        },
        insert: () => ({ values: () => ({ returning: async () => [] }) }),
        update: () => ({ set: () => ({ where: async () => {} }) }),
        select: () => ({ from: () => ({ where: async () => [] }) }),
    };
}

export { db };

// Helper to run migrations or seed data initially
export const initializeDb = async () => {
    console.log('[kisara] initializing db...');
    const dbInstance = getDatabase();
    if (Platform.OS === 'web' || !dbInstance) return;
    
    try {
        // Ensure tables exist (Separated to avoid potential multi-statement issues)
        console.log('[kisara] checking/creating tables...');
        
        await dbInstance.execAsync(`PRAGMA foreign_keys = ON;`);
        
        await dbInstance.execAsync(`CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );`);
        
        await dbInstance.execAsync(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            type TEXT NOT NULL
        );`);
        
        await dbInstance.execAsync(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            date INTEGER NOT NULL,
            note TEXT,
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
            account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );`);
        
        await dbInstance.execAsync(`CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            period TEXT NOT NULL,
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
        );`);

        await dbInstance.execAsync(`CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL NOT NULL DEFAULT 0,
            deadline INTEGER,
            icon TEXT,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );`);

        // Check if categories exist
        const catCount = await db.select().from(schema.categories);
        console.log('[kisara] found', catCount.length, 'categories');
        
        if (catCount.length === 0) {
            console.log('[kisara] seeding categories...');
            await db.insert(schema.categories).values([
                { name: 'Salary', type: 'INCOME', icon: 'banknote' },
                { name: 'Business', type: 'INCOME', icon: 'briefcase' },
                { name: 'Food', type: 'EXPENSE', icon: 'utensils' },
                { name: 'Transport', type: 'EXPENSE', icon: 'bus' },
                { name: 'Rent', type: 'EXPENSE', icon: 'home' },
                { name: 'Entertainment', type: 'EXPENSE', icon: 'tv' },
                { name: 'Other', type: 'EXPENSE', icon: 'plus' },
            ]);
        }
        
        // Check if default accounts exist
        const accCount = await db.select().from(schema.accounts);
        console.log('[kisara] found', accCount.length, 'accounts');
        
        if (accCount.length === 0) {
            console.log('[kisara] seeding accounts...');
            await db.insert(schema.accounts).values([
                { name: 'Cash', type: 'CASH', balance: 0 },
                { name: 'Telebirr', type: 'WALLET', balance: 0 },
                { name: 'CBE Birr', type: 'BANK', balance: 0 },
            ]);
        }
    } catch (e) {
        console.error('[kisara] db initialization failed:', e);
    }
};
