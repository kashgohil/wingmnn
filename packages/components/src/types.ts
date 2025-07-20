import type React from "react";

export interface Option {
  id: string;
  type?: "value" | "heading" | "action";
  name: React.ReactNode;
  value: string | number;
  description: React.ReactNode;
}

export type InferredType<T, AllowedTypes> = T extends AllowedTypes ? T : never;

export interface BaseDetails<T extends string> {
  id: T;
  name: string;
  description: string;
}
