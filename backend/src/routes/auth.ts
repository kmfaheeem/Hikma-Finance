import { Router, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import db from '../database/db';

const router = Router();

// Get current user info
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    // First, try to find user by Firebase UID
    let user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(req.user!.uid) as {
      id: string;
      email: string;
      role: string;
    } | undefined;

    // If not found by UID, try to find by email (for seeded users)
    if (!user && req.user!.email) {
      user = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(req.user!.email) as {
        id: string;
        email: string;
        role: string;
      } | undefined;

      // If found by email, check if UID already exists for another user
      if (user) {
        const existingUID = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user!.uid);
        if (!existingUID) {
          // UID doesn't exist, update the user's ID to match Firebase UID
          db.prepare('UPDATE users SET id = ? WHERE email = ?').run(req.user!.uid, req.user!.email);
          user.id = req.user!.uid;
        } else if (existingUID && (existingUID as any).id !== user.id) {
          // UID exists for a different user - this shouldn't happen, but handle it
          console.warn(`Firebase UID ${req.user!.uid} already exists for a different user`);
          // Use the existing user with this UID
          user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(req.user!.uid) as {
            id: string;
            email: string;
            role: string;
          } | undefined;
        }
      }
    }

    // If still not found, create a new user (default to student role)
    if (!user) {
      // Determine role based on email pattern or default to student
      const email = req.user!.email || '';
      const role = email.includes('admin') ? 'admin' : 'student';
      
      db.prepare('INSERT INTO users (id, email, role) VALUES (?, ?, ?)').run(
        req.user!.uid,
        req.user!.email || '',
        role
      );

      user = {
        id: req.user!.uid,
        email: req.user!.email || '',
        role: role,
      };
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

