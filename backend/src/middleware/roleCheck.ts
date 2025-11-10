import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import db from '../database/db';

export function requireRole(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Get user role from database
      const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.uid) as { role: string } | undefined;
      
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const requireAdmin = requireRole(['admin']);
export const requireStudent = requireRole(['student', 'admin']); // Admins can access student routes too

