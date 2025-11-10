import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { ClassFundModel } from '../models/ClassFund';

const router = Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Get all class fund transactions
router.get('/', (req: Request, res: Response) => {
  try {
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    
    if (classId && !isNaN(classId)) {
      const funds = ClassFundModel.getByClassId(classId);
      return res.json(funds);
    }

    const funds = ClassFundModel.getAll();
    res.json(funds);
  } catch (error) {
    console.error('Get class funds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class fund by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fund ID' });
    }

    const fund = ClassFundModel.getById(id);
    if (!fund) {
      return res.status(404).json({ error: 'Fund transaction not found' });
    }

    res.json(fund);
  } catch (error) {
    console.error('Get class fund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create class fund transaction
router.post(
  '/',
  [
    body('classId').isInt().withMessage('Valid class ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['deposit', 'withdrawal']).withMessage('Type must be deposit or withdrawal'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('reason').optional().isString(),
  ],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fund = ClassFundModel.create({
        classId: req.body.classId,
        amount: parseFloat(req.body.amount),
        type: req.body.type || 'deposit',
        date: req.body.date,
        reason: req.body.reason,
      });

      res.status(201).json(fund);
    } catch (error) {
      console.error('Create class fund error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete class fund transaction
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fund ID' });
    }

    const deleted = ClassFundModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Fund transaction not found' });
    }

    res.json({ message: 'Fund transaction deleted successfully' });
  } catch (error) {
    console.error('Delete class fund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

