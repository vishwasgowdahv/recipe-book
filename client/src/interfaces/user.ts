export interface IUserLite {
  _id: string;
  username: string;
}

export interface IAuthUser {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export interface ILoginFormInput {
  email: string;
  password: string;
}

export interface IRegisterFormInput extends ILoginFormInput {
  username: string;
}