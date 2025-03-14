import { Button } from "@components/button/button";
import { Menu } from "@components/menu/menu";
import { Separator } from "@components/separator/separator";
import { Tooltip } from "@components/tooltip/tooltip";
import { Link } from "@frameworks/router/Link";
import { useBoolean } from "@hooks/useBoolean";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

interface CoreBreadcrumb {
  id: string;
  name: string;
  description: string;
  className?: string;
  type: "link" | "options";
}

export type Breadcrumb =
  | (CoreBreadcrumb & {
      type: "link";
      to: string;
      value?: never;
      options?: never;
      onSelect?: never;
    })
  | (CoreBreadcrumb & {
      type: "options";
      to?: never;
      value: string;
      options: Array<Option>;
      onSelect: (option: Option) => void;
    });

export interface BreadcrumbsProps {
  breadcrumbs: Array<Breadcrumb>;
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  const { breadcrumbs = [] } = props;

  return (
    <Separator
      orientation="vertical"
      className="rotate-[20deg] bg-white-950 w-[1px] rounded-lg my-4 mx-4"
    >
      {breadcrumbs.map((breadcrumb) => {
        return <Breadcrumb key={breadcrumb.id} breadcrumb={breadcrumb} />;
      })}
    </Separator>
  );
}

function Breadcrumb(props: { breadcrumb: Breadcrumb }) {
  const { breadcrumb } = props;
  const {
    id,
    to = "",
    name,
    onSelect,
    value = "",
    description,
    options = [],
  } = breadcrumb;

  const { value: open, toggle } = useBoolean(false);
  const popoverRef = React.useRef<HTMLButtonElement>(null);

  if (options.length === 0) {
    return (
      <Link to={to} key={id}>
        <Tooltip title={description} placement="bottom">
          <Button size="sm" className="bg-black-400 hover:bg-black-100 px-2">
            {name}
          </Button>
        </Tooltip>
      </Link>
    );
  }

  return (
    <>
      <Button
        size="sm"
        ref={popoverRef}
        onClick={toggle}
        className="flex items-center bg-black-400 hover:bg-black-100 px-2"
      >
        {name}
        <ChevronsUpDown size={24} className="p-0 pl-2" />
      </Button>
      <Menu
        open={open}
        value={value}
        onClose={toggle}
        options={options}
        onSelect={onSelect}
        anchor={popoverRef}
        placement="bottom-left"
        className="bg-black-50 min-w-52"
      />
    </>
  );
}
