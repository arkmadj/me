interface AnimatedCharacterProps {
  char: string;
  index: number;
  onRef: (index: number, el: HTMLSpanElement | null) => void;
}

const AnimatedCharacter = ({ char, index, onRef }: AnimatedCharacterProps) => {
  if (char === " ") {
    return (
      <span key={index} style={{ display: "inline-block", width: "0.5em" }}>
        {" "}
      </span>
    );
  }

  return (
    <span
      key={index}
      ref={(el) => onRef(index, el)}
      aria-hidden="true"
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
  /** Readable version for screen readers (the visual text is all caps) */
  label?: string;
  className?: string;
}

export const AnimatedText = ({ text, label, charRefs, className = "" }: AnimatedTextProps) => {
  return (
    // Letters are split (and later scattered) by the physics, so screen readers get
    // the plain sentence and the individual letters are hidden from them
    <p className={className}>
      <span className="sr-only">{label ?? text}</span>
      <span aria-hidden="true">
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
      </span>
    </p>
  );
};
