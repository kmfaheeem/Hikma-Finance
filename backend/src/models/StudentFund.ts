import db from '../database/db';

export interface StudentFund {
  id: number;
  studentId: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface CreateStudentFundData {
  studentId: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  reason?: string;
}

export const StudentFundModel = {
  getAll: (): StudentFund[] => {
    return db.prepare('SELECT * FROM studentFunds ORDER BY date DESC, createdAt DESC').all() as StudentFund[];
  },

  getByStudentId: (studentId: number): StudentFund[] => {
    return db.prepare('SELECT * FROM studentFunds WHERE studentId = ? ORDER BY date DESC, createdAt DESC')
      .all(studentId) as StudentFund[];
  },

  getById: (id: number): StudentFund | undefined => {
    return db.prepare('SELECT * FROM studentFunds WHERE id = ?').get(id) as StudentFund | undefined;
  },

  create: (data: CreateStudentFundData): StudentFund => {
    const stmt = db.prepare('INSERT INTO studentFunds (studentId, amount, type, date, reason) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(
      data.studentId,
      data.amount,
      data.type,
      data.date,
      data.reason || null
    );

    // Update student balance
    const balanceChange = data.type === 'deposit' ? data.amount : -data.amount;
    const { StudentModel } = require('./Student');
    StudentModel.updateBalance(data.studentId, balanceChange);

    return StudentFundModel.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, data: Partial<CreateStudentFundData>): StudentFund | undefined => {
    const existing = StudentFundModel.getById(id);
    if (!existing) return undefined;

    const { StudentModel } = require('./Student');
    const newStudentId = data.studentId !== undefined ? data.studentId : existing.studentId;
    const newAmount = data.amount !== undefined ? data.amount : existing.amount;
    const newType = data.type !== undefined ? data.type : existing.type;

    // Reverse the old transaction for the old student
    const oldBalanceChange = existing.type === 'deposit' ? -existing.amount : existing.amount;
    StudentModel.updateBalance(existing.studentId, oldBalanceChange);

    // If studentId changed, we've already reversed the old student's balance
    // Now apply the new transaction to the new student
    const newBalanceChange = newType === 'deposit' ? newAmount : -newAmount;
    StudentModel.updateBalance(newStudentId, newBalanceChange);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.studentId !== undefined) {
      updates.push('studentId = ?');
      values.push(data.studentId);
    }
    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(data.amount);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.reason !== undefined) {
      updates.push('reason = ?');
      values.push(data.reason);
    }

    if (updates.length === 0) {
      // Even if no updates, we've already modified balances, so return existing
      return existing;
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE studentFunds SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return StudentFundModel.getById(id);
  },

  delete: (id: number): boolean => {
    const existing = StudentFundModel.getById(id);
    if (!existing) return false;

    // Reverse the balance change
    const balanceChange = existing.type === 'deposit' ? -existing.amount : existing.amount;
    const { StudentModel } = require('./Student');
    StudentModel.updateBalance(existing.studentId, balanceChange);

    const stmt = db.prepare('DELETE FROM studentFunds WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

