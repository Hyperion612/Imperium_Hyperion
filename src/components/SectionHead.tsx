import Reveal, { MaskLine } from "./Reveal";

interface SectionHeadProps {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}

export default function SectionHead({ index, kicker, title, sub, align = "left" }: SectionHeadProps) {
  const centered = align === "center";
  return (
    <Reveal className={`mb-12 md:mb-16 ${centered ? "text-center" : ""}`}>
      <div
        className={`flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-gold uppercase ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="inline-block h-px w-8 bg-gold/60" aria-hidden />
        <span>
          {index} — {kicker}
        </span>
        <span className="inline-block h-px w-8 bg-gold/60" aria-hidden />
      </div>
      <h2 className="font-display mt-4 text-[clamp(1.7rem,4.2vw,3.1rem)] leading-[1.08] font-semibold text-ink">
        <MaskLine>{title}</MaskLine>
      </h2>
      {sub && (
        <p className={`mt-4 max-w-2xl text-[15px] leading-relaxed text-mist ${centered ? "mx-auto" : ""}`}>{sub}</p>
      )}
    </Reveal>
  );
}

export function Corners({ className = "text-gold/50" }: { className?: string }) {
  const base = "pointer-events-none absolute h-3.5 w-3.5 " + className;
  return (
    <>
      <span aria-hidden className={`${base} top-0 left-0 border-t border-l`} />
      <span aria-hidden className={`${base} top-0 right-0 border-t border-r`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}
