import db from '../database/db';

export interface Student {
  id: number;
  name: string;
  email: string | null;
  accountBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  name: string;
  email?: string;
}

export const StudentModel = {
  getAll: (): Student[] => {
    return db.prepare('SELECT * FROM students ORDER BY name').all() as Student[];
  },

  getById: (id: number): Student | undefined => {
    return db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Student | undefined;
  },

  create: (data: CreateStudentData): Student => {
    const stmt = db.prepare('INSERT INTO students (name, email) VALUES (?, ?)');
    const result = stmt.run(data.name, data.email || null);
    return StudentModel.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, data: Partial<CreateStudentData>): Student | undefined => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }

    if (updates.length === 0) return StudentModel.getById(id);

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return StudentModel.getById(id);
  },

  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  updateBalance: (id: number, amount: number): void => {
    db.prepare('UPDATE students SET accountBalance = accountBalance + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(amount, id);
  },
};

