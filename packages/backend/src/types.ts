export type AuthenticateEnv = {
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export type ResponseWrapper<T> = {
  data: T;
  count?: number;
};

export type ErrorWrapper = {
  message: string;
  code?: string;
};
