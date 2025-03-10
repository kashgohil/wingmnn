import { Breadcrumbs } from "@components/breadcrumbs/breadcrumbs";

export function Projects({ children}: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col h-full">
        <Breadcrumbs breadcrumbs={[]} />
        {children}
      </div>
  );
}
