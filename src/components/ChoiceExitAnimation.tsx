import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CSSProperties } from "react";

type ChoiceExitAnimationProps = {
  accentColor?: string;
};

export function ChoiceExitAnimation({ accentColor = "#0cdcf7" }: ChoiceExitAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="choice-exit-animation" style={{ "--choice-accent": accentColor } as CSSProperties}>
      <AnimatePresence initial={false}>
        {isVisible ? (
          <motion.div
            key="choice-preview-box"
            className="choice-exit-box"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          />
        ) : null}
      </AnimatePresence>
      <motion.button
        className="choice-exit-toggle"
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        whileTap={{ y: 1 }}
      >
        {isVisible ? "Schowaj" : "Pokaż"}
      </motion.button>
    </div>
  );
}
