import { Router, Request, Response } from 'express';
import { db } from '../adminConfig';

const router = Router();

// Route: Get all questions for a specific course
router.get('/:courseId/questions', async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;

  if (!courseId) {
    res.status(400).json({ error: 'Course ID is required.' });
    return;
  }

  try {
    const questionsRef = db.collection('courses').doc(courseId).collection('questions');
    const snapshot = await questionsRef.get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'No questions found for this course.' });
      return;
    }

    const questions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

export default router;
