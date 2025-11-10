import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
        console.log('Firebase Admin initialized with service account');
      } catch (parseError) {
        // Try as file path
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized with service account file');
      }
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Initialize with project ID only (for development/testing)
      // Note: This won't work for production token verification
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.warn('Firebase Admin initialized with project ID only. Token verification may not work properly.');
    } else {
      console.warn('Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID environment variable.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
  };
}

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

