import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { AnimatePresence, HTMLMotionProps, motion } from "motion/react";
import React from "react";
import { createPortal } from "react-dom";

export interface PopoverProps
  extends Omit<
    HTMLMotionProps<"div">,
    "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  open: boolean;
  onClose(): void;
  anchor: React.RefObject<HTMLElement | null>;
  placement:
    | "top-left"
    | "bottom-left"
    | "top-right"
    | "bottom-right"
    | "left"
    | "right"
    | "top"
    | "bottom";
  variant?: "compact" | "normal";
  root?: "popover-root" | "tooltip-root";
}

const variantClasses = classVariance({
  compact: "p-1 text-sm",
  normal: "p-2",
  "top-left": "origin-bottom-left",
  "bottom-left": "origin-top-left",
  "top-right": "origin-bottom-right",
  "bottom-right": "origin-top-right",
  right: "origin-left",
  left: "origin-right",
  bottom: "origin-top",
  top: "origin-bottom",
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
    root = "popover-root",
    ...rest
  } = props;

  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
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
        case "top":
          top = anchorRect.top - popoverRect.height;
          left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
          break;
        case "bottom":
          top = anchorRect.bottom;
          left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
          break;
        case "left":
          top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
          left = anchorRect.left - popoverRect.width;
          break;
        case "right":
          top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
          left = anchorRect.right;
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

  const popoverRoot = document.getElementById(root);

  if (!popoverRoot) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          {...rest}
          ref={popoverRef}
          onKeyDown={keydown}
          style={{ ...rest.style, top: position.top, left: position.left }}
          className={cx(
            "fixed z-50 bg-white-500 rounded-lg shadow-lg",
            variantClasses(placement, variant),
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    popoverRoot,
  );
}
