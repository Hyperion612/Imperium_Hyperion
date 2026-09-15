export default function Crest({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r1 = 26.5;
        const r2 = i % 6 === 0 ? 30.5 : 28.5;
        return (
          <line
            key={i}
            x1={32 + Math.cos(a) * r1}
            y1={32 + Math.sin(a) * r1}
            x2={32 + Math.cos(a) * r2}
            y2={32 + Math.sin(a) * r2}
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.5"
          />
        );
      })}
      <path
        d="M32 12l4.6 15.4L52 32l-15.4 4.6L32 52l-4.6-15.4L12 32l15.4-4.6z"
        fill="currentColor"
        opacity="0.95"
      />
      <circle cx="32" cy="32" r="4" fill="#05070f" />
    </svg>
  );
}
