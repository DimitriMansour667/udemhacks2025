
import { BodyParts, BrainParts } from "@/app/constant/bodyParts"

export class SytemPrompt {

    static system_prompt: string = `
Give me the impact and symptoms with a short 3 sentence description on the appropriate body part. 
In the answer give a list of the most relevant affected parts of the body, give atleast 2 affected parts of the body part but not all of them.

Use this json template when replying to the question:
{
    "parts": [    
        {
            "part": "",
            "description":""
            "impact" : "",
            symptoms: []
        },
    ]
}

If the question is not about the brain reply with an error using this json template:
{
  "error": "",
}

Give your response based on this question:
USER:`

    static getSystemPrompt() {
        const brainStructureString = "These are the brain parts that you know of:" + Object.values(BrainParts).join(", ");
        return brainStructureString + this.system_prompt;
    }
}