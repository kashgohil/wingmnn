import { Editor } from "@frameworks/editor/components/editor";
import { createLazyRoute } from "@tanstack/react-router";

function Testing() {
  console.log("is this rendering?");
  return (
    <div>
      <Editor value=":" onChange={() => {}} />
    </div>
  );
}

export const TestingRoute = createLazyRoute("/")({
  component: Testing,
});
