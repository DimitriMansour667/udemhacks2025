'use client'
import { TerminalLogging } from "@/components/ourstuff/terminalLogging";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <TerminalLogging />
      <div className="h-8"></div>
      <InteractiveHoverButton onClick={() => router.push('/brain')}>Access Brain</InteractiveHoverButton>
    </div>
  );
}
