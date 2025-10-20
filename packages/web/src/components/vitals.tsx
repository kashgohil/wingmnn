import { SECOND } from "@constants";
import { Typography } from "@wingmnn/components";
import { Code } from "@wingmnn/components/icons";
import React from "react";

export function Vitals() {
  const [fps, setFps] = React.useState(0);
  React.useEffect(() => {
    let fps = 0;
    let lastTime = 0;
    const times: number[] = [];

    function calculateFPS() {
      window.requestAnimationFrame((currentTime) => {
        while (times.length > 0 && times[0] <= currentTime - 1000) {
          times.shift();
        }
        times.push(currentTime);
        fps = times.length;

        if (currentTime - lastTime >= 2 * SECOND) {
          setFps(Math.floor(fps));
          lastTime = currentTime;
        }

        calculateFPS();
      });
    }

    if (process.env.NODE_ENV === "development") {
      calculateFPS();
    }
  }, []);

  const color = React.useMemo(() => {
    if (fps < 60) {
      return "var(--color-red-300)";
    } else if (fps < 90) {
      return "var(--color-yellow-300)";
    } else {
      return "var(--color-green-400)";
    }
  }, [fps]);

  if (process.env.NODE_ENV === "development") {
    return (
      <div className="p-1 rounded-tl-lg px-4 bg-white-500 text-black-500 fixed bottom-0 right-0 flex items-center space-x-2">
        <Code size={16} />
        <Typography.Paragraph>Development</Typography.Paragraph>
        <div
          className="px-1.5 py-0.5 rounded-lg space-x-0.5"
          style={{ background: color }}
        >
          <Typography.Caption id="fpsDisplay" className="font-mono font-bold">
            {fps}
          </Typography.Caption>
          <Typography.Caption className="text-[10px]">FPS</Typography.Caption>
        </div>
      </div>
    );
  }
}
