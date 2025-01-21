import { Router } from 'express';
import { db } from '../adminConfig';

const router = Router();

// Fetch user stats (points, badges, etc.)
router.get('/users/:userId/courses', async (req, res): Promise<void> => {
    const { userId } = req.params;
  
    if (!userId) {
      res.status(400).json({ error: 'User ID is required.' });
      return;
    }
  
    try {
      const coursesRef = db.collection('users').doc(userId).collection('courses');
      const coursesSnapshot = await coursesRef.get();
  
      if (coursesSnapshot.empty) {
        res.status(200).json([]); 
        return;
      }
  
      const coursePromises = coursesSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const points = data.points || 0;
        const badges = Array.isArray(data.badges) ? data.badges : [];

        let level = 1;
  
        if (points >= 1500) {
          level = 4;
        } else if (points >= 1000) {
          level = 3;
        } else if (points >= 500) {
          level = 2;
        }
        
        const courseDoc = await db.collection('courses').doc(doc.id).get();
        const courseTitle = courseDoc.data()?.title;

        return {
            courseId: doc.id,
            courseTitle,
            points,
            badges,
            level,
        };
      });
      
      const courseStats = await Promise.all(coursePromises);
      res.status(200).json(courseStats);
    } catch (error) {
      console.error('Error fetching user stats for courses:', error);
      res.status(500).json({ error: 'Failed to fetch course stats.' });
    }
  });
  
  
  
// Add points to a user's course
router.post('/user/:userId/courses/:courseId/points', async (req, res): Promise<void> => {
  const { userId, courseId } = req.params;
  const { points } = req.body;

  if (!userId || !courseId || points === undefined) {
    res.status(400).json({ error: 'Missing required fields.' })
    return;
  }

  try {
    const userRef = db.collection('users').doc(userId).collection('courses').doc(courseId);
    const userData = (await userRef.get()).data() || { points: 0, badges: [], level: 1 };

    const updatedPoints = userData.points + points;
    await userRef.set({ ...userData, points: updatedPoints }, { merge: true });

    res.status(200).json({ message: 'Points updated successfully.', points: updatedPoints });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Failed to update points.' });
  }
});

// Add a badge to a user's course
router.post('/user/:userId/courses/:courseId/badges', async (req, res): Promise<void> => {
  const { userId, courseId } = req.params;
  const { badge } = req.body;

  if (!userId || !courseId || !badge) {
    res.status(400).json({ error: 'Missing required fields.' })
    return;
  }

  try {
    const userRef = db.collection('users').doc(userId).collection('courses').doc(courseId);
    const userData = (await userRef.get()).data() || { points: 0, badges: [], level: 1 };

    if (!userData.badges.includes(badge)) {
      userData.badges.push(badge);
      await userRef.set(userData, { merge: true });
    }

    res.status(200).json({ message: 'Badge added successfully.', badges: userData.badges });
  } catch (error) {
    console.error('Error adding badge:', error);
    res.status(500).json({ error: 'Failed to add badge.' });
  }
});

export default router;