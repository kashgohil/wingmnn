// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TSAny = any;

type InferredType<T, AllowedTypes> = T extends AllowedTypes ? T : never;

interface BaseDetails<T = string> {
  id: T;
  name: string;
  description: string;
}

interface Metadata {
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MapOf<T> {
  [k: string]: T;
}

interface Option extends CoreOption, Metadata {}

interface CoreOption<T = string> extends BaseDetails<T> {
  type?: "value" | "heading" | "action";
  iconCode?: string;
  colorCode?: string;
}

interface Attachment extends BaseDetails, Metadata {
  url: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
}

interface ExtendedFile extends File {
  url: string;
}
