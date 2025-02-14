import { IconButton } from "@components/iconButton/iconButton";
import { useFocusTrap } from "@hooks/useFocusTrap";
import { cx } from "@utility/cx";
import { CrossIcon } from "lucide-react";
import React, { MouseEvent } from "react";
import { createPortal } from "react-dom";

export interface DialogProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  open: boolean;
  onClose(): void;
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

export function Dialog(props: DialogProps) {
  const { open, children, onClose, className, ref, ...rest } = props;

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const dialogRoot = document.getElementById("dialogRoot");

  React.useImperativeHandle(ref, () => dialogRef.current!);

  const clickAwayListener = React.useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!dialogRef.current?.contains(e.currentTarget)) {
        onClose();
      }
    },
    [onClose],
  );

  useFocusTrap(dialogRef, open);

  if (!open) return null;
  if (!dialogRoot) return null;

  return createPortal(
    <div className="bg-black-700/25" onClick={clickAwayListener}>
      <div
        {...rest}
        role="dialog"
        ref={dialogRef}
        className={cx(className, "rounded-lg bg-black-200")}
      >
        {children}
      </div>
    </div>,
    dialogRoot,
  );
}

export function DialogTitle(props: DialogTitleProps) {
  const { className, children, onClose, ...rest } = props;

  return (
    <div
      {...rest}
      className={cx(className, "flex items-center justify-between px-8 py-4")}
    >
      {children}
      {onClose ? (
        <IconButton icon={CrossIcon} onClick={onClose} className="ml-auto" />
      ) : null}
    </div>
  );
}

export function DialogContent(props: DialogContentProps) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} className={cx(className, "px-8 py-4")}>
      {children}
    </div>
  );
}

export function DialogActions(props: DialogActionsProps) {
  const { className, children, ...rest } = props;

  return (
    <div {...rest} className={cx(className, "px-8 py-4 flex items-center")}>
      {children}
    </div>
  );
}
