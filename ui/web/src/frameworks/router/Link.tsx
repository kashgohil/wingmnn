import { cx } from "@utility/cx";

export interface LinkProps extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  to: string;
}

export function Link(props: LinkProps) {
  const { children, className, onClick, ...rest } = props;

  const clickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (onClick) onClick(event);
    window.history.pushState({}, '', props.to);
  };

  return (
    <a className={cx(className, '')} href={props.to} onClick={clickHandler} {...rest}>
      {children}
    </a>
  )
}
