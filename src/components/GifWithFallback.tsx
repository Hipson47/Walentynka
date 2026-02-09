import { useState } from "react";

type GifWithFallbackProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
};

export function GifWithFallback({ src, alt, fallback, className = "" }: GifWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`gif-wrap ${className}`.trim()}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className="gif"
          onError={() => setFailed(true)}
          loading="eager"
        />
      ) : null}
      {failed ? <div className="gif-fallback">{fallback}</div> : null}
    </div>
  );
}
