import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { SytemPrompt } from "@/app/utils/prompt"
import { AiAnswer } from '@/app/class/answer'
import { BodyParts } from '@/app/constant/bodyParts'

export class GenAIUtils {

    genAI: GoogleGenerativeAI
    model: GenerativeModel
    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel(
            {
                model: "gemini-2.0-flash",
                systemInstruction: "Give back an error"
            });
    }

    /**
     * Generates content based on the given prompt.
     * @param {string} prompt - The prompt for the AI model.
     * @returns {Promise<string>} - The generated content as a string.
     */
    async generateContent(prompt: string, bodyPart: BodyParts) {
        let system_prompt:string = ""
        switch (bodyPart) {
            case BodyParts.Brain:
                system_prompt = SytemPrompt.getSystemPromptBrain()
                break;
            case BodyParts.Kidney:
                system_prompt = SytemPrompt.getSystemPromptKidneys()
                break;
            case BodyParts.Kidney:
                system_prompt = SytemPrompt.get()
                break;
        }

        console.log (system_prompt)
            
        this.model = this.genAI.getGenerativeModel(
            {
                model: "gemini-2.0-flash",
                systemInstruction: system_prompt
            });

        try {
            const result = await this.model.generateContent(prompt)
            return result.response.text();
        } catch (error) {
            console.error("Error generating content:", error);
            throw new Error("Failed to generate content. Please try again.");
        }
    }

    async sendRequest(prompt: string, bodyPart: BodyParts): Promise<AiAnswer> {

        const answer = await this.generateContent(prompt, bodyPart)

        let cleanResponse = answer.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsedData = JSON.parse(cleanResponse);

            return AiAnswer.fromJson(parsedData, prompt);
        } catch (error) {
            console.log(cleanResponse)
            console.log(error)
            return new AiAnswer([], true);
        }
    }
}
