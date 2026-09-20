import { useCallback, useState } from "react";

export interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (value: boolean) => void;
}

export function useDisclosure(initial = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return { isOpen, open, close, toggle, setOpen: setIsOpen };
}

export function useDocumentTitle(title?: string): void {
  if (typeof document !== "undefined") {
    document.title = title
      ? `${title} · Resource Bridge`
      : "Resource Bridge — Give what you have, where it's needed";
  }
}
