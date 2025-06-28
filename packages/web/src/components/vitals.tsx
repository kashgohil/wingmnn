import { Typography } from "@wingmnn/components";
import { Code } from "lucide-react";

export function Vitals() {
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="p-1 rounded-tl-lg px-4 bg-white-500 text-black-500 fixed bottom-0 right-0 flex items-center space-x-2">
        <Code size={16} />
        <Typography.Paragraph>Development</Typography.Paragraph>
      </div>
    );
  }
}
