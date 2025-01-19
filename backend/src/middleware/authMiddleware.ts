import { Request, Response, NextFunction } from 'express';
import { auth } from '../adminConfig';
import { db } from '../adminConfig';

// Benutzer authentifizieren
export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: No token provided.' });
      return;
    }

    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized.' });
  }
};

// Adminrechte prüfen
export const checkAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  if (!user) {
    res.status(403).json({ error: 'Forbidden: User not authenticated.' });
    return;
  }

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admins only.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ error: 'Failed to check admin role.' });
  }
};
