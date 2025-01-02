import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as admin from 'firebase-admin';
import path from 'path';
import adminRoutes from './routes/admin';
import coursesRoutes from './routes/courses';
import uploadRoutes from './routes/uploadRoutes';

// Firebase Admin SDK Initialisierung
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173', 
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/admin', adminRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', uploadRoutes);

// 404-Handler: Nicht gefundene Routen
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Globaler Fehler-Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export { db };
