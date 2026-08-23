import { useId, useState } from "react";
import { usePrefersReducedMotion } from "../lib/hooks";

/**
 * Государственный флаг Империи (public/flag.png) с эффектом развевающегося
 * полотнища (feTurbulence + feDisplacementMap). Если файла нет — рисуется
 * гербовый фолбэк, чтобы страница никогда не выглядела сломанной.
 */
export default function Flag({ className = "h-14 w-21", alt = "Государственный флаг Империи Гиперион" }: { className?: string; alt?: string }) {
  const reduced = usePrefersReducedMotion();
  const fid = `wave-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg viewBox="0 0 300 200" className={className} role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
        <rect width="300" height="200" fill="#0c1222" />
        <path d="M0 200L300 0v60L60 200z" fill="#8a6d2f" opacity="0.9" />
        <rect y="150" width="300" height="26" fill="#57ddc4" opacity="0.85" />
        <path d="M70 52l8.5 21 21 8.5-21 8.5L70 111l-8.5-21-21-8.5 21-8.5z" fill="#e3b54a" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 300 200" className={className} role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={fid} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="7" result="cloth">
            {!reduced && (
              <animate
                attributeName="baseFrequency"
                values="0.012 0.03;0.017 0.042;0.012 0.03"
                dur="7s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="cloth" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <image
        href="./flag.png"
        x="-8"
        y="-8"
        width="316"
        height="216"
        preserveAspectRatio="xMidYMid slice"
        filter={`url(#${fid})`}
        onError={() => setFailed(true)}
      />
    </svg>
  );
}
