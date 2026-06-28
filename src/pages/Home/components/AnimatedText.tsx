interface AnimatedCharacterProps {
  char: string;
  index: number;
  onRef: (index: number, el: HTMLSpanElement | null) => void;
}

const AnimatedCharacter = ({ char, index, onRef }: AnimatedCharacterProps) => {
  if (char === " ") {
    return <span key={index} style={{ display: "inline-block", width: "0.5em" }} />;
  }

  return (
    <span
      key={index}
      ref={(el) => onRef(index, el)}
      className="inline-block"
      style={{
        display: "inline-block",
        opacity: 0,
      }}
    >
      {char}
    </span>
  );
};

interface AnimatedTextProps {
  text: string;
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  className?: string;
}

export const AnimatedText = ({ text, charRefs, className = "" }: AnimatedTextProps) => {
  return (
    <h1 className={className}>
      {text.split("").map((char, index) => (
        <AnimatedCharacter
          key={index}
          char={char}
          index={index}
          onRef={(idx, el) => {
            if (charRefs.current) {
              charRefs.current[idx] = el;
            }
          }}
        />
      ))}
    </h1>
  );
};
