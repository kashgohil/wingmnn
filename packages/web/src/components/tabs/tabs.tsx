import { cx } from "@utility/cx";
import { LucideProps } from "lucide-react";
import React from "react";

export interface Tab extends BaseDetails {
  icon: React.ComponentType<LucideProps>;
}

interface TabsProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onChange"
  > {
  tabs: Array<Tab>;
  onChange(tab: Tab): void;
}

export function Tabs(props: TabsProps) {
  const { tabs, onChange, className, ...rest } = props;

  return (
    <div
      className={cx("flex items-center p-1 rounded-lg bg-white-950", className)}
      {...rest}
    >
      {tabs.map((tab) => {
        const { id, name, icon: Icon } = tab;
        return (
          <div
            key={id}
            onClick={() => onChange(tab)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100"
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {name}
          </div>
        );
      })}
    </div>
  );
}
