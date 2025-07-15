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

interface TabContext {
  activeTab: string;
  floaterId: string;
  onChange(tabId: string): void;
  orientation: "horizontal" | "vertical";
}

export interface Tab extends BaseDetails {
  icon?: React.ComponentType<LucideProps>;
}

interface TabsProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  activeTab: string;
  tabs: Array<Tab>;
  tabClassName?: string;
  onChange(tabId: string): void;
}

export interface TabPanelProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  activeTab: string;
  onChange(tabId: string): void;
  orientation?: "horizontal" | "vertical";
}

export interface TabProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  id: string;
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

export function TabPanel(props: TabPanelProps) {
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

export function Tab(props: TabProps) {
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
            className="absolute inset-0 bg-accent rounded-lg"
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
      <Tooltip placement={orientation === "horizontal" ? "bottom" : "right"}>
        <TooltipTrigger>{tabContent()}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return tabContent();
}

export function Tabs(props: TabsProps) {
  const { tabs, onChange, activeTab, tabClassName, ...rest } = props;

  return (
    <TabPanel onChange={onChange} activeTab={activeTab} {...rest}>
      {tabs.map((tab) => {
        const { id, name, icon, description } = tab;
        return (
          <Tab
            tooltip={description}
            icon={icon}
            id={id}
            key={id}
            className={tabClassName}
            onClick={() => onChange(id)}
          >
            {name}
          </Tab>
        );
      })}
    </TabPanel>
  );
}
