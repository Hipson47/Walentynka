import { useScroll, animated, useSpring } from "@react-spring/web";
import type { MotionMode } from "../hooks/useMotionMode";

const X_LINES = 36;
const INITIAL_WIDTH = 18;

type EnvelopeScrollRevealProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  motionMode: MotionMode;
};

export function EnvelopeScrollReveal({ containerRef, motionMode }: EnvelopeScrollRevealProps) {
  const [textStyles, textApi] = useSpring(() => ({
    y: "100%",
  }));

  const { scrollYProgress } = useScroll({
    container: containerRef as React.MutableRefObject<HTMLDivElement>,
    onChange: ({ value: { scrollYProgress: p } }) => {
      if (p > 0.7) {
        textApi.start({ y: "0" });
      } else {
        textApi.start({ y: "100%" });
      }
    },
    default: {
      immediate: motionMode === "off",
    },
  });

  return (
    <div className="intro-scroll-reveal" aria-hidden="true">
      <div className="intro-scroll-reveal-bars">
        <animated.div className="intro-scroll-reveal-bar-container">
          {Array.from({ length: X_LINES }).map((_, i) => (
            <animated.div
              key={`a-${i}`}
              className="intro-scroll-reveal-bar"
              style={{
                width: scrollYProgress.to((scrollP: number) => {
                  const percentilePosition = (i + 1) / X_LINES;
                  return (
                    INITIAL_WIDTH / 4 +
                    40 *
                      Math.cos(((percentilePosition - scrollP) * Math.PI) / 1.5) ** 32
                  );
                }),
              }}
            />
          ))}
        </animated.div>
        <animated.div className="intro-scroll-reveal-bar-container intro-scroll-reveal-bar-container-inverted">
          {Array.from({ length: X_LINES }).map((_, i) => (
            <animated.div
              key={`b-${i}`}
              className="intro-scroll-reveal-bar"
              style={{
                width: scrollYProgress.to((scrollP: number) => {
                  const percentilePosition = 1 - (i + 1) / X_LINES;
                  return (
                    INITIAL_WIDTH / 4 +
                    40 *
                      Math.cos(((percentilePosition - scrollP) * Math.PI) / 1.5) ** 32
                  );
                }),
              }}
            />
          ))}
        </animated.div>
      </div>
      <animated.div
        className="intro-scroll-reveal-dot"
        style={{
          clipPath: scrollYProgress.to((val: number) => `circle(${val * 100}%) at 50% 50%`),
        }}
      >
        <h2 className="intro-scroll-reveal-title">
          <span>
            <animated.span style={textStyles}>Otwórz kopertę!</animated.span>
          </span>
          <span>
            <animated.span style={textStyles}>Przeczytaj kartkę 💌</animated.span>
          </span>
        </h2>
      </animated.div>
    </div>
  );
}
