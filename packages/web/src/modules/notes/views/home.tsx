import { Button, Typography } from "@wingmnn/components";
import { Link } from "@wingmnn/router";
import { isEmpty } from "@wingmnn/utils";

export function Home() {
  const notes = [];

  if (isEmpty(notes)) {
    return (
      <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
        <div className="text-center">
          <Typography.H2 className="font-semibold text-accent">
            You don't have any notes yet.
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Create a new note to get started.
          </Typography.Paragraph>
        </div>
        <Link to="/notes/new-note">
          <Button size="sm">Create Note</Button>
        </Link>
      </div>
    );
  }

  return <div className="p-2">This is my Home</div>;
}
