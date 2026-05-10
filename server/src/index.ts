import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipeRoutes';
import ratingRoutes from './routes/ratingRoutes';
import mealPlanRoutes from './routes/mealPlanRoutes';
import { protect } from './middleware/authMiddleware';
import { setupI18n } from './config/i18nConfig';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const i18nMiddleware = setupI18n();

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(i18nMiddleware);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Welcome to the Recipe Book API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/meal-planner', mealPlanRoutes);

app.get('/api/protected', protect, (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      message: `Access granted to protected route, welcome ${req.user.username}!`,
      userId: req.user._id,
      userEmail: req.user.email,
    });
  } else {
    res.status(500).json({ message: 'Authenticated user not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});