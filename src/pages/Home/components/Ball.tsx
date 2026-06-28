import { forwardRef } from "react";

export const Ball = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div
        ref={ref}
        className="size-8 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-auto"
      />
    </div>
  );
});

Ball.displayName = "Ball";
