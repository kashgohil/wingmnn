import { cx } from "@utility/cx";
import { uuid } from "@wingmnn/utils";
import React from "react";

interface Props {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  className?: string;
}

export function CurvedText(props: Props) {
  const {
    text,
    fontFamily,
    fontSize = 24,
    textColor = "var(--color-white-300)",
    className,
  } = props;

  const id = React.useMemo(() => uuid(), []);

  return (
    <svg
      viewBox="0 0 130 50"
      className={cx("overflow-visible", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id={id} d="M5,50 A100,100 0 0,1 125,50" fill="none" />
      </defs>

      <text
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontFamily={fontFamily}
      >
        <textPath href={`#${id}`} startOffset="50%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
