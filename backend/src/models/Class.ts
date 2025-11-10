import db from '../database/db';

export interface Class {
  id: number;
  name: string;
  accountBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  name: string;
}

export const ClassModel = {
  getAll: (): Class[] => {
    return db.prepare('SELECT * FROM classes ORDER BY name').all() as Class[];
  },

  getById: (id: number): Class | undefined => {
    return db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as Class | undefined;
  },

  create: (data: CreateClassData): Class => {
    const stmt = db.prepare('INSERT INTO classes (name) VALUES (?)');
    const result = stmt.run(data.name);
    return ClassModel.getById(result.lastInsertRowid as number)!;
  },

  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  updateBalance: (id: number, amount: number): void => {
    db.prepare('UPDATE classes SET accountBalance = accountBalance + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(amount, id);
  },
};

