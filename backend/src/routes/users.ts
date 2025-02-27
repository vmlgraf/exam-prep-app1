import { Router, Request, Response } from 'express';
import { auth, db } from '../adminConfig';

const router = Router();

// Benutzer registrieren
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role = 'user', enableMFA = false } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await auth.createUser({ email, password, displayName: name });
    await auth.setCustomUserClaims(user.uid, { role });

    await db.collection('users').doc(user.uid).set({
      email,
      name,
      role,
      createdAt: new Date(),
    });

    if (enableMFA) {
      await auth.updateUser(user.uid, {
        multiFactor: {
          enrolledFactors: [],
        },
      });
    }

    res.status(201).json({ message: 'User registered successfully!', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});


// Benutzer abfragen 
router.get('/:uid', async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;

  try {
    const userDoc = await db.collection('users').doc(uid).get(); 
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' }); 
      return;
    }

    res.status(200).json(userDoc.data()); 
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' }); 
  }
});

export default router;