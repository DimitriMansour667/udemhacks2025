"use client";

import * as THREE from 'three';
import { Point3D } from '@/app/types/types';
import { Answer } from '@/app/class/answer';

interface VectorProps {
    firstPoint: Point3D;
    secondPoint: Point3D;
}


function wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D) {
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
    
    lines.push(line);
    return lines;
}

export function SpriteComponent({ data, firstPoint }) {
    if (!data) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 350;
    canvas.height = 350;

    const cornerRadius = 20;
    const padding = 20;
    const padding_left = 30;

    // Background
    ctx.fillStyle = 'rgba(128, 128, 128, 0.85)';
    ctx.beginPath();
    ctx.moveTo(padding + cornerRadius, padding);
    ctx.arcTo(canvas.width - padding, padding, canvas.width - padding, canvas.height - padding, cornerRadius);
    ctx.arcTo(canvas.width - padding, canvas.height - padding, padding, canvas.height - padding, cornerRadius);
    ctx.arcTo(padding, canvas.height - padding, padding, padding, cornerRadius);
    ctx.arcTo(padding, padding, canvas.width - padding, padding, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Text content
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Set text properties
    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    
    // Create dynamic text
    const textPadding = 10;
    const lineHeight = 24;
    let currentY = padding + 10 + textPadding;
    
    // Draw 'part of body'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(data.part, canvas.width / 2 , currentY);
    currentY += lineHeight;

    // Draw 'description'
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const descriptionLines = wrapText(data.description, canvas.width - padding * 2, ctx);
    descriptionLines.forEach(line => {
        ctx.fillText(line, padding_left, currentY);
        currentY += lineHeight;
    });
    

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(.6, 0, 2);
    sprite.scale.set(1, 1, 1);
    const posVec = new THREE.Vector3()
    sprite.getWorldPosition(posVec)
    
    return <>
            <primitive object={sprite} />;
            <VectorComponent firstPoint={firstPoint} secondPoint={new THREE.Vector3(posVec.x, posVec.y, posVec.z )} />
            </>
}

export function VectorComponent({ firstPoint, secondPoint }: VectorProps) {
    const vectA = new THREE.Vector3(0, 0, Math.sqrt(firstPoint.x * firstPoint.x + firstPoint.y * firstPoint.y + firstPoint.z * firstPoint.z) * 1.5);
    const vectB = secondPoint;
    const vectorAB = new THREE.Vector3().subVectors(vectB, vectA);
    const length = vectA.distanceTo(vectB);
    const color = 0xff0000;  // Bright red for better visibility
    const headLength = 0.0;  // Larger head
    const headWidth = 0.0;   // Wider head
    const arrowHelper = new THREE.ArrowHelper(vectorAB, vectA, length, color, headLength, headWidth);
    
    return <primitive object={arrowHelper} />;
}