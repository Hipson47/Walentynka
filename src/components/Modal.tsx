import { type PropsWithChildren, useEffect, useRef } from "react";

type ModalProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onClose: () => void;
}>;

export function Modal({ title, open, onClose, children }: ModalProps) {
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal-panel">
        <button
          ref={closeButtonRef}
          className="modal-close"
          type="button"
          aria-label="Zamknij"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 id="modal-title">{title}</h2>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
