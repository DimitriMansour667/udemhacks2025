import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {SytemPrompt} from "@/app/utils/prompt"
import {AiAnswer} from  '@/app/class/answer'
export class GenAIUtils {

    genAI: GoogleGenerativeAI
    model: GenerativeModel
    constructor(apiKey:string) {
        let system_prompt:string = SytemPrompt.getSystemPrompt()
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
}
