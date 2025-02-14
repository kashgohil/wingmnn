import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import React from "react";
import { createPortal } from "react-dom";

export interface PopoverProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  open: boolean;
  onClose(): void;
  anchor: React.RefObject<HTMLElement | null>;
  placement: "top-left" | "bottom-left" | "top-right" | "bottom-right";
  variant?: "compact" | "normal";
}

const variantClasses = classVariance({
  compact: "p-1 text-sm",
  normal: "p-2",
  "top-left": "origin-bottom-left",
  "bottom-left": "origin-top-left",
  "top-right": "origin-bottom-right",
  "bottom-right": "origin-top-right",
});

export function Popover(props: PopoverProps) {
  const {
    anchor,
    children,
    placement,
    onClose,
    open,
    onKeyDown,
    variant = "normal",
    className,
    ...rest
  } = props;

  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updatePosition = () => {
      if (!anchor.current || !popoverRef.current) return;

      const anchorRect = anchor.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top-left":
          top = anchorRect.top - popoverRect.height;
          left = anchorRect.left;
          break;
        case "bottom-left":
          top = anchorRect.bottom;
          left = anchorRect.left;
          break;
        case "top-right":
          top = anchorRect.top - popoverRect.height;
          left = anchorRect.right - popoverRect.width;
          break;
        case "bottom-right":
          top = anchorRect.bottom;
          left = anchorRect.right - popoverRect.width;
          break;
      }

      // Add window scroll offset
      top += window.scrollY;
      left += window.scrollX;

      setPosition({ top, left });
    };

    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [open, anchor, placement]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchor.current &&
        !anchor.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, anchor, onClose]);

  const keydown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose, onKeyDown],
  );

  if (!open) return null;

  const popoverRoot = document.getElementById("popoverRoot");

  if (!popoverRoot) return null;

  return createPortal(
    <div
      {...rest}
      onKeyDown={keydown}
      style={{ ...rest.style, top: position.top, left: position.left }}
      className={cx(
        className,
        "fixed z-50 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
        variantClasses(placement, variant),
      )}
    >
      {children}
    </div>,
    popoverRoot,
  );
}
