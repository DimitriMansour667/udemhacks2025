'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { Suspense, useEffect } from "react";

export default function Home() {
    useEffect(() => {
        const modalInput = localStorage.getItem('modalInput');
        if (modalInput) {
            localStorage.removeItem('modalInput')
        }
    }, []);

  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
    </Suspense>
  );
}
