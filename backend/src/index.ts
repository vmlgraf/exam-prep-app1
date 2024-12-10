import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courses';
import userRoutes from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
