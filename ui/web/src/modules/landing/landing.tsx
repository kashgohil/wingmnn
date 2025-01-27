import { Box } from "@components/box/box";

export function Landing() {
  return (
    <div className="w-full h-full flex">
      <div className="w-1/2">Wingmnn</div>
      <div className="w-1/2 flex flex-col items-center justify-center">
        <Box className="h-1/2 w-2/3">Something</Box>
      </div>
    </div>
  );
}
