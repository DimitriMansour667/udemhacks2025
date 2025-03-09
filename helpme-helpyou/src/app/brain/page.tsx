'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {GenAIUtils} from "@/app/utils/gemini_gateway"
import { Send } from "lucide-react";
import { useState, useRef } from "react";
import BrainModel from '@/app/BrainModel'
import { AiAnswer, Answer } from "../class/answer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';

export default function Brain() {
    if(!process.env.NEXT_PUBLIC_GEMINI_API_KEY){
        return <div>No api key error</div>
    }
    const genAi = new GenAIUtils(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const [isTyping, setIsTyping] = useState(false)
    const [partIndex, setPartIndex] = useState(0)
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

    function SpriteComponent({data}) {

        const canvas = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D|null  = canvas.getContext('2d');
        console.log(data)
        if(!ctx || !data){
            return;
        }
        // Set canvas size
        canvas.width = 350;
        canvas.height = 350;
    
        const cornerRadius = 20; // Radius for the rounded corners
        const padding = 20; // Padding for text inside the rectangle
        const padding_left = 30;
    
        // Set the background color to semi-transparent gray
        ctx.fillStyle = 'rgba(128, 128, 128, 0.85)'; // Semi-transparent gray
        ctx.beginPath();
        ctx.moveTo(padding + cornerRadius, padding); // Start at the top-left corner
        ctx.arcTo(canvas.width - padding, padding, canvas.width - padding, canvas.height - padding, cornerRadius); // Top-right corner
        ctx.arcTo(canvas.width - padding, canvas.height - padding, padding, canvas.height - padding, cornerRadius); // Bottom-right corner
        ctx.arcTo(padding, canvas.height - padding, padding, padding, cornerRadius); // Bottom-left corner
        ctx.arcTo(padding, padding, canvas.width - padding, padding, cornerRadius); // Top-left corner
        ctx.closePath();
        ctx.fill();
        // Draw a rectangle with rounded corners

    
        // Set text properties
        
        // Create dynamic text
        const textPadding = 30;
        const lineHeight = 24;
        let currentY = padding + textPadding;
        
        // Draw the 'part' text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';    
        ctx.fillText(data.part, canvas.width / 2, currentY);
        currentY += lineHeight;
    
        // // Draw the 'description' text
        // ctx.font = '12px Arial';
        // const descriptionLines = wrapText(data.description, canvas.width - padding * 2, ctx);
        // descriptionLines.forEach(line => {
        //     ctx.fillText(line, canvas.width / 2, currentY);
        //     currentY += lineHeight;
        // });
    
        // Draw the 'impact' text
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';    
        if (data.impact.length > 0) {
            ctx.fillText('Impact:', padding_left, currentY);
            currentY += lineHeight;
            ctx.font = ' bold 12px Arial';
            const impactLines = wrapText(data.impact, canvas.width / 1.2, ctx);
            impactLines.forEach(line => {
                ctx.fillText(line, padding_left, currentY);
                currentY += lineHeight;
            });
        }
    
        // Draw the 'symptoms' text
        currentY += 10
        ctx.font = ' bold 16px Arial';
        if (data.symptoms.length > 0) {
            ctx.fillText('Symptoms:', padding_left, currentY);
            currentY += lineHeight;
            ctx.font = ' bold 12px Arial';
            data.symptoms.forEach(line => {
                ctx.fillText(line, padding_left, currentY);
                currentY += lineHeight;
            });
        }

    
        // Create a texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        // Create the sprite material with the texture
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      
        // Create the sprite and position it
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(2, 0, 0); // Set the position of the sprite next to the brain model
        sprite.scale.set(1, 1, 1); // Adjust the scale of the sprite
      
        return (
          <primitive object={sprite} />
        );
      };
    function wrapText(text:string, maxWidth:number, ctx: CanvasRenderingContext2D) {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        
        lines.push(line); // Push the last line
        return lines;
    }

    function VectorComponent({firstPoint,secondPoint}){
        const vectA = new THREE.Vector3(firstPoint.x, firstPoint.y, firstPoint.z)
        const vectB = new THREE.Vector3(1, 1, 1)
        const vectorAB = new THREE.Vector3().subVectors(vectA, vectB);
        const length = vectA.distanceTo(vectB);
        const arrowHelper = new THREE.ArrowHelper(vectorAB, vectA, length, 0xff0000);
        return (
            <primitive object={arrowHelper} />
          );
    }

    return (
        <div className="relative h-screen w-full">
            <div className="absolute inset-0">
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} intensity={2} />
                <OrbitControls enableZoom={true} />
                <BrainModel points={points} i={partIndex} />
                <VectorComponent firstPoint={points[partIndex]} secondPoint={[2,0,0]} />
              </Canvas>
            </div>
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