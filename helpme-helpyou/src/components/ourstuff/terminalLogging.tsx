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
        <TypingAnimation delay={1500}>$ sudo apt install human</TypingAnimation>
        <AnimatedSpan delay={3000} className="text-gray-500">
          <span>Checking packages...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={3300} className="text-gray-500">
          <span>Installing lungs...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={3600} className="text-gray-500">
          <span>Installing kidneys...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={3900} className="text-yellow-500">
            <span>! Warning: Package "apendix" has been deprecated</span>
        </AnimatedSpan>
        <AnimatedSpan delay={4200} className="text-gray-500">
          <span>Installing brain...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={4500} className="text-gray-500">
          <span>Installing heart...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={4800} className="text-yellow-500">
            <span>! Warning: Package "stomach" in developement</span>
        </AnimatedSpan>
        <AnimatedSpan delay={5200} className="text-green-500">
          <span>✔ All packages have been installed.</span>
        </AnimatedSpan>
        <AnimatedSpan delay={5300} className="text-green-500">
          <span>✔ Loading human...</span>
        </AnimatedSpan>
        <AnimatedSpan delay={5500} className="text-gray-500">
            <span>Human loaded.</span>
        </AnimatedSpan>
      </Terminal>
    );
  }
  