interface InsigniaProps {
  rankId: string;
  className?: string;
}

/** Hand-drawn imperial insignia per rank — no icon library. */
export default function Insignia({ rankId, className = "h-9 w-9" }: InsigniaProps) {
  const stroke = "currentColor";
  switch (rankId) {
    case "emperor": // crown with rays
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <path d="M8 34l4-16 8 9 4-13 4 13 8-9 4 16z" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M10 39h28" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 4v5M12 8l3 4M36 8l-3 4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "chancellor": // signet / seal
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <circle cx="24" cy="24" r="16" stroke={stroke} strokeWidth="2.2" />
          <circle cx="24" cy="24" r="10" stroke={stroke} strokeWidth="1.4" opacity="0.6" />
          <path d="M24 16l2.2 5.8L32 24l-5.8 2.2L24 32l-2.2-5.8L16 24l5.8-2.2z" fill={stroke} />
        </svg>
      );
    case "senator": // column
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <path d="M10 12h28M12 8h24M10 40h28M12 44h24" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M15 12v28M24 12v28M33 12v28" stroke={stroke} strokeWidth="2.2" />
        </svg>
      );
    case "governor": // compass / province
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <circle cx="24" cy="24" r="17" stroke={stroke} strokeWidth="2" />
          <path d="M24 7v6M24 35v6M7 24h6M35 24h6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M29 19l-3.4 8.6L19 29l3.4-8.6z" fill={stroke} />
        </svg>
      );
    case "citizen": // passport star
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <rect x="9" y="7" width="30" height="34" stroke={stroke} strokeWidth="2.2" />
          <path d="M24 16l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z" fill={stroke} />
        </svg>
      );
    default: // resident — keyhole
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <circle cx="24" cy="20" r="8" stroke={stroke} strokeWidth="2.2" />
          <path d="M21 26l-3 14h12l-3-14" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="24" cy="20" r="3" fill={stroke} />
        </svg>
      );
  }
}
