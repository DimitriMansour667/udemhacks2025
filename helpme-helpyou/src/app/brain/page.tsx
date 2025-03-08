'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {GenAIUtils} from "@/app/utils/gemini_gateway"
import { Send } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-2xl">
            <div className="w-full aspect-square bg-gray-200 rounded-lg shadow-md">
              {/* Replace with your actual BrainModel */}
              <BrainModel />
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
    
          {/* Conditional rendering for AiAnswer */}
          {answer && answer.error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
              <p>Error fetching data. Please try again.</p>
            </div>
          )}
    
          {/* Render answers */}
          {answer && !answer.error && answer.parts.length > 0 && (
            <div className="mt-4 w-full max-w-2xl">
              {answer.parts.map((item, index) => (
                <div key={index} className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold">Answer {index + 1}:</h3>
                  <p>{item.part}</p>
                  <p className="text-sm text-gray-600">Description: {item.description}</p>
                  <p className="text-sm text-gray-600">Impact: {item.impact}</p>
                  <p className="text-sm text-gray-600">Symptoms: {item.symptoms}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }