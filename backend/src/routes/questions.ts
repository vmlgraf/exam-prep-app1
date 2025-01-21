import express from 'express';
import { db } from '../adminConfig';

const router = express.Router();

// Fetch all questions for a specific course
router.get('/courses/:courseId/questions', async (req, res): Promise<void> => {
  const { courseId } = req.params;

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

// Update the status of a question (correct/incorrect)
router.patch('/courses/:courseId/questions/:questionId', async (req, res) => {
  const { courseId, questionId } = req.params;
  const { status } = req.body;

  if (!['correct', 'incorrect'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value. Must be "correct" or "incorrect".' });
    return;
  }

  try {
    const questionRef = db.collection('courses').doc(courseId).collection('questions').doc(questionId);

    await questionRef.update({ lastStatus: status });
    res.status(200).json({ message: 'Question status updated successfully.' });
  } catch (error) {
    console.error('Error updating question status:', error);
    res.status(500).json({ error: 'Failed to update question status.' });
  }
});

// Statistik: Prozentsatz der korrekten Antworten eines Kurses
router.get('/courses/:courseId/stats', async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    res.status(400).json({ error: 'Course ID is required.' });
    return;
  }

  try {
    const questionsRef = db.collection('courses').doc(courseId).collection('questions');
    const questionsSnapshot = await questionsRef.get();

    if (questionsSnapshot.empty) {
      res.status(404).json({ error: 'No questions found for this course.' });
      return;
    }

    const totalQuestions = questionsSnapshot.size;
    let correctAnswersCount = 0;

    questionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.lastStatus === 'correct') {
        correctAnswersCount += 1;
      }
    });

    const percentage = ((correctAnswersCount / totalQuestions) * 100).toFixed(2);

    res.status(200).json({
      totalQuestions,
      correctAnswersCount,
      percentage,
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({ error: 'Failed to fetch course stats.' });
  }
});

export default router;
