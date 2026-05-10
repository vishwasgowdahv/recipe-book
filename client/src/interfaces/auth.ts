export interface LoginFormInput {
  email: string;
  password: string;
}

export interface RegisterFormInput extends LoginFormInput {
  username: string;
}