import { Typography } from "@components/Typography/typography";
import { cx } from "@utility/cx";
import React from "react";

interface TimerProps {
  format: "mm:ss" | "hh:mm:ss";
  className?: string;
}

export function Timer(props: TimerProps) {
  const { className, format } = props;
  const [time, setTime] = React.useState(0);

  const { fullMinutes, minutes, seconds, hours } = React.useMemo(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const hours = Math.floor(minutes / 60);
    return {
      fullMinutes: String(minutes).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
    };
  }, [time]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function section(content: string) {
    return (
      <Typography.Text className={cx("p-2 text-center", className)}>
        {content}
      </Typography.Text>
    );
  }

  switch (format) {
    case "mm:ss":
      return (
        <div className="flex items-center gap-2 text-accent">
          {section(fullMinutes)}:{section(seconds)}
        </div>
      );
    case "hh:mm:ss":
      return (
        <div className="flex items-center gap-2  text-accent">
          {section(hours)}:{section(minutes)}:{section(seconds)}
        </div>
      );
  }
}
