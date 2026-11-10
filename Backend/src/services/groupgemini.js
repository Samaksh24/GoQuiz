import { GoogleGenAI, Type } from "@google/genai";

const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

const questionListSchema={
    type: Type.ARRAY,
    items:{
        type:Type.OBJECT,
        properties:{
            question: {type:Type.STRING},
            options:{type:Type.ARRAY, items:{type:Type.STRING}},
            correctAnswer:{type:Type.INTEGER},
        },
        required: ['question', 'options', 'correctAnswer',],
    }
}

export const generateGroupQuestions = async({subject,topic,difficulty,count})=>{
 const prompt = `Generate ${count} multiple choice questions about ${topic} in ${subject}.
      Difficulty: ${difficulty}.
      Each question must have exactly 4 options.
      correctAnswer is the position of the correct option: 0 for the first option, 3 for the last.
      here is the example of how the response should be,
       question: "What does HTML stand for?",
            options: [
              "HyperText Markup Language",
              "HighText Machine Language",
              "Hyper Transfer Markup Link",
              "Home Tool Markup Language",
            ],
            correctAnswer: 0,`
          
            const response = await ai.models.generateContent({
       model:'gemini-3.5-flash-lite',
        contents:prompt,
        config:{
               responseMimeType:'application/json',
               responseSchema:questionListSchema,
        }
   })
     
     try {
     return JSON.parse(response.text);
     } catch (error) {
        throw new Error('Gemini returned invalid JSON');
      }

}