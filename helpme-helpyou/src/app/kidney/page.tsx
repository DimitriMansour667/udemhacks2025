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
import { KidneyParts } from "@/app/constant/bodyParts"
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list";

import { BodyParts } from "@/app/constant/bodyParts";

export default function Kidney() {

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [partIndex, setPartIndex] = useState(0)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | undefined>(undefined)
    const controlsRef = useRef(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [responses, setResponses] = useState<AiAnswer[]>([]) // Holds all responses
    const [showSprite, setshowSprite] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<number | null>(null); // Holds the index of the selected response
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showingModel, setShowingModel] = useState(false);
    const points_dict: { [key: string]: { x: number, y: number, z: number } } = {
        "Reinal Artery": { x: 0.14197008894221275, y: 0.1510056992837222, z: -0.0474645050978109 }, // Reinal Artery
        "Renal Vein": { x: -0.09266655990271129, y: 0.07673202226194742, z: 0.12560388714898651 }, // Renal Vein
        "Ureter": { x: 0.03454300102385906, y: 0.14640120990398575, z: 0.07322032575937706 }, // Ureter
        "Renal Pelvis": { x: -0.07735738907917715, y: 0.15904299995250792, z: 0.001166892950766126 }, // Renal Pelvis
        "Medulla": { x: -0.7550017828952282, y: 0.8469339433521645, z: 0.0028131433130842006 }, // Medulla
        "Cortex": { x: -0.3920363927567727, y: 0.8741752335712509, z: -0.019888666615165376 }, // Cortex
        "Nephron": { x: 0.8054631252283667, y: 0.5353339986846517, z: -0.19906144681366653 }, // Nephron
        "Renal Capsule": { x: 0.5903147887166088, y: -0.7959747341315074, z: 0.005024125140933365 }, // Renal Capsule

    };
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
            const answer_response = await genAi.sendRequest(input, BodyParts.Kidney)
            setProgress(100); // Complete the progress
            console.log(answer_response)

            if (answer_response.error) {
                setModalTitle("Error");
                setModalDescription("Try a more relevant question.");
                setModalIsOpen(true);
            } else {
                const possible_values = Object.values(KidneyParts) as string[];
                console.log(possible_values)
                answer_response.parts = answer_response.parts.filter(part => possible_values.includes(part.part));
                if (answer_response.parts.length === 0) {
                    setModalTitle("Skill issue");
                    setModalDescription("Be more original with your prompt!");
                    setModalIsOpen(true);
                    return
                }
                setResponses((prevResponses) => [...prevResponses, answer_response]); // Add to the list of all responses
                setAnswer(answer_response)
                setPartIndex(0)
                setshowSprite(!!answer_response && !answer_response.error)
                console.log("Safe sapce", showSprite, answer_response)
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
    
    const handleItemClick = (index: number) => {
        setSelectedResponseIndex(index);
        console.log("Clicked item index: ", index);
        setAnswer(responses[index])
        setPartIndex(0)
        setshowSprite(!!responses[index] && !responses[index].error)
    }

    return (

        <div className="relative h-screen w-full">
            {/* Animated list on the left */}
            <div className="absolute top-0 left-3 w-1/4 p-4" style={{ maxHeight: '100vh', overflowY: 'auto', zIndex: 10 }}>
            <h1 className="text-2xl font-bold">History</h1>
            <div className="flex flex-col gap-2"></div>
            <AnimatedList>
                {responses
                .filter(response => response.question) // Filter out responses with empty questions
                .map((response, index) => (
                    <AnimatedListItem 
                        key={index}
                        onClick={() => handleItemClick(index)}
                    >
                        <div className="p-2 border-black border-1 rounded-lg shadow-md hover:bg-gray-300 cursor-pointer hover:scale-105 transition-transform duration-200">
                            <h3 className="font-bold">{response.question}</h3>
                            {response.parts.map((part, partIndex) => (
                                <div key={partIndex}>
                                    <h3>-{part.part}</h3>
                                </div>
                            ))}
                        </div>
                    </AnimatedListItem>
                ))}
            </AnimatedList>
            </div>
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, -5, -5]} intensity={1} color="white" />
                    <OrbitControls enableZoom={true} />
                    <KidneyModel points={points_dict} currentKey={answer?.parts[partIndex].part} />
                    {showSprite && answer && (
                        <SpriteComponent data={answer.parts[partIndex]} firstPoint={points_dict[answer.parts[partIndex].part]} />
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
                                gaugePrimaryColor="rgb(0, 0, 0)"
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