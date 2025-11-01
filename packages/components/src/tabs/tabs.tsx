import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/tooltip/tooltip";
import { classVariance } from "@utility/classVariance";
import { cx } from "@utility/cx";
import { uuid } from "@wingmnn/utils";
import { withSlideSound } from "@wingmnn/utils/interactivity";
import { type LucideProps } from "lucide-react";
import { motion } from "motion/react";
import React, { type MouseEvent } from "react";
import type { BaseDetails } from "../types";

interface TabContext<T = string> {
  activeTab: T;
  floaterId: string;
  onChange(tabId: T): void;
  orientation: "horizontal" | "vertical";
}

export interface Tab<T extends string> extends BaseDetails<T> {
  icon?: React.ComponentType<LucideProps>;
}

interface TabsProps<T extends string>
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  activeTab: T;
  tabs: Array<Tab<T>>;
  tabClassName?: string;
  onChange(tabId: T): void;
}

export interface TabPanelProps<T extends string>
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  activeTab: T;
  onChange(tabId: T): void;
  orientation?: "horizontal" | "vertical";
}

export interface TabProps<T extends string>
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  id: T;
  tooltip?: React.ReactNode;
  icon?: React.ComponentType<LucideProps>;
}

const TabContext = React.createContext<TabContext>({
  activeTab: "",
  onChange: () => {},
  orientation: "horizontal",
  floaterId: uuid(),
});

const variantClasses = classVariance({
  horizontal: "flex flex-row",
  vertical: "flex flex-col",
});

export function TabPanel<T extends string>(props: TabPanelProps<T>) {
  const {
    orientation = "horizontal",
    activeTab,
    className,
    children,
    onChange,
    ...rest
  } = props;

  const floaterId = React.useMemo(() => uuid(), []);

  return (
    <TabContext.Provider
      value={{ activeTab, onChange, orientation, floaterId }}
    >
      <div
        {...rest}
        className={cx(
          "relative gap-1 p-1.5 rounded-lg border border-accent/50",
          className,
          variantClasses(orientation),
        )}
      >
        {children}
      </div>
    </TabContext.Provider>
  );
}

export function TabComponent<T extends string>(props: TabProps<T>) {
  const { icon: Icon, tooltip, className, onClick, ...rest } = props;

  const { activeTab, onChange, orientation, floaterId } =
    React.useContext(TabContext);

  const clickHandler = React.useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onChange(props.id);
    },
    [onClick, props.id],
  );

  function tabContent() {
    return (
      <button
        {...rest}
        tabIndex={0}
        onClick={withSlideSound(clickHandler)}
        className={cx(
          "relative p-2 cursor-pointer rounded-lg hover:bg-accent/20 transition-all duration-200 focus-within:outline-accent/50 outline-offset-2",
          className,
        )}
      >
        {activeTab === props.id && (
          <motion.div
            layoutId={floaterId || "tab-floater"}
            className={cx("absolute inset-0 bg-accent rounded-lg", className)}
            transition={{ duration: 0.2 }}
          ></motion.div>
        )}
        <div
          className={cx(
            "flex items-center justify-center gap-2 relative transition-colors duration-500",
            activeTab === props.id
              ? "text-[var(--accent-text)]"
              : "text-accent",
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {props.children}
        </div>
      </button>
    );
  }

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{tabContent()}</TooltipTrigger>
        <TooltipContent
          side={orientation === "horizontal" ? "bottom" : "right"}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return tabContent();
}

export function Tabs<T extends string>(props: TabsProps<T>) {
  const { tabs, onChange, activeTab, tabClassName, ...rest } = props;

  return (
    <TabPanel onChange={onChange} activeTab={activeTab} {...rest}>
      {tabs.map((tab) => {
        const { id, name, icon, description } = tab;
        return (
          <TabComponent
            tooltip={description}
            icon={icon}
            id={id}
            key={id}
            className={tabClassName}
            onClick={() => onChange(id)}
          >
            {name}
          </TabComponent>
        );
      })}
    </TabPanel>
  );
}
