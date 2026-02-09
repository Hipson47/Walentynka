import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inflateRect, intersects, type RectLike } from "../utils/geom";
import { randomInRange } from "../utils/rand";

type RunawayNoButtonProps = {
  getYesRect: () => DOMRect | null;
};

const EDGE_PADDING = 20;
const YES_BUFFER = 90;
const MOVE_THROTTLE_MS = 150;

export function RunawayNoButton({ getYesRect }: RunawayNoButtonProps) {
  const placeholderRef = useRef<HTMLButtonElement>(null);
  const portalButtonRef = useRef<HTMLButtonElement>(null);
  const lastMoveAtRef = useRef(0);
  const pendingRafRef = useRef<number | null>(null);
  const [isEscaped, setIsEscaped] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    return () => {
      if (pendingRafRef.current !== null) {
        window.cancelAnimationFrame(pendingRafRef.current);
      }
    };
  }, []);

  const moveToSafePosition = useCallback(() => {
    const button = portalButtonRef.current;
    if (!button) return;

    const now = Date.now();
    if (now - lastMoveAtRef.current < MOVE_THROTTLE_MS) return;
    lastMoveAtRef.current = now;

    const currentRect = button.getBoundingClientRect();
    const yesRect = getYesRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = vw - currentRect.width - EDGE_PADDING;
    const maxY = vh - currentRect.height - EDGE_PADDING;

    let nextLeft = currentRect.left;
    let nextTop = currentRect.top;

    for (let i = 0; i < 24; i += 1) {
      const x = randomInRange(EDGE_PADDING, Math.max(EDGE_PADDING, maxX));
      const y = randomInRange(EDGE_PADDING, Math.max(EDGE_PADDING, maxY));
      const candidate: RectLike = {
        left: x,
        top: y,
        right: x + currentRect.width,
        bottom: y + currentRect.height,
        width: currentRect.width,
        height: currentRect.height,
      };

      if (!yesRect) {
        nextLeft = x;
        nextTop = y;
        break;
      }

      if (!intersects(candidate, inflateRect(yesRect, YES_BUFFER))) {
        nextLeft = x;
        nextTop = y;
        break;
      }
    }

    setPortalStyle({
      position: "fixed",
      left: nextLeft,
      top: nextTop,
      margin: 0,
      zIndex: 12000,
    });
  }, [getYesRect]);

  useEffect(() => {
    if (!isEscaped || !portalStyle) return;
    pendingRafRef.current = window.requestAnimationFrame(() => {
      moveToSafePosition();
    });
  }, [isEscaped, moveToSafePosition, portalStyle]);

  const triggerEscape = useCallback(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    if (!isEscaped) {
      const currentRect = placeholder.getBoundingClientRect();
      setPortalStyle({
        position: "fixed",
        left: currentRect.left,
        top: currentRect.top,
        margin: 0,
        zIndex: 12000,
      });
      setIsEscaped(true);
      return;
    }

    moveToSafePosition();
  }, [isEscaped, moveToSafePosition]);

  return (
    <>
      <button
        ref={placeholderRef}
        className="btn btn-secondary"
        type="button"
        aria-hidden={isEscaped}
        tabIndex={isEscaped ? -1 : 0}
        style={isEscaped ? { opacity: 0, pointerEvents: "none" } : undefined}
        onPointerEnter={triggerEscape}
        onPointerDown={(event) => {
          event.preventDefault();
          triggerEscape();
        }}
        onClick={(event) => {
          event.preventDefault();
          triggerEscape();
        }}
      >
        NIE
      </button>
      {isEscaped && portalStyle
        ? createPortal(
            <button
              ref={portalButtonRef}
              className="btn btn-secondary runaway-portal-btn"
              type="button"
              style={portalStyle}
              onPointerEnter={triggerEscape}
              onPointerDown={(event) => {
                event.preventDefault();
                triggerEscape();
              }}
              onClick={(event) => {
                event.preventDefault();
                triggerEscape();
              }}
            >
              NIE
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
