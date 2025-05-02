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
    <nav>
      <ol className="flex items-center p-2">
        <Separator
          orientation="vertical"
          className="rotate-[20deg] bg-white-950 w-[1px] rounded-lg my-4 mx-4"
        >
          {breadcrumbs.map((breadcrumb) => {
            return (
              <li className="inline-flex items-center gap-1">
                <Breadcrumb key={breadcrumb.id} breadcrumb={breadcrumb} />
              </li>
            );
          })}
        </Separator>
      </ol>
    </nav>
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
      <Link to={to} key={id} tabIndex={-1}>
        <Tooltip title={description} placement="bottom">
          {name}
        </Tooltip>
      </Link>
    );
  }

  return (
    <>
      <Link to="" onClick={toggle} className="flex items-center px-2">
        {name}
        <ChevronsUpDown size={24} className="p-0 pl-2" />
      </Link>
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
