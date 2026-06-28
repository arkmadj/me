import { useEffect, useState } from "react";
import MatrixRain from "./MatrixRain";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    // Start zoom animation before completing
    const zoomTimer = setTimeout(() => {
      setIsZooming(true);
    }, 2500);

    // Complete splash after zoom animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className='absolute h-full bg-[#000000] w-full z-20 overflow-hidden'>
      <MatrixRain
        className={`absolute inset-0 z-10 transition-transform duration-1000 ease-in ${
          isZooming ? 'scale-[3]' : 'scale-100'
        }`}
      />
    </div>
  );
};

export default SplashScreen;
