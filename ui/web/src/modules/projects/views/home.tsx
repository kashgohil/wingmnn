import { Button } from "@components/button/button";
import { Dialogs, useProjectDialog } from "@projects/logic/useProjectDialog";
import { useProjects } from "@projects/logic/useProjects";
import { isEmpty } from "@utility/isEmpty";

export function Home() {
  const projects = useProjects("projects");
  const openDialog = useProjectDialog("openDialog");

  if (isEmpty(projects)) {
    return (
      <div className="h-full flex flex-col space-y-4 items-center justify-center">
        <div className="text-center text-white-850 text-xl">
          You don't have any projects yet.
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openDialog(Dialogs.CREATE_PROJECT)}
        >
          Let's create one
        </Button>
      </div>
    );
  }

  return <div className="flex flex-col"></div>;
}
