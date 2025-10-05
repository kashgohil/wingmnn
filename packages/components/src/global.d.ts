type MapOf<T> = { [key in string]: T };
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

interface Option extends BaseDetails {
  value: string;
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
