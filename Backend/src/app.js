import express from "express";
import authRoutes from './routes/authRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRoutes);
app.use('/api/quiz',quizRoutes);

export default app;