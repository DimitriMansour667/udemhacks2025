'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {GenAIUtils} from "@/app/utils/gemini_gateway"
import { Send } from "lucide-react";
import { useState, useRef } from "react";
import BrainModel from '@/app/BrainModel'
import { AiAnswer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export default function Brain() {
    if(!process.env.NEXT_PUBLIC_GEMINI_API_KEY){
        return <div>No api key erro</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | null>(null)
    const controlsRef = useRef(null);


  const points = [
    {x: -0.5307685642102951, y: 0.18521498665199987, z: 0.6060391294560343}, // Cerebrum
    {x: 0.5995514895454759, y: -0.5581046984943983, z: -0.6495908313948302}, // Cerebellum
    {x: 0.23097607679126156, y: -0.7122985424067342, z: 0.12780552084877117}, // Brainstem
    {x: -0.5882046695307154, y: 0.6145940866691428, z: 0.02}, // Frontal lobe
    {x: 0.27951995256963796, y: 0.7540875925218076, z: 0.02}, // Parietal lobe
    {x: -0.9354594627863727, y: 0, z: -0.048221844984680406}, // Temporal lobe
    {x: 1.0539338261146913, y: 0.09036493727733252, z: 0.24006206499231558}, // Occipital lobe
    {x: 0.3103568635444375, y: -0.9436120129849548, z: 0.01327201803336897}, // Medulla oblongata
    {x: 0.08484408250910186, y: 0.5155446110247102, z: -0.5469365826356386}, // Limbic lobe
    {x: -0.20268099697845515, y: -0.46522303081001093, z: -0.002686627744875103}, // Amygdala

  ];
    
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
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} intensity={2} />
                {/* <directionalLight position={[-5, -5, -5]} intensity={0.5} color="orange" /> */}
                <OrbitControls enableZoom={true} />
                <BrainModel points={points} />
              </Canvas>
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