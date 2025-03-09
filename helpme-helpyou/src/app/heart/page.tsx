'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway"
import { NonBinary, Send } from "lucide-react";
import { useState, useRef, PointerEventHandler } from "react";
import HearthModel from '@/app/HeartModel'
import { AiAnswer, Answer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import { VectorComponent, SpriteComponent } from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { HeartParts, BodyParts } from "@/app/constant/bodyParts"
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list";


export default function Heart() {

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [partIndex, setPartIndex] = useState(0)
    const [input, setInput] = useState("")
    const [answer, setAnswer] = useState<AiAnswer | undefined>(undefined)
    const controlsRef = useRef(null);
    const [responses, setResponses] = useState<AiAnswer[]>([]) // Holds all responses
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<number | null>(null); // Holds the index of the selected response

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [showSprite, setshowSprite] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showingModel, setShowingModel] = useState(false);
    const points_dict: { [key: string]: { x: number, y: number, z: number } } = {
        "Superior Vena Cava": { x: -0.6425948281061822, y: 0.9755409592647069, z: -0.13576635170186815 }, // Superior Vena Cava
        "Inferior Vena Cava": { x: -0.5117882345665898, y: -0.31672799261628004, z: -0.44637480826734105 }, // Inferior Vena Cava
        "Right Atrium": { x: -0.8261055456500125, y: 0.24391593048958704, z: -0.20885697217606747 }, // Right Atrium
        "Right Ventricle": { x: -0.4118636364035363, y: -0.32572980813680563, z: 0.3115741059342562 }, // Right Ventricle
        "Pulmonery Artery": { x: -0.16193168281080988, y: 0.6367147881552804, z: -0.4426578114213608 }, // Pulmonery Artery
        "Left Atrium": { x: 0.30574125831175064, y: 0.3561960606050185, z: 0.06690800612468763 }, // Left Atrium
        "Left Ventricle": { x: 0.6125498759899235, y: -0.3933885492530122, z: 0.5048913170917531 }, // Left Ventricle
        "Aorta": { x: -0.09475676993002183, y: 1.011880422924982, z: -0.1643971837933614 }, // Aorta
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
            const answer_response = await genAi.sendRequest(input, BodyParts.Hearth)
            setProgress(100); // Complete the progress
            setAnswer(answer_response)
            console.log(answer_response)

            if (answer_response.error) {
                setModalTitle("Error");
                setModalDescription("Try a more relevant question.");
                setModalIsOpen(true);
            } else {
                const possible_values = Object.values(HeartParts) as string[];
                console.log(possible_values)
                if (!Object.values(answer_response.parts).every(value => possible_values.includes(value.part))) {
                    setModalTitle("Skill issue");
                    setModalDescription("Be more original with your prompt!");
                    setModalIsOpen(true);
                    return;
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
                                <div className="p-2 border-black border-1 rounded-lg shadow-md hover:bg-gray-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform duration-200">
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
                    <HearthModel points={points_dict} currentKey={answer?.parts[partIndex].part} />
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