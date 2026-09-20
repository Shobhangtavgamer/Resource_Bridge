import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

export interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Delay injected into the first item (ms). */
  delay?: number;
  /** Gap between each revealed child (ms). */
  stagger?: number;
  as?: "div" | "ul" | "ol";
}

export function Stagger({ children, className, delay = 0, stagger = 70, as = "div" }: StaggerProps) {
  const Tag = as;
  return (
    <Tag className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const itemTag = as === "ul" || as === "ol" ? "li" : "div";
        return (
          <Reveal
            as={itemTag}
            key={child.key ?? index}
            delay={delay + index * stagger}
            className="h-full"
          >
            {child}
          </Reveal>
        );
      })}
    </Tag>
  );
}