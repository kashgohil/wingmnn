import { useQueryState } from "@frameworks/query/hook";
import { ME_QUERY_KEY } from "@queryKeys";
import type { User } from "@wingmnn/db";

export function Home() {
  const user = useQueryState<User>(ME_QUERY_KEY);

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <h1 className="text-4xl font-light">Welcome, {user?.name}!</h1>
    </div>
  );
}
