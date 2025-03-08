'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {GenAIUtils} from "@/app/utils/gemini_gateway"
import { Send } from "lucide-react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { useState, useRef } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds } from '@react-three/drei';
import BrainModel from '@/app/BrainModel'
import { AiAnswer } from "../class/answer";

export default function Brain() {
    const genAi = new GenAIUtils("AIzaSyBPt1DlKd9EjlRidMsmqe2W4LGuc2pZexI")

    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | null>(null)
    const controlsRef = useRef(null);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim()) return
        
        console.log("Sending message:", input)
        const answer_response = await genAi.parseResponse(input)
        setAnswer(answer_response)
        console.log(answer_response)
        setInput("")

    }

    return (
        <div className="relative h-screen w-full">
            {/* Brain model container taking full screen */}
            <div className="absolute inset-0">
                <BrainModel />
            </div>

            {/* Floating chat box positioned lower and wider */}
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                <form onSubmit={handleSubmit} className="flex w-full space-x-2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-grow text-lg"
                        disabled={isTyping}
                        style={{ height: '50px' }}
                    />
                    <Button type="submit" disabled={isTyping} size="icon" className="h-12 w-12">
                        <Send className="h-6 w-6" />
                    </Button>
                </form>
            </div>
        </div>
    );
}