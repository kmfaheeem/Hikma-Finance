import db from '../database/db';

export interface ClassFund {
  id: number;
  classId: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface CreateClassFundData {
  classId: number;
  amount: number;
  type?: 'deposit' | 'withdrawal';
  date: string;
  reason?: string;
}

export const ClassFundModel = {
  getAll: (): ClassFund[] => {
    return db.prepare('SELECT * FROM classFunds ORDER BY date DESC, createdAt DESC').all() as ClassFund[];
  },

  getByClassId: (classId: number): ClassFund[] => {
    return db.prepare('SELECT * FROM classFunds WHERE classId = ? ORDER BY date DESC, createdAt DESC')
      .all(classId) as ClassFund[];
  },

  getById: (id: number): ClassFund | undefined => {
    return db.prepare('SELECT * FROM classFunds WHERE id = ?').get(id) as ClassFund | undefined;
  },

  create: (data: CreateClassFundData): ClassFund => {
    const type = data.type || 'deposit';
    const stmt = db.prepare('INSERT INTO classFunds (classId, amount, type, date, reason) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(
      data.classId,
      data.amount,
      type,
      data.date,
      data.reason || null
    );

    // Update class balance
    const balanceChange = type === 'deposit' ? data.amount : -data.amount;
    const { ClassModel } = require('./Class');
    ClassModel.updateBalance(data.classId, balanceChange);

    return ClassFundModel.getById(result.lastInsertRowid as number)!;
  },

  delete: (id: number): boolean => {
    const existing = ClassFundModel.getById(id);
    if (!existing) return false;

    // Reverse the balance change
    const balanceChange = existing.type === 'deposit' ? -existing.amount : existing.amount;
    const { ClassModel } = require('./Class');
    ClassModel.updateBalance(existing.classId, balanceChange);

    const stmt = db.prepare('DELETE FROM classFunds WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

