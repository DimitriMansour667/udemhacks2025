"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GenAIUtils } from "@/app/utils/gemini_gateway";
import { NonBinary, Send } from "lucide-react";
import {
  useState,
  useRef,
  PointerEventHandler,
  KeyboardEventHandler,
  useEffect,
} from "react";
import BrainModel from "@/app/BrainModel";
import { AiAnswer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ModalNathan } from "@/components/ourstuff/modalNathan";
import {
  VectorComponent,
  SpriteComponent,
} from "@/components/ourstuff/vectorNathan";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/magicui/animated-list";
import Image from "next/image";
import { BrainParts, BodyParts } from "@/app/constant/bodyParts";
import { Spline, Eye, RefreshCw, Text } from "lucide-react";

export default function Brain() {
    // AZAP
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
        

  const [isTyping, setIsTyping] = useState(false);
  const [partIndex, setPartIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<AiAnswer | undefined>(undefined); // Holds the latest response
  const [responses, setResponses] = useState<AiAnswer[]>([]); // Holds all responses
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<
    number | null
  >(null); // Holds the index of the selected response
  const controlsRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showSprite, setshowSprite] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalInput, setModalInput] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReroute, setIsReroute] = useState(false);
  const [routeLink, setRouteLink] = useState("");
  const points_dict: { [key: string]: { x: number; y: number; z: number } } = {
    "Cerebrum": {
      x: -0.5307685642102951,
      y: 0.18521498665199987,
      z: 0.6060391294560343,
    },
    "Cerebellum": {
      x: 0.5995514895454759,
      y: -0.5581046984943983,
      z: -0.6495908313948302,
    },
    "Brainstem": {
      x: 0.23097607679126156,
      y: -0.7122985424067342,
      z: 0.12780552084877117,
    },
    "Frontal Lobe": { x: -0.5882046695307154, y: 0.6145940866691428, z: 0.02 },
    "Parietal Lobe": { x: 0.27951995256963796, y: 0.7540875925218076, z: 0.02 },
    "Temporal Lobe": { x: -0.9354594627863727, y: 0, z: -0.048221844984680406 },
    "Occipital Lobe": {
      x: 1.0539338261146913,
      y: 0.09036493727733252,
      z: 0.24006206499231558,
    },
    "Medulla Oblongata": {
      x: 0.3103568635444375,
      y: -0.9436120129849548,
      z: 0.01327201803336897,
    },
    "Limbic System": {
      x: 0.08484408250910186,
      y: 0.5155446110247102,
      z: -0.5469365826356386,
    },
    "Amygdala": {
      x: -0.20268099697845515,
      y: -0.46522303081001093,
      z: -0.002686627744875103,
    },
  };

  const saveResponses = (responses: AiAnswer[]) => {
    localStorage.setItem('brainResponses', JSON.stringify(responses));
  }

  const getResponses = () => {
    return JSON.parse(localStorage.getItem('brainResponses') ?? "[]") as AiAnswer[];
  }

  const loadResponses = () => {
    const responses = getResponses();
    if (responses) {
      setResponses(responses);
    }
  }

  useEffect(() => {
    loadResponses();

    const oldQuestion = localStorage.getItem('modalInput');
    if (oldQuestion) {
        localStorage.removeItem('modalInput')
      setInput(oldQuestion);
      handleSubmit(new Event("submit") as any, oldQuestion);
    }
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    customInput = input
  ) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsLoading(true);
    setProgress(0);

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 50);

    try {
      const answer_response = await genAi.sendRequest(
        customInput,
        BodyParts.Brain
      );
      if (answer_response.recommendation.toLowerCase() === "brain") {
        answer_response.recommendation = "none";
      }
      setProgress(100); // Complete the progress

      if (answer_response.error) {
        if (
          answer_response.recommendation != "none" &&
          answer_response.recommendation != undefined
        ) {
          setIsReroute(true);
          setRouteLink(answer_response.recommendation);
          setModalInput(customInput);
          setModalTitle(
            "Your question might be related to the " +
              answer_response.recommendation
          );
          setModalDescription(
            "Click the button below to access the related section."
          );
          setModalIsOpen(true);
          localStorage.setItem('modalInput', customInput);
        } else {
          setModalTitle("Error");
          setModalDescription("Try a more relevant question.");
          setIsReroute(false);
          setRouteLink("");
          setModalInput("");
          setModalIsOpen(true);
        }
      } else {
        const possible_values = Object.values(BrainParts) as string[];
        answer_response.parts = answer_response.parts.filter((part) =>
          possible_values.includes(part.part)
        );
        if (answer_response.parts.length === 0) {
          setModalTitle("Skill issue");
          setModalDescription("Be more original with your prompt!");
          setModalIsOpen(true);
          return;
        }

        saveResponses([...getResponses(), answer_response]); // Add to the list of all responses
        loadResponses();

        setAnswer(answer_response);
        setPartIndex(0);
        setSelectedResponseIndex(getResponses().length);
        setshowSprite(!!answer_response && !answer_response.error);
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500); // Give time for the 100% to show
      setInput("");
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSpriteClick = (index: number) => {
    setSelectedResponseIndex(index);
    setAnswer(getResponses()[index]);
    setPartIndex(0);
    setshowSprite(!!getResponses()[index] && !getResponses()[index].error);
  };

  const handleEyeClick = (index: number) => {
    setSelectedResponseIndex(index);
    setAnswer(getResponses()[index]);
    setModalIsOpen(true);
    setModalTitle(answer?.parts[partIndex].part || "");
    setModalDescription(answer?.parts[partIndex].text || "");
  };

  const handleForwardClick = () => {
    if (answer) {
      setPartIndex((prev) => (prev + 1) % answer.parts.length);
    }
  };

  const handleBackClick = () => {
    if (answer) {
      setPartIndex((prev) => (prev === 0 ? answer.parts.length - 1 : prev - 1));
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
      Math.pow(e.clientX - mouseDownPos.x, 2) +
        Math.pow(e.clientY - mouseDownPos.y, 2)
    );

    if (distance < 5) {
      handleForwardClick();
    }
  };
  const handleRefreshClick = () => {
    localStorage.removeItem('brainResponses');
    setResponses([]);
};

  return (
    <div className="relative h-screen w-full">
      {/* Animated list on the left */}
      <div
        className="absolute top-0 left-3 w-1/4 p-4"
        style={{ maxHeight: "87vh", overflowY: "auto", zIndex: 10 }}
      >
        {responses.length !== 0 && (
            <h1 className="text-2xl font-bold mb-2">History</h1>  
        )}
        <div className="flex flex-col gap-2"></div>
        <AnimatedList>
          {responses
            .filter((response) => response.question) // Filter out responses with empty questions
            .map((response, index) => (
              <AnimatedListItem key={index}>
                <div onClick={() => handleSpriteClick(index)}
                  className={`p-2 ${
                    selectedResponseIndex === index
                      ? "border-2 border-black/80 shadow-lg scale-[1.02]"
                      : "border border-black/20"
                  } rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-200 cursor-pointer`}
                >
                  <h3 className="font-bold">{response.question}</h3>
                  <h3 className="text-sm text-gray-500">
                    {response.parts.map((part) => part.part).join(", ")}
                  </h3>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEyeClick(index)}
                    >
                      <Eye />
                    </Button>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
        </AnimatedList>
      </div>

      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          onFocus={(e) => e.currentTarget.focus()}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <directionalLight
            position={[-5, -5, -5]}
            intensity={2}
            color="yellow"
          />
          <OrbitControls enableZoom={false} />
          <BrainModel
            points={points_dict}
            currentKey={answer?.parts[partIndex].part}
            historyIndex={selectedResponseIndex}
          />
          {showSprite && answer && (
            <SpriteComponent
              nbpost={answer.parts.length}
              data={answer.parts[partIndex]}
              firstPoint={points_dict[answer.parts[partIndex].part]}
            />
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
                index === partIndex ? "h-3 w-3 bg-black" : "h-2 w-2 bg-gray-300"
            }`}
            />
        ))}
        </div>
    )}
    </div>
      <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="flex justify-end mb-4">
          {/* <Button onClick={handleBackClick} size="icon" className="h-12 w-12 bg-transparent">
                        <Image src="/back.svg" alt="Back" width={24} height={24} />
                    </Button>
                    <Button onClick={handleForwardClick} size="icon" className="h-12 w-12 bg-transparent hover:bg-gray-200 hover:scale-110 transition-all duration-300">
                        <Image src="/forward.svg" alt="Forward" width={24} height={24} />
                    </Button> */}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full space-x-2 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything on the human brain..."
            className="flex-grow text-lg"
            disabled={isTyping}
            style={{ height: "50px" }}
          />
          <Button
            type="submit"
            disabled={isTyping}
            size="icon"
            className="h-12 w-12"
          >
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
