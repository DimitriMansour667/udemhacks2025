const { GoogleGenerativeAI } = require("@google/generative-ai");
import {AiAnswer} from  '@/app/class/answer'
import { json } from 'stream/consumers';
class GenAIUtils {

    genAI: any
    model: any
    constructor(apiKey:string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Generates content based on the given prompt.
     * @param {string} prompt - The prompt for the AI model.
     * @returns {Promise<string>} - The generated content as a string.
     */
    async generateContent(prompt:string) {
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error generating content:", error);
            throw new Error("Failed to generate content. Please try again.");
        }
    }

    async parseResponse(prompt:string): AiAnswer{
        const answer = await this.generateContent(prompt)
        try {
            const parsedData = JSON.parse(answer);
            return new AiAnswer(parsedData);
        }catch(error){
            return new AiAnswer([], true);
        }
    }
}

module.exports = GenAIUtils;
