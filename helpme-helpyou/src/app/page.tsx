'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import BrainModel from "./BrainModel";

export default function Home() {
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

  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <h1 className="text-balance text-4xl font-semibold leading-none tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        The&nbsp;
        <LineShadowText className="italic" shadowColor={shadowColor}>
          Human
        </LineShadowText>
        &nbsp;Terminal
      </h1>
      <div className="h-8"></div>
      <TerminalLogging />
      <div className="h-8"></div>
      <div className="flex flex-row items-center justify-center gap-4">
        <InteractiveHoverButton onClick={() => router.push('/brain')}>Access Brain</InteractiveHoverButton>
        <InteractiveHoverButton onClick={() => router.push('/heart')}>Access Heart</InteractiveHoverButton>
        <InteractiveHoverButton onClick={() => router.push('/lung')}>Access Lungs</InteractiveHoverButton>
      </div>
      <div className="h-8"></div>
      <div className="flex flex-row items-center justify-center gap-4">
        <InteractiveHoverButton onClick={() => router.push('/kidney')}>Access Kidneys</InteractiveHoverButton>
        <InteractiveHoverButton onClick={() => router.push('/')}>🚧 Access Stomach 🚧</InteractiveHoverButton>
      </div>
    </div>
  );
}
