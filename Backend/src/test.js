import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './db/db.js';
import { getQuizQuestions } from './services/quizService.js';

await connectDB();

const userId = new mongoose.Types.ObjectId();

const questions = await getQuizQuestions(userId, 'Coding', 'JavaScript arrays', 'easy', 8);
console.log('got:', questions.length);

process.exit();