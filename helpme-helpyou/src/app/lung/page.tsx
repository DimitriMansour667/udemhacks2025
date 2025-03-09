'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway"
import { NonBinary, Send, Spline, Eye } from "lucide-react";
import { useState, useRef, PointerEventHandler, KeyboardEventHandler, useEffect } from "react";
import LungModel from '@/app/LungModel'
import { AiAnswer, Answer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import { VectorComponent, SpriteComponent } from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { HeartParts, BodyParts, LungParts } from "@/app/constant/bodyParts"
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list";
import Image from "next/image";


export default function Lung() {

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
    const [modalInput, setModalInput] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showingModel, setShowingModel] = useState(false);
    const [isReroute, setIsReroute] = useState(false);
    const [routeLink, setRouteLink] = useState("");
    const points_dict: { [key: string]: { x: number, y: number, z: number } } = {
        "Trachea": {x: 0.01628849281173661, y: 0.663973064205808, z: 0.043925936526820863},
        "Main Bronchus": {x: 0.020234013939173012, y: 0.19839257137062127, z: 0.04483896539213372},
        "Alveoli": {x: 0.34151964554947856, y: -0.07458476485195864, z: 0.2729386294297793},
        "Bronchioles": {x: 0.5771988773145166, y: -0.5368028785817331, z: 0.23088078870410667},
        "Upper Lobe": {x: -0.46392825891108247, y: 0.238164142552309, z: 0.2396680759238361},
        "Middle Lobe": {x: -0.42280640625689175, y: -0.023496275495605512, z: 0.29680553414583244},
        "Lower Lobe": {x: -0.5579146282974743, y: -0.3578304357966164, z: 0.300323532322612},
    };
    
    useEffect(() => {
        const modalInput = localStorage.getItem('modalInput');
        if (modalInput) {
            localStorage.removeItem('modalInput')

            setInput(modalInput);
            handleSubmit(new Event('submit') as any, modalInput);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, customInput = input) => {
        e.preventDefault()
        if (!customInput.trim()) return

        setIsLoading(true);
        setProgress(0);

        // Start progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 90));
        }, 50);

        try {
            const answer_response = await genAi.sendRequest(customInput, BodyParts.Lung)
            setProgress(100); // Complete the progress
            console.log(answer_response)

            if (answer_response.error) {
                console.log("There is an error")
                console.log(answer_response.recommendation)
                if (answer_response.recommendation != 'none' && answer_response.recommendation != undefined) {
                    setIsReroute(true);
                    setRouteLink(answer_response.recommendation);
                    setModalInput(customInput);
                    setModalTitle("Your question might be related to the "+answer_response.recommendation);
                    setModalDescription("Click the button below to access the related section.");
                    setModalIsOpen(true);
                    localStorage.setItem('modalInput', JSON.stringify(customInput));
                } else {
                    setModalTitle("Error");
                    setModalDescription("Try a more relevant question.");
                    setIsReroute(false);
                    setRouteLink("");
                    setModalInput("");
                    setModalIsOpen(true);
                }
            } else {
                const possible_values = Object.values(LungParts) as string[];
                console.log(possible_values)
                answer_response.parts = answer_response.parts.filter(part => possible_values.includes(part.part));
                if (answer_response.parts.length === 0) {
                    setModalTitle("Skill issue");
                    setModalDescription("Be more original with your prompt!");
                    setModalIsOpen(true);
                    return;
                }
                setResponses((prevResponses) => [...prevResponses, answer_response]); // Add to the list of all responses
                setAnswer(answer_response)
                setPartIndex(0)
                setSelectedResponseIndex(responses.length)
                console.log("Selected response index: ", selectedResponseIndex)
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

    const handleSpriteClick = (index: number) => {
        setSelectedResponseIndex(index);
        console.log("Clicked item index: ", index);
        setAnswer(responses[index])
        setPartIndex(0)
        setshowSprite(!!responses[index] && !responses[index].error)
    }

    const handleEyeClick = (index: number) => {
        setSelectedResponseIndex(index);
        console.log("Clicked item index: ", index);
        setAnswer(responses[index])
        setModalIsOpen(true);
        setModalTitle(answer?.parts[partIndex].part || "");
        setModalDescription(answer?.parts[partIndex].text || "");
    }


    const handleForwardClick = () => {
            if (answer) {
                setPartIndex(prev => (prev + 1) % answer.parts.length);
            }
        };
    
        const handleBackClick = () => {
            if (answer) {
                setPartIndex(prev => prev === 0 ? answer.parts.length - 1 : prev - 1);
            }
        };
    
    
        const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {    
            console.log(event.key)
            if (event.key === "ArrowLeft") {
                handleBackClick();
            }
            if (event.key === "ArrowRight") {
                handleForwardClick();
            }
        };
    
        const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
    
        const handleMouseDown = (e: React.MouseEvent) => {
            setMouseDownPos({ x: e.clientX, y: e.clientY });
        };
    
        const handleMouseUp = (e: React.MouseEvent) => {
            const distance = Math.sqrt(
            Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
            );
    
            if (distance < 5) {
                handleForwardClick();
            }
        };
    
    return (
        <div className="relative h-screen w-full">
            {/* Animated list on the left */}
            <div className="absolute top-0 left-3 w-1/4 p-4" style={{ maxHeight: '100vh', overflowY: 'auto', zIndex: 10 }}>
                {responses.length !== 0 && (
                <h1 className="text-2xl font-bold">History</h1>
                )}
                <div className="flex flex-col gap-2"></div>
                <AnimatedList>
                    {responses
                        .filter(response => response.question)
                        .map((response, index) => (
                            <AnimatedListItem key={index}>
                                <div className={`p-2 ${selectedResponseIndex === index ? 'border-2 border-black/80 shadow-lg scale-[1.02]' : 'border border-black/20'} rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-200`}>
                                    <h3 className="font-bold">{response.question}</h3>
                                    <h3 className="text-sm text-gray-500">{response.parts.map(part => part.part).join(", ")}</h3>
                                    <div className="flex flex-row gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleSpriteClick(index)}>
                                            <Spline />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleEyeClick(index)}>
                                            <Eye />
                                        </Button>
                                    </div>
                                </div>
                            </AnimatedListItem>
                        ))}
                </AnimatedList>
            </div>
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onKeyDown={handleKeyDown} tabIndex={0} onFocus={(e) => e.currentTarget.focus()}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, -5, -5]} intensity={1.2} color="orange" />
                    <OrbitControls enableZoom={false} />
                    <LungModel points={points_dict} currentKey={answer?.parts[partIndex].part} />
                    {showSprite && answer && (
                        <SpriteComponent nbpost={answer.parts.length} data={answer.parts[partIndex]} firstPoint={points_dict[answer.parts[partIndex].part]} />
                    )}
                </Canvas>
            </div>

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
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            {answer && answer.parts.length > 1 &&(

                <div className="flex justify-center gap-2 mb-4">
                    {answer?.parts.map((_, index) => (
                        <div 
                            key={index}
                            className={`rounded-full transition-all duration-200 ${
                                index === partIndex 
                                    ? 'h-3 w-3 bg-black' 
                                    : 'h-2 w-2 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            )}
            </div>

            <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                {/* <div className="flex justify-end mb-4">
                    <Button onClick={handleBackClick} size="icon" className="h-12 w-12 bg-transparent hover:bg-gray-200 hover:scale-110 transition-all duration-300">
                        <Image src="/back.svg" alt="Back" width={24} height={24} />
                    </Button>
                    <Button onClick={handleForwardClick} size="icon" className="h-12 w-12 bg-transparent hover:bg-gray-200 hover:scale-110 transition-all duration-300">
                        <Image src="/forward.svg" alt="Forward" width={24} height={24} />
                    </Button>
                </div> */}
                <form onSubmit={handleSubmit} className="flex w-full space-x-2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask anything on the human lung..."
                        className="flex-grow text-lg"
                        disabled={isTyping}
                        style={{ height: '50px' }}
                    />
                    <Button type="submit" disabled={isTyping} size="icon" className="h-12 w-12">
                        <Send className="h-6 w-6" />
                    </Button>
                </form>
            </div>

            <ModalNathan
                title={modalTitle}
                description={modalDescription}
                isOpen={modalIsOpen}
                onClose={() => {
                    setModalIsOpen(false);
                    localStorage.removeItem('modalInput');
                }}
                isReroute={isReroute}
                routeLink={routeLink}
                modalInput={modalInput}
            />
        </div>
    );
}