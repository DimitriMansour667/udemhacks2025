'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds } from '@react-three/drei';

function BrainModel() {
    const { scene } = useGLTF('/Brain.gltf');
    return <primitive object={scene} />;
}

export default function Brain() {
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState("")
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim()) return
        
        // Here you would typically send the message to your backend
        console.log("Sending message:", input)
        setInput("")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl">
                <div className="w-full aspect-square bg-gray-200 rounded-lg shadow-md">
                    <Canvas camera={{ position: [0, 1, 2], fov: 50 }}>
                        <OrbitControls 
                            enablePan={false} 
                            enableZoom={true} 
                            enableRotate={true} 
                            target={[0, 0, 0]} 
                        />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <Bounds fit clip observe margin={1}>
                            <BrainModel />
                        </Bounds>
                    </Canvas>
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
