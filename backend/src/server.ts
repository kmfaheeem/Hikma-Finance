import express from 'express';
dotenv.config(); // <--- THIS WAS IN THE WRONG PLACE. IT'S NOW MOVED.
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, seedDatabase } from './database/db';
import authRoutes from './routes/auth';
import studentsRoutes from './routes/students';
import classesRoutes from './routes/classes';
import studentFundsRoutes from './routes/studentFunds';
import classFundsRoutes from './routes/classFunds';
import reportsRoutes from './routes/reports';



const app = express();
// ...
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();
seedDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/student-funds', studentFundsRoutes);
app.use('/api/class-funds', classFundsRoutes);
app.use('/api/reports', reportsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

