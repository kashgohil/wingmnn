import { spacing } from "@constants";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type TargetAndTransition,
} from "motion/react";
import React from "react";
import { createPortal } from "react-dom";

export interface PopoverProps extends HTMLMotionProps<"div"> {
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
  initial?: TargetAndTransition;
  exit?: TargetAndTransition;
  animate?: TargetAndTransition;
}

const variantClasses = classVariance({
  compact: "p-1 text-sm",
  normal: "p-2",
  "top-left": "origin-bottom mb-2",
  "bottom-left": "origin-top mt-2",
  "top-right": "origin-bottom mb-2",
  "bottom-right": "origin-top mt-2",
  right: "origin-left -translate-y-1/2 ml-2",
  left: "origin-right -translate-y-1/2 mr-2",
  bottom: "origin-top -translate-x-1/2 mt-2",
  top: "origin-bottom -translate-x-1/2 mb-2",
});

const animateVariance = {
  top: { translateY: 10 },
  bottom: { translateY: -10 },
  left: { translateX: 10 },
  right: { translateX: -10 },
  "top-left": { translateY: 10 },
  "top-right": { translateY: 10 },
  "bottom-left": { translateY: -10 },
  "bottom-right": { translateY: -10 },
};

export function Popover(props: PopoverProps) {
  const {
    anchor,
    children,
    placement,
    onClose,
    open,
    onKeyDown,
    exit = {},
    initial = {},
    animate = {},
    transition = {},
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
          left = anchorRect.left - spacing;
          break;
        case "bottom-left":
          top = anchorRect.bottom;
          left = anchorRect.left - spacing;
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
          top = anchorRect.top + anchorRect.height / 2;
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

  const rootEl = document.getElementById(root);

  if (!rootEl) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          {...rest}
          exit={{
            opacity: 0,
            scale: 0.2,
            ...animateVariance[placement],
            ...exit,
          }}
          initial={{
            opacity: 0,
            scale: 0.2,
            ...animateVariance[placement],
            ...initial,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
            translateX: 0,
            ...animate,
          }}
          transition={{
            ...transition,
            duration: 0.2,
            ease: "easeOut",
          }}
          ref={popoverRef}
          onKeyDown={keydown}
          style={{ ...rest.style, top: position.top, left: position.left }}
          className={cx(
            "fixed z-50 bg-white-500 rounded-xl shadow-lg",
            variantClasses(placement, variant),
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    rootEl,
  );
}
