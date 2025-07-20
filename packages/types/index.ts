export * from "./src/sudoku";

export type ResponseWrapper<T> = {
  data: T;
  count?: number;
};

export type SuccessWrapper = {
  message: string;
};

export type ErrorWrapper = {
  message: string;
  code?: number;
};
