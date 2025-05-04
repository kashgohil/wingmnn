import { useEditor } from "../useEditor";

export interface EditorProps {
  value: string;
  onChange(value: string): void;
}

export function Editor(props: EditorProps) {
  const { value } = props;

  useEditor(value);

  return (
    <div
      contentEditable="true"
      onChange={console.log}
      className="h-52 w-screen border border-white-400 rounded-lg"
    >
      something
    </div>
  );
}
