import { Request, Response, NextFunction } from 'express';
import { auth } from '../adminConfig';

export const checkAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(403).json({ error: 'No token provided' });
      return;
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admins only' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error verifying admin role:', error);
    res.status(403).json({ error: 'Unauthorized' });
  }
};