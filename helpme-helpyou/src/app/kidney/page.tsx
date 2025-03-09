'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway"
import { NonBinary, Send } from "lucide-react";
import { useState, useRef, PointerEventHandler } from "react";
import KidneyModel from '@/app/KidneyModel'
import { AiAnswer, Answer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import { VectorComponent, SpriteComponent } from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";

export default function Kidney() {
    
    if(!process.env.NEXT_PUBLIC_GEMINI_API_KEY){
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [partIndex, setPartIndex] = useState(0)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | undefined>(undefined)
    const controlsRef = useRef(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [showSprite, setshowSprite] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showingModel, setShowingModel] = useState(false);
    const points = [
        {x: 0.14197008894221275, y: 0.1510056992837222, z: -0.0474645050978109}, // Reinal Artery
        {x: -0.09266655990271129, y: 0.07673202226194742, z: 0.12560388714898651}, // Renal Vein
        {x: 0.03454300102385906, y: 0.14640120990398575, z: 0.07322032575937706}, // Ureter
        {x: -0.07735738907917715, y: 0.15904299995250792, z: 0.001166892950766126}, // Renal Pelvis
        {x: -0.7550017828952282, y: 0.8469339433521645, z: 0.0028131433130842006}, // Medulla
        {x: -0.3920363927567727, y: 0.8741752335712509, z: -0.019888666615165376}, // Cortex
        {x: 0.8054631252283667, y: 0.5353339986846517, z: -0.19906144681366653}, // Nephron
        {x: 0.5903147887166088, y: -0.7959747341315074, z: 0.005024125140933365}, // Renal Capsule

    ];
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim()) return

        setIsLoading(true);
        setProgress(0);
        
        // Start progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 90));
        }, 50);

        try {
            const answer_response = await genAi.parseResponse(input)
            setProgress(100); // Complete the progress
            setAnswer(answer_response)
            console.log(answer_response)
            
            if (answer_response.error) {
                setModalTitle("Error");
                setModalDescription("Try a more relevant question.");
                setModalIsOpen(true);
            }else{
                setshowSprite(!!answer && !answer.error)
            }
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 500); // Give time for the 100% to show
            setInput("");
        }
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    return (
        <div className="relative h-screen w-full">
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, -5, -5]} intensity={1} color="white" />
                    <OrbitControls enableZoom={true} />
                    <KidneyModel points={points} i={partIndex}/>
                    {showSprite && answer && (
                            <SpriteComponent data={answer.parts[0]} firstPoint={points[partIndex]}/>
                    )}
                </Canvas>
            </div>
            <ModalNathan
                title={modalTitle}
                description={modalDescription}
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
            />

            {isLoading && (
                <>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-md z-40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full z-50">
                        <div className="scale-75">
                            <AnimatedCircularProgressBar
                                max={100}
                                min={0}
                                value={progress}
                                gaugePrimaryColor="rgb(79 70 229)"
                                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                            />
                        </div>
                    </div>
                </>
            )}

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