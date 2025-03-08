'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {GenAIUtils} from "@/app/utils/gemini_gateway"
import { Send } from "lucide-react";
import { useState } from "react";

export default function Brain() {
    const genAi = new GenAIUtils("AIzaSyBPt1DlKd9EjlRidMsmqe2W4LGuc2pZexI")

    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState("")
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim()) return
        
        console.log("Sending message:", input)
        console.log(await genAi.parseResponse(input))
        setInput("")

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl">
                <div className="w-full aspect-square bg-gray-200 rounded-lg shadow-md">
                    {/* Content for the square can go here */}
                </div>
            </div>
            <div className="w-full max-w-2xl mt-4">
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-grow"
                        disabled={isTyping}
                    />
                    <Button type="submit" disabled={isTyping} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
