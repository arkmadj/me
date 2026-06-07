import { useEffect, useRef } from "react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const splashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      onComplete()
    }, 500)
  })



  return (
    <div
      ref={splashRef}
      className="absolute bg-red-100 h-full w-full z-20 opacity-15"
    >
      <div>
        Splash Screen
      </div>
    </div>
  );
};

export default SplashScreen;