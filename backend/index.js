// backend/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/courses', (req, res) => {
  res.json([
    { id: 1, title: 'Course 1', description: 'Course 1 description' },
    { id: 2, title: 'Course 2', description: 'Course 2 description' },
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
