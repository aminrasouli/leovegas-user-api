export type SignUpInput = {
  email: string;
  name: string;
  password: string;
};

export type SignUpOutput = {
  id: number;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignInOutput = {
  id: number;
  email: string;
  name: string;
  accessToken: string;
};
