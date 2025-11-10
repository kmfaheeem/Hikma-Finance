import { Router, Request, Response } from 'express';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { requireStudent } from '../middleware/roleCheck';
import { StudentFundModel } from '../models/StudentFund';
import { ClassFundModel } from '../models/ClassFund';
import { StudentModel } from '../models/Student';
import { ClassModel } from '../models/Class';
import db from '../database/db';

const router = Router();

// All routes require authentication (students and admins can access)
router.use(verifyToken);

// Dashboard route - accessible to both admins and students
// Other routes (student-funds, class-funds) are for students (and admins via requireStudent)

// Get dashboard summary (accessible to both admins and students)
router.get('/dashboard', requireStudent, async (req: Request, res: Response) => {
  try {
    const students = StudentModel.getAll();
    const classes = ClassModel.getAll();
    const allStudentFunds = StudentFundModel.getAll();
    const allClassFunds = ClassFundModel.getAll();

    // Calculate totals
    const studentFundTotal = students.reduce((sum, s) => sum + s.accountBalance, 0);
    const classFundTotal = classes.reduce((sum, c) => sum + c.accountBalance, 0);

    // Calculate cash in/out
    const totalCashIn = allStudentFunds
      .filter(f => f.type === 'deposit')
      .reduce((sum, f) => sum + f.amount, 0) +
      allClassFunds
        .filter(f => f.type === 'deposit')
        .reduce((sum, f) => sum + f.amount, 0);

    const totalCashOut = allStudentFunds
      .filter(f => f.type === 'withdrawal')
      .reduce((sum, f) => sum + f.amount, 0) +
      allClassFunds
        .filter(f => f.type === 'withdrawal')
        .reduce((sum, f) => sum + f.amount, 0);

    res.json({
      studentFundTotal,
      classFundTotal,
      totalCashIn,
      totalCashOut,
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        accountBalance: s.accountBalance,
      })),
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student fund report (students and admins can access)
router.get('/student-funds', requireStudent, (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
    
    let funds;
    if (studentId && !isNaN(studentId)) {
      funds = StudentFundModel.getByStudentId(studentId);
    } else {
      funds = StudentFundModel.getAll();
    }

    // Include student names
    const fundsWithNames = funds.map(fund => {
      const student = StudentModel.getById(fund.studentId);
      return {
        ...fund,
        studentName: student?.name || 'Unknown',
      };
    });

    res.json(fundsWithNames);
  } catch (error) {
    console.error('Get student fund report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class fund report (students and admins can access)
router.get('/class-funds', requireStudent, (req: Request, res: Response) => {
  try {
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    
    let funds;
    if (classId && !isNaN(classId)) {
      funds = ClassFundModel.getByClassId(classId);
    } else {
      funds = ClassFundModel.getAll();
    }

    // Include class names
    const fundsWithNames = funds.map(fund => {
      const classItem = ClassModel.getById(fund.classId);
      return {
        ...fund,
        className: classItem?.name || 'Unknown',
      };
    });

    res.json(fundsWithNames);
  } catch (error) {
    console.error('Get class fund report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

