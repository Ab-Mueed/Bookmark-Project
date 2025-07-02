import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import bookmarkRoutes from './routes/bookmark.routes';

dotenv.config(); // Load environment variables from .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/bookmarks', bookmarkRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
