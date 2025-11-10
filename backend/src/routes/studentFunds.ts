import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { StudentFundModel } from '../models/StudentFund';

const router = Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Get all student fund transactions
router.get('/', (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
    
    if (studentId && !isNaN(studentId)) {
      const funds = StudentFundModel.getByStudentId(studentId);
      return res.json(funds);
    }

    const funds = StudentFundModel.getAll();
    res.json(funds);
  } catch (error) {
    console.error('Get student funds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student fund by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fund ID' });
    }

    const fund = StudentFundModel.getById(id);
    if (!fund) {
      return res.status(404).json({ error: 'Fund transaction not found' });
    }

    res.json(fund);
  } catch (error) {
    console.error('Get student fund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create student fund transaction
router.post(
  '/',
  [
    body('studentId').isInt().withMessage('Valid student ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').isIn(['deposit', 'withdrawal']).withMessage('Type must be deposit or withdrawal'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('reason').optional().isString(),
  ],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fund = StudentFundModel.create({
        studentId: req.body.studentId,
        amount: parseFloat(req.body.amount),
        type: req.body.type,
        date: req.body.date,
        reason: req.body.reason,
      });

      res.status(201).json(fund);
    } catch (error) {
      console.error('Create student fund error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update student fund transaction
router.put(
  '/:id',
  [
    body('studentId').optional().isInt().withMessage('Valid student ID is required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['deposit', 'withdrawal']).withMessage('Type must be deposit or withdrawal'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    body('reason').optional().isString(),
  ],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid fund ID' });
      }

      const updateData: any = {};
      if (req.body.studentId !== undefined) updateData.studentId = req.body.studentId;
      if (req.body.amount !== undefined) updateData.amount = parseFloat(req.body.amount);
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.date !== undefined) updateData.date = req.body.date;
      if (req.body.reason !== undefined) updateData.reason = req.body.reason;

      const fund = StudentFundModel.update(id, updateData);
      if (!fund) {
        return res.status(404).json({ error: 'Fund transaction not found' });
      }

      res.json(fund);
    } catch (error) {
      console.error('Update student fund error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete student fund transaction
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fund ID' });
    }

    const deleted = StudentFundModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Fund transaction not found' });
    }

    res.json({ message: 'Fund transaction deleted successfully' });
  } catch (error) {
    console.error('Delete student fund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

