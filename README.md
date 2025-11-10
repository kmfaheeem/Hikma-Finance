# Finance Account Website

A full-stack finance management application for managing student and class funds with role-based access control.

## Features

- **User Roles**: Admin (full access) and Student (reports only)
- **Student Funds**: Manage individual student account transactions
- **Class Funds**: Manage collective class account transactions
- **Dashboard**: View totals, cash flow, and student accounts
- **Reports**: Comprehensive reporting for student and class funds
- **Responsive Design**: Works on all device types

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Firebase Authentication
- **API**: RESTful API with Express

## Project Structure

```
Finance-Web/
├── frontend/          # Next.js application
├── backend/           # Express API server
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
DATABASE_PATH=./finance.db
```

**Firebase Service Account**: 
1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate a new private key
3. Copy the JSON content and paste it as a single line in `FIREBASE_SERVICE_ACCOUNT` (escape quotes)

**Development Mode**: If you don't have a service account, you can set only `FIREBASE_PROJECT_ID` for basic setup (token verification may not work properly).

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Firebase Configuration**:
1. Go to Firebase Console > Project Settings > General
2. Under "Your apps", add a web app if you haven't already
3. Copy the Firebase configuration values

### 3. Firebase Authentication Setup

1. Enable Email/Password authentication in Firebase Console
2. Create users in Firebase Authentication:
   - **Admins**: Create 3 admin users (e.g., admin1@finance.com, admin2@finance.com, admin3@finance.com)
   - **Students**: Create 30 student users (e.g., student1@finance.com, student2@finance.com, etc.)

   **Note**: The application will automatically link Firebase users to database users based on email matching. Users with emails containing "admin" will be assigned admin role, others will be students.

### 4. Run the Application

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Database

The SQLite database is automatically created and initialized on first run. The database includes:

- **users**: User accounts with roles
- **students**: Student accounts
- **classes**: Class accounts
- **studentFunds**: Student fund transactions
- **classFunds**: Class fund transactions

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user info

### Students (Admin only)
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes (Admin only)
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `DELETE /api/classes/:id` - Delete class

### Student Funds (Admin only)
- `GET /api/student-funds` - Get all student fund transactions
- `POST /api/student-funds` - Create transaction
- `PUT /api/student-funds/:id` - Update transaction
- `DELETE /api/student-funds/:id` - Delete transaction

### Class Funds (Admin only)
- `GET /api/class-funds` - Get all class fund transactions
- `POST /api/class-funds` - Create transaction
- `DELETE /api/class-funds/:id` - Delete transaction

### Reports (Admin and Student)
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/student-funds` - Get student fund report
- `GET /api/reports/class-funds` - Get class fund report

## User Roles

### Admin
- Full access to all pages
- Can add/edit/delete students and classes
- Can manage student and class funds
- Can view reports and dashboard

### Student
- Access to Reports page only
- Read-only access to student and class fund reports
- Cannot modify any data

## Development

### Backend Development
```bash
cd backend
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev    # Development server
npm run build  # Build for production
npm start      # Run production build
```

## Notes

- The database is automatically seeded with user accounts on first run
- Firebase users are automatically linked to database users on first login
- Account balances are automatically calculated from transactions
- All transactions are stored with timestamps and can be edited/deleted

## Troubleshooting

### Firebase Authentication Issues
- Ensure Firebase Authentication is enabled in Firebase Console
- Verify Firebase configuration values in `.env.local`
- Check that service account has proper permissions

### Database Issues
- Delete `finance.db` file to reset the database
- Check that the database path is correct in `.env`

### API Connection Issues
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure CORS is properly configured (already set up in backend)

## License

ISC


