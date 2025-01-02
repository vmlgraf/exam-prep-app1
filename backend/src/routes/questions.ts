import { Router, Request, Response } from 'express';
import { db } from '../adminConfig';

const router = Router();

router.post('/:courseId/questions', async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { question, answer } = req.body;

  if (!question || !answer) {
    res.status(400).json({ error: 'Question and answer are required' })
    return;
  }

  try {
    const courseRef = db.collection('courses').doc(courseId);
    await courseRef.collection('questions').add({ question, answer });
    res.status(201).json({ message: 'Question added successfully' });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

export default router;
