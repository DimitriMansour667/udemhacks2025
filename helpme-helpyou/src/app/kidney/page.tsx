'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway"
import {  Send, Spline, Eye } from "lucide-react";
import { useState, useRef,  KeyboardEventHandler,  useEffect } from "react";
import KidneyModel from '@/app/KidneyModel'
import { AiAnswer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import { SpriteComponent } from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { KidneyParts } from "@/app/constant/bodyParts"
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list";
import { BodyParts } from "@/app/constant/bodyParts";
// mamelon
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
    const [modalInput, setModalInput] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<number | null>(null); // Holds the index of the selected response
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showingModel, setShowingModel] = useState(false);
    const [isReroute, setIsReroute] = useState(false);
    const [routeLink, setRouteLink] = useState("");
    const points_dict: { [key: string]: { x: number, y: number, z: number } } = {
        "Renal Artery": { x: 0.14197008894221275, y: 0.1510056992837222, z: -0.0474645050978109 }, // Reinal Artery
        "Renal Vein": { x: -0.09266655990271129, y: 0.07673202226194742, z: 0.12560388714898651 }, // Renal Vein
        "Ureter": { x: 0.03454300102385906, y: 0.14640120990398575, z: 0.07322032575937706 }, // Ureter
        "Renal Pelvis": { x: -0.07735738907917715, y: 0.15904299995250792, z: 0.001166892950766126 }, // Renal Pelvis
        "Medulla": { x: -0.7550017828952282, y: 0.8469339433521645, z: 0.0028131433130842006 }, // Medulla
        "Cortex": { x: -0.3920363927567727, y: 0.8741752335712509, z: -0.019888666615165376 }, // Cortex
        "Nephron": { x: 0.8054631252283667, y: 0.5353339986846517, z: -0.19906144681366653 }, // Nephron
        "Renal Capsule": { x: 0.5903147887166088, y: -0.7959747341315074, z: 0.005024125140933365 }, // Renal Capsule

    };

    const saveResponses = (responses: AiAnswer[]) => {
      localStorage.setItem('kidneyResponses', JSON.stringify(responses));
    }
  
    const getResponses = () => {
      return JSON.parse(localStorage.getItem('kidneyResponses') ?? "[]") as AiAnswer[];
    }
  
    const loadResponses = () => {
      const responses = getResponses();
      if (responses) {
        setResponses(responses);
      }
    }

    useEffect(() => {
        loadResponses();
    
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
            const answer_response = await genAi.sendRequest(customInput, BodyParts.Kidney)
            if (answer_response.recommendation.toLowerCase() === "kidney") {
                answer_response.recommendation = "none";
            }
            setProgress(100); // Complete the progress

            if (answer_response.error) {
                if (answer_response.recommendation != 'none' && answer_response.recommendation != undefined) {
                    setIsReroute(true);
                    setRouteLink(answer_response.recommendation);
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
                const possible_values = Object.values(KidneyParts) as string[];
                answer_response.parts = answer_response.parts.filter(part => possible_values.includes(part.part));
                if (answer_response.parts.length === 0) {
                    setModalTitle("Skill issue");
                    setModalDescription("Be more original with your prompt!");
                    setModalIsOpen(true);
                    return
                }

                saveResponses([...getResponses(), answer_response]); // Add to the list of all responses
                loadResponses();
        
                setAnswer(answer_response)
                setPartIndex(0)
                setSelectedResponseIndex(getResponses().length);
                setshowSprite(!!answer_response && !answer_response.error)
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
        setAnswer(getResponses()[index]);
        setPartIndex(0);
        setshowSprite(!!getResponses()[index] && !getResponses()[index].error);
    }

    const handleEyeClick = (index: number) => {
        setSelectedResponseIndex(index);
        setAnswer(getResponses()[index]);
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

        const handleRefreshClick = () => {
            localStorage.removeItem('kidneyResponses');
            setResponses([]);
        };

    return (

        <div className="relative h-screen w-full">
            {/* Animated list on the left */}
            <div className="absolute top-0 left-3 w-1/4 p-4" style={{ maxHeight: '87vh', overflowY: 'auto', zIndex: 10 }}>
            {responses.length !== 0 && (
            <h1 className="text-2xl font-bold mb-2">History</h1>
            )}
            <div className="flex flex-col gap-2"></div>
            <AnimatedList>
                {responses
                .filter(response => response.question) // Filter out responses with empty questions
                .map((response, index) => (
                    <AnimatedListItem key={index}>
                        <div  onClick={() => handleSpriteClick(index)} className={`p-2 ${selectedResponseIndex === index ? 'border-2 border-black/80 shadow-lg scale-[1.02]' : 'border border-black/20'} rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-200 cursor-pointer`}>
                            <h3 className="font-bold">{response.question}</h3>
                            <h3 className="text-sm text-gray-500">{response.parts.map(part => part.part).join(", ")}</h3>
                            <div className="flex flex-row gap-2">
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
                    <directionalLight position={[-5, -5, -5]} intensity={1} color="white" />
                    <OrbitControls enableZoom={false} />
                    <KidneyModel points={points_dict} currentKey={answer?.parts[partIndex].part}
            historyIndex={selectedResponseIndex} />
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

            <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
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
                <form onSubmit={handleSubmit} className="flex w-full space-x-2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask anything on the human kidney..."
                        className="flex-grow text-lg"
                        disabled={isTyping}
                        style={{ height: '50px' }}
                    />
                    <Button type="submit" disabled={isTyping} size="icon" className="h-12 w-12">
                        <Send className="h-6 w-6" />
                    </Button>
                </form>
            </div>
            <div className="absolute bottom-[7%] left-1/70 bg-white/80 backdrop-blur-sm shadow-lg">
                <Button 
                className="x-4 y-2"
                onClick={handleRefreshClick}>
                    Delete History
                </Button>
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