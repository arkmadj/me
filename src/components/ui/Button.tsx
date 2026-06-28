import React from "react";
import { cn } from "@/lib/utils";

const Button = ({
  className,
  ...props
}: React.ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        `text-green-400 font-mono text-sm tracking-wider border border-green-400 px-6 py-3 rounded hover:bg-green-400 hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]`,
        className,
      )}
      {...props}
    />
  );
};

export default Button;
