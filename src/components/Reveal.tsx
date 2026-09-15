import { type ReactNode } from "react";
import { useInView } from "../lib/hooks";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
}

export default function Reveal({ children, className = "", delay = 0, as = "div" }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      className={`rv ${inView ? "rv-on" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export function MaskLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="mask-line">
      <span style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</span>
    </span>
  );
}
