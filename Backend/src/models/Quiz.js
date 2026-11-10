import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Question',
        required:true,
    },
    selectedIndex:{
        type:Number,
        required:true,
        min:0,
        max:3,
    },
    isCorrect:{
        type:Boolean,
        required:true,
    },
},
{_id:false})


const quizAttemptSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    
    subject:{
        type:String,
        required:true
    },

    topic:{
        type:String,
        required:true,
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true
    },
    answers:{
        type:[answerSchema],
    },
    score:{
        type:Number,
        default:0,
        min:0
    },
    totalQuestions:{
        type:Number,
        required:true,
        min:1,
    },
    startedAt:{
        type:Date,
        default:Date.now
    },
    completedAt:{
        type:Date,
        required:false,
    },
},{timestamps:true})

const QuizAttempt = mongoose.model('QuizAttempt',quizAttemptSchema);

export default QuizAttempt;
