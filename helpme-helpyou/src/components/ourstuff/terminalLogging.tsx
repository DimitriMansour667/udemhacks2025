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
        <TypingAnimation delay={1500}>$ sudo apt install Human</TypingAnimation>
        <AnimatedSpan delay={3000} className="text-gray-500">
          <span>Checking packages...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={4000} className="text-yellow-500">
            <span>! Warning: Package "Apendix" has been deprecated.</span>
        </AnimatedSpan>
        <AnimatedSpan delay={4500} className="text-green-500">
          <span>✔ All packages have been installed.</span>
        </AnimatedSpan>
        <AnimatedSpan delay={5000} className="text-green-500">
          <span>✔ Loading Human...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={5500} className="text-gray-500">
            <span>Human loaded.</span>
        </AnimatedSpan>
      </Terminal>
    );
  }
  