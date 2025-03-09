// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TSAny = any;

interface BaseDetails {
  id: string;
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

interface CoreOption extends BaseDetails {
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
