import { useSetup } from "@hooks/useSetup";

export function Home() {
  const { data: user } = useSetup();

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <h1 className="text-4xl font-light">Welcome, {user?.name}!</h1>
    </div>
  );
}
