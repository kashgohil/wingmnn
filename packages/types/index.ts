export * from "./src/sudoku";

export type ResponseWrapper<T> = {
  data: T;
  count?: number | string;
};

export type SuccessWrapper = {
  message: string;
};

export type ErrorWrapper = {
  message: string;
  code?: number | string;
};
