type CssHeroFallbackProps = {
  heroImageSrc: string;
  vNorm: number;
  isAnimated: boolean;
};

export function CssHeroFallback({ heroImageSrc, vNorm, isAnimated }: CssHeroFallbackProps) {
  const scale = isAnimated ? 1 + Math.min(0.015, vNorm * 0.015) : 1;

  return (
    <div className="hero-css-fallback" aria-hidden="true">
      <img
        className="hero-css-image"
        src={heroImageSrc}
        alt=""
        style={{ transform: `scale(${scale.toFixed(4)})` }}
      />
    </div>
  );
}
