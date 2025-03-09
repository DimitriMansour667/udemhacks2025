'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway"
import { NonBinary, Send } from "lucide-react";
import { useState, useRef, PointerEventHandler } from "react";
import BrainModel from '@/app/BrainModel'
import { AiAnswer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import { VectorComponent, SpriteComponent } from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list";
import {BrainParts} from "@/app/constant/bodyParts"

export default function Brain() {
    
    if(!process.env.NEXT_PUBLIC_GEMINI_API_KEY){
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [partIndex, setPartIndex] = useState(0)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | undefined>(undefined) // Holds the latest response
    const [responses, setResponses] = useState<AiAnswer[]>([]) // Holds all responses
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<number | null>(null); // Holds the index of the selected response
    const controlsRef = useRef(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [showSprite, setshowSprite] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const points_dict: { [key: string]: { x: number, y: number, z: number } } = {
        "Cerebrum": { x: -0.5307685642102951, y: 0.18521498665199987, z: 0.6060391294560343 },
        "Cerebellum": { x: 0.5995514895454759, y: -0.5581046984943983, z: -0.6495908313948302 },
        "Brainstem": { x: 0.23097607679126156, y: -0.7122985424067342, z: 0.12780552084877117 },
        "Frontal Lobe": { x: -0.5882046695307154, y: 0.6145940866691428, z: 0.02 },
        "Parietal Lobe": { x: 0.27951995256963796, y: 0.7540875925218076, z: 0.02 },
        "Temporal Lobe": { x: -0.9354594627863727, y: 0, z: -0.048221844984680406 },
        "Occipital Lobe": { x: 1.0539338261146913, y: 0.09036493727733252, z: 0.24006206499231558 },
        "Medulla Oblongata": { x: 0.3103568635444375, y: -0.9436120129849548, z: 0.01327201803336897 },
        "Limbic System": { x: 0.08484408250910186, y: 0.5155446110247102, z: -0.5469365826356386 },
        "Amygdala": { x: -0.20268099697845515, y: -0.46522303081001093, z: -0.002686627744875103 }
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
            const answer_response = await genAi.parseResponse(input)
            setProgress(100); // Complete the progress
            console.log(answer_response)
            
            if (answer_response.error) {
                setModalTitle("Error");
                setModalDescription("Try a more relevant question.");
                setModalIsOpen(true);
            }else{
                const possible_values = Object.values(BrainParts)
                console.log(possible_values)
                if(!Object.values(answer_response.parts).every(value => possible_values.includes(value.part))){
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
    }

    return (
        <div className="relative h-screen w-full">
            {/* Animated list on the left */}
            <div className="absolute top-0 left-0 w-1/4 p-4" style={{ maxHeight: '100vh', overflowY: 'auto', zIndex: 10 }}>
            <AnimatedList>
                {responses
                .filter(response => response.question) // Filter out responses with empty questions
                .map((response, index) => (
                    <AnimatedListItem key={index} onClick={() => handleItemClick(index)}>
                    <div className="p-2 bg-gray-200 rounded-lg shadow-md">
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
                    <directionalLight position={[-5, -5, -5]} intensity={2} color="yellow" />
                    <OrbitControls enableZoom={false} />
                    <BrainModel points={points_dict} currentKey={answer?.parts[partIndex].part} />
                    {showSprite && answer && (
                            <SpriteComponent data={answer.parts[partIndex]} firstPoint={points_dict[answer.parts[partIndex].part]}/>
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