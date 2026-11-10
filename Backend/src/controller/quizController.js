import QuizAttempt from "../models/Quiz.js";
import { getQuizQuestions } from "../services/quizService.js";
import Question from "../models/Question.js";

export const startQuiz= async(req,res)=>{
    const {subject,topic,difficulty,count}=req.body;

    if(!subject || !topic ){
        return res.status(400).json({
            message:"subject / topic cannot be empty"
        })
    }
   
    const allowedDifficulty = ['easy','medium','hard']
    if(!difficulty || !allowedDifficulty.includes(difficulty)){
        return res.status(400).json({
            message:"invalid or missing difficulty"
        })
    }

    const countNum=Number(count);
    if(!Number.isInteger(countNum)|| countNum>20 || countNum<1){
        return res.status(400).json({
            message:"invalid question number"
        })
    }

    try{
      const questions= await getQuizQuestions(req.user._id,subject,topic,difficulty,countNum);
      return res.status(200).json({
        message:"Questions Generated Successfully",
        questions
      })
    } catch(error){
        console.log("error in generating questions",error);
        return res.status(500).json({
            message:"failed to generate questions"
        })
    }
}

export const submitQuiz = async(req,res)=>{
    const{subject,topic,difficulty,answers,startedAt}=req.body;

    if(!Array.isArray(answers) || answers.length === 0){
        return res.status(400).json({
            message:"answers cannot be null"
        })
    }

    const isValid = answers.every(answer=>
       typeof answer.questionId === 'string' &&
        Number.isInteger(answer.selectedIndex) && answer.selectedIndex >=0 && answer.selectedIndex<4
        && typeof answer.isCorrect === 'boolean'
    )

    if (!isValid) {
     return res.status(400).json({ message: 'invalid item in answers array' });
   }

   const userScore= answers.filter(answer=> answer.isCorrect=== true).length;
   const totalQuestions=answers.length;
   

   try{

    const userQuizAttempt = await QuizAttempt.create({
    userId : req.user._id,
    subject,topic,difficulty,answers,
    score:userScore,
    totalQuestions,
    startedAt,
    completedAt:new Date(),
    
    
   })
    res.status(201).json({ message: 'Quiz submitted successfully', userQuizAttempt })


   } catch(error){
     console.log("errro occured",error);
     res.status(500).json({ message: 'Failed to save quiz attempt' })

   }
   
    
}

export const quizHistory = async(req,res)=>{
    try{
        const userHistory = await QuizAttempt.find({userId:req.user._id});
        if(!userHistory){
            return res.status(400).json({
                message:"No history available, Take a quiz"
            })
        }
        return res.status(200).json({
            message:"history fetched successfully",
            userHistory
        })
    }catch(error){
        return res.status(500).json({
            message:"error while fetching quiz history"
        })
    }
}

export const demoQuiz =async(req,res)=>{
    const{subject,count}=req.body;

    if(!subject || !count){
        return res.status(400).json({
            message:"subject / difficulty /count cannot be empty"
        })
    }

    const demoQuestions = await Question.aggregate([
     {
      $match: {
        subject,
        difficulty: "medium",
        isDemo: true
      }
     },
      {
      $sample: {
        size: Number(count)
      }
     }
    ]);

    if(demoQuestions.length===0){
        return res.status(404).json({
            message:"NO questions found"
        })
    }

    return res.status(200).json({
        message:"Questions Fetched Successfully",
        demoQuestions
    })
   
}

export const submitDemo=async(req,res)=>{
    const{subject,answers,startedAt}=req.body;

     if(!Array.isArray(answers) || answers.length === 0){
        return res.status(400).json({
            message:"answers cannot be null"
        })
    }

    const isValid = answers.every(answer=>
       typeof answer.questionId === 'string' &&
        Number.isInteger(answer.selectedIndex) && answer.selectedIndex >=0 && answer.selectedIndex<4
        && typeof answer.isCorrect === 'boolean'
    )

    if (!isValid) {
     return res.status(400).json({ message: 'invalid item in answers array' });
   }

   const userScore= answers.filter(answer=> answer.isCorrect=== true).length;
   const totalQuestions=answers.length;

    const userQuizAttempt = {
    subject,
    answers,
    score:userScore,
    totalQuestions,
    startedAt,
    completedAt:new Date(),
    }

     res.status(201).json({ message: 'Quiz submitted successfully', userQuizAttempt })


}