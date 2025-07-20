import { Button, Typography } from "@wingmnn/components";
import React from "react";

interface Props {
  tree: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<Props>,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "ErrorBoundary caught an error: \n\n ERROR:\n",
      "[" +
        this.props.tree +
        "]" +
        "[" +
        error.name +
        "]" +
        " " +
        error.message,

      "\n\n COMPONENT STACK:",
      errorInfo.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-black-100 rounded-lg">
          <Typography.H2 className="text-center font-spicy-rice">
            Hmmm. Something went wrong.
          </Typography.H2>
          <Typography.Paragraph className="text-center">
            looks like a bug. Hit the report button and let us know what
            happened.
          </Typography.Paragraph>
          <Button size="sm">Report it</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
