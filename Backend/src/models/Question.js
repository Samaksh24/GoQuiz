import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    
    topic:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:false
    },
    difficulty:{
        type:String,
        required:true,
        enum :['easy','medium','hard'],
    },
    type:{
        type:String,
        required:true,
        enum:['theory','code-output','find-bug']
    },
    questionText:{
        type:String,
        required:true,
    },
    options:{
        type:[String],
        required:true,
    },
    correctIndex:{
        type:Number,
        required:true,
        min:0,
        max:3,
    },
    explanation:{
        type:String,
        required:true
    },
    hash:{
        type:String,
        unique:true,
        required:true,
    },
    isDemo: {
      type: Boolean,
        default: false
    }

},
{timestamps:true})

questionSchema.index({ subject: 1, topic: 1, difficulty: 1 });
const Question = mongoose.model("Question",questionSchema);

export default Question;