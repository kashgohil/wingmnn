import { ProjectDialogs } from "./components/dialogs/projectDialogs";

export function Projects({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col h-full">{children}</div>
      <ProjectDialogs />
    </>
  );
}
