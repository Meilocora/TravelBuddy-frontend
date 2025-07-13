import { Validable } from './other_models';

export interface AuthFormValues {
  email: Validable<string>;
  username: Validable<string>;
  password: Validable<string>;
}

export interface NameChangeFormValues {
  newUsername: Validable<string>;
  password: Validable<string>;
}

export interface PasswordChangeFormValues {
  newPassword: Validable<string>;
  confirmPassword: Validable<string>;
  oldPassword: Validable<string>;
}
