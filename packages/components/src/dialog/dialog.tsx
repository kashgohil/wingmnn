import { IconButton } from "@components/iconButton/iconButton";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { useFocusTrap } from "@wingmnn/utils/hooks";
import { escape } from "@wingmnn/utils/interactivity";
import { X } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type TargetAndTransition,
} from "motion/react";
import React, { type MouseEvent } from "react";
import { createPortal } from "react-dom";

export interface DialogProps extends HTMLMotionProps<"div"> {
  open: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onClose(): void;
  initial?: TargetAndTransition;
  exit?: TargetAndTransition;
  animate?: TargetAndTransition;
}

export interface DialogTitleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClose?(): void;
}

export type DialogContentProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type DialogActionsProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const dialogVariants = classVariance({
  sm: "max-w-1/4",
  md: "max-w-1/3",
  lg: "max-w-1/2",
  xl: "max-w-2/3",
});

export function Dialog(props: DialogProps) {
  const {
    open,
    size = "md",
    children,
    onClose,
    className,
    ref,
    initial = {},
    animate = {},
    exit = {},
    ...rest
  } = props;

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const dialogRoot = document.getElementById("dialog-root");

  React.useImperativeHandle(ref, () => dialogRef.current!);

  const clickAwayListener = React.useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!dialogRef.current?.contains(e.target as HTMLElement)) {
        onClose();
      }
    },
    [onClose],
  );

  useFocusTrap(dialogRef, open);

  if (!dialogRoot) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={clickAwayListener}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black-700/70 z-51 h-full w-full fixed top-0 left-0 flex items-center justify-center"
        >
          <motion.div
            {...rest}
            initial={{ opacity: 0, scale: 0.9, ...initial }}
            animate={{ opacity: 1, scale: 1, ...animate }}
            exit={{ opacity: 0, scale: 0.9, ...exit }}
            role="dialog"
            ref={dialogRef}
            onKeyDown={escape(onClose)}
            className={cx(
              "rounded-lg bg-black-50 w-full z-1",
              dialogVariants(size),
              className,
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    dialogRoot,
  );
}

export function DialogTitle(props: DialogTitleProps) {
  const { className, children, onClose, ...rest } = props;

  return (
    <div
      {...rest}
      className={cx(
        className,
        "flex items-center justify-between px-4 py-3 text-xl",
      )}
    >
      {children}
      {onClose ? (
        <IconButton
          icon={X}
          size="sm"
          shape="circle"
          onClick={onClose}
          iconProps={{ size: 16 }}
          className="ml-auto p-2 bg-black-50"
        />
      ) : null}
    </div>
  );
}

export function DialogContent(props: DialogContentProps) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} className={cx(className, "px-4 py-3")}>
      {children}
    </div>
  );
}

export function DialogActions(props: DialogActionsProps) {
  const { className, children, ...rest } = props;

  return (
    <div
      {...rest}
      className={cx("px-4 w-full py-3 flex items-center", className)}
    >
      {children}
    </div>
  );
}
