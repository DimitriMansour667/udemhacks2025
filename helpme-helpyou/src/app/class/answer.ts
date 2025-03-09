import { error } from "console"

export class Answer {
    part: string
    description: string
    text: string

    constructor(part:string, description:string, text:string){
        this.part = part
        this.description = description
        this.text = text
    }
    static fromJson(parsedData:any): Answer{
        return new Answer(parsedData.part, parsedData.description, parsedData.text)
    }
}


export class AiAnswer {
    parts: Answer[]
    error: boolean
    question: string
    recommendation: string

    constructor(parts:Answer[] = [], error:boolean = false, question:string="", recommendation:string="")
    {
        this.parts = parts
        this.error = error
        this.question = question
        this.recommendation = recommendation
    }
    static fromJson(parsedData:any, prompt:string): AiAnswer{
        if("error" in parsedData){
            return new AiAnswer([], true, parsedData.question,parsedData.recommendation)
        }
        const answers = []
        for(const answer of parsedData.parts){
            answers.push(Answer.fromJson(answer))
        }
        return new AiAnswer(answers, false, prompt)
    }
}
