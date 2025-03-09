import { error } from "console"

export class Answer {
    part: string
    description: string
    impact: string
    symptoms: string[]

    constructor(part:string, description:string, impact:string, symptoms:string[]){
        this.part = part
        this.description = description
        this.impact = impact
        this.symptoms = symptoms
    }
    static fromJson(parsedData:any): Answer{
        return new Answer(parsedData.part, parsedData.description, parsedData.impact, parsedData.symptoms)
    }
}


export class AiAnswer {
    parts: Answer[]
    error: boolean
    question: string

    constructor(parts:Answer[] = [], error:boolean = false, question:string="")
    {
        this.parts = parts
        this.error = error
        this.question = question
    }
    static fromJson(parsedData:any, prompt:string): AiAnswer{
        if("error" in parsedData){
            return new AiAnswer([], true)
        }
        const answers = []
        for(const answer of parsedData.parts){
            answers.push(Answer.fromJson(answer))
        }
        return new AiAnswer(answers, false, prompt)
    }
}
