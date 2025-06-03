import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@wingmnn/components";

interface Props {
  children: React.ReactNode;
}

export function Mails(props: Props) {
  const { children } = props;

  return (
    <div className="flex h-full w-full">
      <ResizablePanelGroup direction="horizontal" autoSaveId={"MAIL_SPLIT"}>
        <ResizablePanel className="bg-black-200" defaultValue={"20%"}>
          <div className="flex flex-col p-3 h-full"></div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          handleClassName="text-gray-500"
          className="border-l border-l-black-100 border-r border-r-black-200 hover:border-black-200 active:border-black-200 transition-colors duration-100"
        />
        <ResizablePanel defaultValue={"80%"}>{children}</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
