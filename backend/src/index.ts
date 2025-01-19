import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as admin from 'firebase-admin';
import path from 'path';
import helmet from 'helmet'; // Sicherheitsheaders
import morgan from 'morgan'; // Logging
import adminRoutes from './routes/admin';
import coursesRoutes from './routes/courses';
import questionsRoutes from './routes/questions';
import userRoutes from './routes/users';
import uploadRoutes from './routes/uploadRoutes';

// Firebase-Initialisierung
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routen
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', questionsRoutes);
app.use('/api', uploadRoutes);

// Fehlerbehandlung
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.', error: err.message });
});

// Server-Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
