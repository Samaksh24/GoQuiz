import { GoogleGenAI,Type } from "@google/genai";

const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

const questionListSchema={
    type: Type.ARRAY,
    items:{
        type:Type.OBJECT,
        properties:{
            type:{type: Type.STRING, enum:['theory','code-output','find-bug']},
            questionText: {type:Type.STRING},
            options:{type:Type.ARRAY, items:{type:Type.STRING}},
            correctIndex:{type:Type.INTEGER},
            explanation:{type:Type.STRING}
        },
        required: ['type', 'questionText', 'options', 'correctIndex', 'explanation'],
    }
}

export const generateQuestions = async({subject,topic,difficulty,count=5})=>{
    
    const prompt = `Generate ${count} multiple choice questions about ${topic} in ${subject}.
      Difficulty: ${difficulty}.
      Each question must have exactly 4 options.
      correctIndex is the position of the correct option: 0 for the first option, 3 for the last.
      Include a short explanation of why the answer is correct.
      Use type "theory" for concept questions, "code-output" for "what does this code print?" questions, and "find-bug" for "what is wrong with this code?" questions.
      For code questions, put the code inside questionText, wrapped in a markdown code block.
      Do not repeat the same question.`;

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
