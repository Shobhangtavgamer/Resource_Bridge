import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Optional vertical offset in the raw direction (defaults to 20px downward). */
  y?: number;
  as?: "div" | "section" | "li" | "span" | "article" | "figure" | "header" | "ul";
}

export function Reveal({ children, className, delay = 0, y = 20, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -48px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const style: CSSProperties | undefined = {
    ...(delay > 0 ? { transitionDelay: `${delay}ms` } : {}),
    ...(visible ? {} : { transform: `translateY(${y}px)` }),
  };
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-all duration-500 ease-out will-change-transform",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}