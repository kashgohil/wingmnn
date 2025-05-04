import { Breadcrumb, Breadcrumbs } from "@components/breadcrumbs/breadcrumbs";
import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { ProjectDialogs } from "./components/dialogs/projectDialogs";

export function Projects({ children }: { children: React.ReactNode }) {
  const breadcrumbs = [
    {
      id: "HOME",
      name: "Home",
      type: "link",
      to: BaseRoutes[Modules.PROJECTS],
    },
  ] as Array<Breadcrumb>;

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="h-14 flex items-center">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        {children}
      </div>
      <ProjectDialogs />
    </>
  );
}
