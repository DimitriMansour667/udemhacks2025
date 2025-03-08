import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {AiAnswer} from  '@/app/class/answer'
export class GenAIUtils {

    genAI: GoogleGenerativeAI
    model: GenerativeModel
    constructor(apiKey:string) {
        let system_prompt:string = this.systemPrompt()
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel(
            { model: "gemini-2.0-flash" , 
                systemInstruction: system_prompt
            });
    }

    /**
     * Generates content based on the given prompt.
     * @param {string} prompt - The prompt for the AI model.
     * @returns {Promise<string>} - The generated content as a string.
     */
    async generateContent(prompt:string) {
        try {
            const result = await this.model.generateContent(prompt)
            return result.response.text();
        } catch (error) {
            console.error("Error generating content:", error);
            throw new Error("Failed to generate content. Please try again.");
        }
    }

    async parseResponse(prompt:string): Promise<AiAnswer>{
        const answer = await this.generateContent(prompt)
        let cleanResponse = answer.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsedData = JSON.parse(cleanResponse);

            return AiAnswer.fromJson(parsedData);
        }catch(error){
            console.log(cleanResponse)
            console.log(error)
            return new AiAnswer([], true);
        }
    }

    private systemPrompt(): string {
        return `
Parts of the brain that you know: Cerebrum, Cerebellum, Brainstem, Frontal Lobe, Parietal Lobe, Temporal Lobe, Occipital Lobe, Corpus Callosum, Medulla oblongata, Limbic System, Amygdala

Only answer if the question is about the brain.
Give a detail answer about each parts of the brain that you know that is relevant to the question.

Give me the impact and symptoms with a short 3 sentence description on the appropriate body part. 
In the answer give a list of the most relevant affected parts of the body, give atleast 2 affected parts of the body part but not all of them.

Use this json template when replying to the question:
{
    "parts": [    
        {
            "part": "",
            "description":""
            "impact" : "",
            symptoms: [],
        },
    ]
}

If the question is not about the brain reply with an error using this json template:
{
  "error": "",
}

Give your response based on this question:
`
    }
}
