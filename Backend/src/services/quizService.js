import QuizAttempt from '../models/Quiz.js';
import Question from '../models/Question.js';
import crypto from 'crypto'
import { generateQuestions } from './geminiService.js';

export const getSeenQuestionIds = async (userId, subject, topic, difficulty) => {
  const seenIds = await QuizAttempt.distinct('answers.questionId', {
    userId,
    subject,
    topic,
    difficulty,
  });

  return seenIds;
};

export const getUnseenQuestions= async(subject,topic,difficulty,seenIds,count)=>{
    const unseen= await Question.aggregate([
        {$match:{subject,topic,difficulty, _id:{$nin:seenIds}}},
        {$sample:{size:count}}
    ])
    return unseen;
}

export const saveQuestions =async(rawQuestions,subject,topic,difficulty)=>{
    const saved= [];

    for(const q of rawQuestions){
        const cleaned=q.questionText.toLowerCase().trim().replace(/\s+/g, ' ');

        const hash=crypto.createHash('sha256').update(cleaned).digest('hex');
        
        const exists = await Question.findOne({hash});
        if(exists) continue;

        const doc=await Question.create({...q,subject,topic,difficulty,hash});
        saved.push(doc);
    }
    return saved;
}

export const getQuizQuestions = async(userId,subject,topic,difficulty,count)=>{
    const seenIds = await getSeenQuestionIds(userId,subject,topic,difficulty);
    const cached= await getUnseenQuestions(subject,topic,difficulty,seenIds,count);
    const missing = count-cached.length;

    if(missing>0){
       console.log(`calling Gemini for ${missing} questions`);
       const raw = await generateQuestions({ subject, topic, difficulty, count: missing });
       const saved = await saveQuestions(raw, subject, topic, difficulty);
       return [...cached, ...saved];
    }
    return cached;
}