import {
    AnimatedSpan,
    Terminal,
    TypingAnimation,
  } from "@/components/magicui/terminal";
  
  export function TerminalLogging() {
    return (
      <Terminal>
        <AnimatedSpan delay={0} className="text-blue-500">
          <span>WELCOME TO THE HUMAN TERMINAL</span>
        </AnimatedSpan>
        <TypingAnimation delay={1000}>PS C:\Human> cd Bran</TypingAnimation>
        <AnimatedSpan delay={2500} className="text-red-500">
          <span>X There is no such file or directory "Bran".</span>
        </AnimatedSpan>
        <TypingAnimation delay={3000}>PS C:\Human> cd Brain</TypingAnimation>  
        <TypingAnimation delay={4500}>PS C:\Human\Brain>./Brain.exe</TypingAnimation>
        <AnimatedSpan delay={6000} className="text-green-500">
          <span>✔ Checking for updates.</span>
        </AnimatedSpan>
  
        <AnimatedSpan delay={6500} className="text-green-500">
          <span>✔ All systems are up to date.</span>
        </AnimatedSpan>
  
        <AnimatedSpan delay={7000} className="text-green-500">
          <span>✔ Loading Brain...</span>
        </AnimatedSpan>
  
        <TypingAnimation delay={7500} className="text-muted-foreground">
          Success! Brain loaded.
        </TypingAnimation>
      </Terminal>
    );
  }
  