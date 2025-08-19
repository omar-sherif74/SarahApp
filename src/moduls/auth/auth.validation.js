import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const sendForgetPassword = {
  body: joi.object().keys({
    email: generalFields.email.required(),
  }),
};
export const veifyForgetPassword = {
  body: sendForgetPassword.body.append({
    otp: generalFields.otp.required(),
  }),
};
export const resetPassword = {
  body: veifyForgetPassword.body.append({
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
  }),
};

export const login = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const singpu = {
  body: login.body
    .append({
      fullName: generalFields.fullName.required(),
      confirmPassword: generalFields.confirmPassword.required(),
      phone: generalFields.phone.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const confirmEmail = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
export const loginWithGmail = {
  body: joi
    .object()
    .keys({
      idToken: joi.string().required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
