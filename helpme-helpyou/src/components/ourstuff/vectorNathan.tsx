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

export function SpriteComponent( data: Answer) {
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

    // Text rendering
    const textPadding = 30;
    const lineHeight = 24;
    let currentY = padding + textPadding;

    // Text content
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const lines = wrapText(data.part, canvas.width - (padding * 2), ctx);
    lines.forEach(line => {
        ctx.fillText(line, padding_left, currentY);
        currentY += lineHeight;
    });

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(2, 0, 0);
    sprite.scale.set(1, 1, 1);

    return <primitive object={sprite} />;
}

export function VectorComponent({ firstPoint, secondPoint }: VectorProps) {
    const vectA = new THREE.Vector3(firstPoint.x, firstPoint.y, firstPoint.z);
    const vectB = new THREE.Vector3(1, 1, 1);
    const vectorAB = new THREE.Vector3().subVectors(vectA, vectB);
    const length = vectA.distanceTo(vectB);
    const arrowHelper = new THREE.ArrowHelper(vectorAB, vectA, length, 0xff0000);
    
    return <primitive object={arrowHelper} />;
}