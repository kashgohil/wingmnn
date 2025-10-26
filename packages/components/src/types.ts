import type React from "react";

export interface Option {
  id: string;
  name: React.ReactNode;
  description: React.ReactNode;
  type?: "value" | "heading" | "action";
}

export type InferredType<T, AllowedTypes> = T extends AllowedTypes ? T : never;

export interface BaseDetails<T extends string> {
  id: T;
  name: string;
  description: string;
}
