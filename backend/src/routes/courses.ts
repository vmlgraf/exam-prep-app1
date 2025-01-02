import { Router, Request, Response } from 'express';
import { db } from '../adminConfig';

const router = Router();


router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

export default router;
