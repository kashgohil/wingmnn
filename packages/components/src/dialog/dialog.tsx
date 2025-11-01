import { IconButton } from "@components/iconButton/iconButton";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { X } from "lucide-react";
import * as React from "react";

const dialogVariants = classVariance({
  sm: "25%",
  md: "33.33%",
  lg: "50%",
  xl: "66.66%",
});

const dialogHeightVariants = classVariance({
  sm: "40%",
  md: "50%",
  lg: "80%",
  xl: "90%",
});

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cx(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  style,
  size = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cx(
          "bg-black-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-accent/40 p-4 px-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        style={{
          minHeight: dialogHeightVariants(size),
          minWidth: dialogVariants(size),
          ...style,
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cx("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cx("flex gap-2", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  children,
  onClose,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & { onClose?(): void }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cx("text-lg leading-none font-semibold", className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        {onClose ? (
          <IconButton
            icon={X}
            size="sm"
            shape="circle"
            onClick={onClose}
            variant="secondary"
            iconProps={{ size: 16 }}
            className="p-2 text-accent"
          />
        ) : null}
      </DialogPrimitive.Close>
    </DialogPrimitive.Title>
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cx("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
