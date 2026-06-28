import { forwardRef } from "react";

interface BatProps {
  visible: boolean;
}

export const Bat = forwardRef<HTMLDivElement, BatProps>(({ visible }, ref) => {
  return (
    <div
      ref={ref}
      className="w-1/6 max-md:w-20 h-6 bg-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.6)] absolute bottom-6 left-1/2 -translate-x-1/2 origin-bottom"
      style={{ transform: visible ? "scale(1)" : "scale(0)" }}
    />
  );
});

Bat.displayName = "Bat";
