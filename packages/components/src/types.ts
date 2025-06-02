import type React from "react";

export interface Option {
  id: string;
  name: React.ReactNode;
  value: string | number;
  description: React.ReactNode;
}
