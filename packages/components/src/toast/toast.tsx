import { Typography } from "@components/Typography/typography";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { mapObj } from "@wingmnn/utils";
import { useBoolean } from "@wingmnn/utils/hooks";
import { CheckCircle, CircleAlert, TriangleAlert, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

type Placement = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Toast {
  id?: string;
  type: "success" | "error" | "warning" | "info";
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  placement?: Placement;
}

interface ToastContextState {
  toasts: Record<Placement, Array<Toast>>;
  addToast(toast: Toast): void;
  removeToast(id: string, placement: Placement): void;
}

const DEFAULT_TIMEOUT = 5 * 1000;

const INITIAL_TOASTS: Record<Placement, Array<Toast>> = {
  "top-left": [],
  "top-right": [],
  "bottom-left": [],
  "bottom-right": [],
};

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: TriangleAlert,
  info: CircleAlert,
};

const ToastContext = React.createContext<ToastContextState>({
  toasts: INITIAL_TOASTS,
  addToast: () => {},
  removeToast: () => {},
});

const variants = classVariance({
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
});

const iconVariants = classVariance({
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
});

function getToastPlacement(
  toast: Toast,
  params: { index: number; expanded: boolean },
) {
  const { placement = "bottom-right" } = toast;
  const { index, expanded } = params;
  const [vertical, horizontal] = placement.split("-");

  return {
    initial: { y: vertical === "top" ? "-100%" : "100%", opacity: 0, scale: 0 },
    exit: {
      scale: 0,
      opacity: 0,
      x: horizontal === "left" ? "-100%" : "100%",
    },
    animate: {
      x: 0,
      y: expanded
        ? vertical === "top"
          ? `calc(${index} * 100% + 10px)`
          : `calc(${index} * -100% - 10px)`
        : vertical === "top"
          ? index * 10
          : -index * 10,
      scale: expanded ? 1 : 1 - index * 0.05,
      opacity: expanded ? 1 : 1 - index * 0.05,
      zIndex: 100 - index,
    },
  };
}

export const ToastProvider = (props: React.PropsWithChildren) => {
  const { children } = props;

  const [toasts, setToasts] =
    React.useState<Record<Placement, Array<Toast>>>(INITIAL_TOASTS);

  const addToast = React.useCallback((toast: Toast) => {
    const { placement = "bottom-right" } = toast;

    setToasts((toasts) => ({
      ...toasts,
      [placement]: [toast, ...toasts[placement]],
    }));
  }, []);

  const removeToast = React.useCallback((id: string, placement: Placement) => {
    setToasts((toasts) => {
      return {
        ...toasts,
        [placement]: toasts[placement].filter((toast) => toast.id !== id),
      };
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toasts toasts={toasts} />
    </ToastContext.Provider>
  );
};

function Toasts(props: { toasts: Record<Placement, Array<Toast>> }) {
  const { toasts } = props;

  const { value: expanded, set, unset } = useBoolean(false);

  return (
    <AnimatePresence>
      {mapObj(toasts, (toasts, placement) =>
        toasts.map((toast, index) => {
          const { type } = toast;
          const { initial, exit, animate } = getToastPlacement(toast, {
            index,
            expanded,
          });

          const Icon = ICONS[type];

          return (
            <motion.div
              key={toast.id}
              layoutId={toast.id}
              exit={exit}
              initial={initial}
              animate={animate}
              style={{ transformOrigin: "center" }}
              transition={{ duration: 0.5, type: "spring" }}
              className={cx(
                "p-4 m-4 fixed flex items-center bg-black-50 border border-accent/50 rounded-lg max-w-125 w-fit",
                variants(placement),
              )}
            >
              <Icon size={24} className={cx("mr-4", iconVariants(type))} />
              <div className="flex flex-col">
                <Typography.H3 className="text-accent font-spicy-rice">
                  {toast.title}
                </Typography.H3>
                {toast.description && (
                  <Typography.Paragraph>
                    {toast.description}
                  </Typography.Paragraph>
                )}
              </div>
            </motion.div>
          );
        }),
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const { addToast, removeToast } = React.useContext(ToastContext);

  const toast = React.useCallback(
    (toast: Toast) => {
      const {
        title,
        description,
        type,
        duration = DEFAULT_TIMEOUT,
        id = crypto.randomUUID(),
        placement = "bottom-right",
      } = toast;
      addToast({ id, type, title, description, duration, placement });
      setTimeout(() => removeToast(id, placement), duration);
    },
    [addToast, removeToast],
  );

  return toast;
}
