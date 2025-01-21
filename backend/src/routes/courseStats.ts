import { Router, Request, Response } from 'express';
import { db } from '../adminConfig';

const router = Router();

// Statistiken für einen Kurs abrufen
router.get('/:courseId/stats', async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
  
    try {
      const questionsSnapshot = await db.collection(`courses/${courseId}/questions`).get();
      const userStatsSnapshot = await db.collection('userStats').where('courseId', '==', courseId).get();
  
      if (questionsSnapshot.empty || userStatsSnapshot.empty) {
        res.status(200).json({
          totalQuestions: 0,
          totalCompletedModules: 0,
          averageSuccessRate: '0%',
          questionStats: {},
          difficultQuestions: [],
        });
        return;
      }

      const totalQuestions = questionsSnapshot.docs.length;
      const questionStats: Record<string, { correctCount: number; totalCount: number }> = {};
      const userStats: Record<string, { completedQuestions: number; correctAnswers: number }> = {};
  
      questionsSnapshot.docs.forEach((doc) => {
        questionStats[doc.id] = { correctCount: 0, totalCount: 0 };
      });
  
      userStatsSnapshot.docs.forEach((doc) => {
        const userStat = doc.data();
        const userId = userStat.userId;
        if (!userStats[userId]) {
          userStats[userId] = { completedQuestions: 0, correctAnswers: 0 };
        }
  
        userStat.questions.forEach((question: { id: string; isCorrect: boolean }) => {
          if (questionStats[question.id]) {
            questionStats[question.id].totalCount++;
            if (question.isCorrect) {
              questionStats[question.id].correctCount++;
              userStats[userId].correctAnswers++;
            }
          }
          userStats[userId].completedQuestions++;
        });
      });
  
      const totalCompletedModules = Object.keys(userStats).length;
      const averageSuccessRate =
        totalCompletedModules > 0
          ? Object.values(userStats).reduce((acc, stat) => acc + (stat.correctAnswers / stat.completedQuestions) * 100, 0) /
            totalCompletedModules
          : 0;
  
      const difficultQuestions = Object.entries(questionStats)
        .filter(([, stats]) => stats.totalCount > 0)
        .sort(([, a], [, b]) => a.correctCount / a.totalCount - b.correctCount / b.totalCount)
        .slice(0, 5)
        .map(([id, stats]) => ({
          questionId: id,
          correctRate: ((stats.correctCount / stats.totalCount) * 100).toFixed(2) + '%',
        }));
  
      res.status(200).json({
        totalQuestions,
        totalCompletedModules,
        averageSuccessRate: averageSuccessRate.toFixed(2) + '%',
        questionStats: questionStats || {}, // Immer ein leeres Objekt zurückgeben
        difficultQuestions: difficultQuestions || [], // Immer ein leeres Array zurückgeben
      });
    } catch (error) {
      console.error('Error fetching course stats:', error);
      res.status(500).json({ error: 'Failed to fetch course statistics.' });
    }
  });
  
  

export default router;
