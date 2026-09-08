interface IconProps {
  className?: string;
}

/** Кулак — символ Справедливости */
export function Fist({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
      <path d="M13 24v-9a3 3 0 0 1 6 0v-3a3 3 0 0 1 6 0v3a3 3 0 0 1 6 0v4a3 3 0 0 1 6 0v10c0 7-4 12-11 12h-3c-6 0-10-3.6-10-9z" />
      <path d="M13 24c-3 0-5-2-5-5s2-5 5-5v4" strokeLinecap="round" />
      <path d="M19 15v6M25 14v7M31 17v4" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

/** Инь-Ян — символ Равновесия */
export function YinYang({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M24 7a17 17 0 0 1 0 34a8.5 8.5 0 0 1 0-17a8.5 8.5 0 0 0 0-17z" fill="currentColor" />
      <circle cx="24" cy="15.5" r="2.6" fill="currentColor" />
      <circle cx="24" cy="32.5" r="2.6" fill="#080c18" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Монета HYPER */
export function HyperCoin({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <circle cx="24" cy="24" r="17" strokeWidth="2.2" />
      <path d="M16 14v20M32 14v20M16 24h16" strokeLinecap="round" />
    </svg>
  );
}

/** Замок — заблокированный доступ */
export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <rect x="10" y="20" width="28" height="20" />
      <path d="M16 20v-6a8 8 0 0 1 16 0v6" />
      <circle cx="24" cy="30" r="2.6" fill="currentColor" stroke="none" />
      <path d="M24 32v4" strokeLinecap="round" />
    </svg>
  );
}

/** Почтовый конверт — уведомления */
export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <rect x="7" y="12" width="34" height="24" />
      <path d="M7 14l17 13 17-13" />
    </svg>
  );
}

/** Солнце — Уровень Света */
export function SunIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <circle cx="24" cy="24" r="9" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4.2 4.2M33.3 33.3l4.2 4.2M37.5 10.5l-4.2 4.2M14.7 33.3l-4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}

/** Корона — трон Императора */
export function CrownIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
      <path d="M8 34l4-16 8 9 4-13 4 13 8-9 4 16z" />
      <path d="M10 39h28" strokeLinecap="round" />
    </svg>
  );
}
