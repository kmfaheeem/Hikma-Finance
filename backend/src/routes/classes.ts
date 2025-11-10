import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { ClassModel } from '../models/Class';

const router = Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Get all classes
router.get('/', (req: Request, res: Response) => {
  try {
    const classes = ClassModel.getAll();
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    const classItem = ClassModel.getById(id);
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classItem);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create class
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Name is required')],
  (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const classItem = ClassModel.create({
        name: req.body.name,
      });

      res.status(201).json(classItem);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'Class with this name already exists' });
      }
      console.error('Create class error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete class
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    const deleted = ClassModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

