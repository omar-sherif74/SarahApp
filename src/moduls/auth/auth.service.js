import * as DBService from "../../DB/db.services.js";
import { providerEnum, UserModel } from "../../DB/Models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/respones.js";
import {
  compareHase,
  generatHash,
} from "../../utils/security/hash.security.js";
import { generatEncrypt } from "../../utils/security/encreption.security.js";
import { generatLoginCredentials } from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import { emailEvent } from "../../utils/events/email.events.js";
import { customAlphabet } from "nanoid";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const hassPassword = await generatHash({ plainText: password });
  const encPhone = await generatEncrypt({ plainText: phone });
  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await generatHash({ plainText: otp });
  if (await DBService.findOne({ model: UserModel, filter: { email } })) {
    return next(new Error("Email is exist", { cause: 409 }));
  }

  const [user] = await DBService.create({
    model: UserModel,
    data: [
      {
        fullName,
        email,
        password: hassPassword,
        phone: encPhone,
        confirmEmailOtp,
      },
    ],
  });

  emailEvent.emit("confirmEmail", { to: email, otp });

  return successResponse({ res, status: 201, data: { user } });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user) {
    return next(new Error("in-valid email or password", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(new Error("Please vrify your account"));
  }
  if (user.deleteAt) {
    return next(new Error("this account deleted"));
  }

  if (!(await compareHase({ plainText: password, hashValue: user.password }))) {
    return next(new Error("in-valid login data ", { cause: 404 }));
  }

  const credentials = await generatLoginCredentials({ user });

  return successResponse({ res, data: { credentials } });
});

export const veifyForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deleteAt: { $exists: false },
      forgetPasswordOtp: { $exists: true },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }
  if (
    !(await compareHase({ plainText: otp, hashValue: user.forgetPasswordOtp }))
  ) {
    next(new Error("in-valied otp", { cause: 400 }));
  }
  emailEvent.emit("sendForgotPassword", {
    to: email,
    subject: "Forgot Password ",
    title: "Reset-Password",
    otp,
  });
  return successResponse({ res });
});
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, email, otp } = req.body;
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deleteAt: { $exists: false },
      forgetPasswordOtp: { $exists: true },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }
  if (
    !(await compareHase({ plainText: otp, hashValue: user.forgetPasswordOtp }))
  ) {
    next(new Error("in-valied otp", { cause: 400 }));
  }
  DBService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      password: await generatHash({ plainText: password }),
      changeCredtialsTime:Date.now() ,

      $unset:{
        forgetPasswordOtp:1
      }
    },
  });
  return successResponse({ res });
});
export const sendForgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const otp = customAlphabet("0123456789", 6)();
  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deleteAt: { $exists: false },
      provider: providerEnum.system,
    },
    data: {
      forgetPasswordOtp: await generatHash({ plainText: otp }),
    },
  });
  if (!user) {
    next(new Error("in-valied account", { cause: 404 }));
  }
  emailEvent.emit("sendForgotPassword", {
    to: email,
    subject: "Forgot Password ",
    title: "Reset-Password",
    otp,
  });
  return successResponse({ res });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(
      new Error("Invalid account or already verified", { cause: 404 })
    );
  }
  // console.log({ otp, confirmEmail });

  const isMatch = await compareHase({
    plainText: otp,
    hashValue: user.confirmEmailOtp,
  });
  if (!isMatch) {
    return next(new Error("Invalid OTP"));
  }

  const userUpdate = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      $set: { confirmEmail: Date.now() },
      $unset: { confirmEmailOtp: true },
      $inc: { __v: 1 },
    },
  });

  return userUpdate.matchedCount
    ? successResponse({
        res,
        status: 200,
        data: { message: "Email confirmed successfully" },
      })
    : next(new Error("Failed to confirm user email"));
});

async function verifyGoogleAccount({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLINT_IDS.split(","),
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { picture, email, email_verified, name, provider } =
    await verifyGoogleAccount({ idToken });
  if (!email_verified) {
    return next(new Error("not verified account", { cause: 400 }));
  }
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providerEnum.google) {
      return loginWithGmail(req, res, next);
    }
    return next(new Error("email is exist", { cause: 409 }));
  }

  const [newUser] = await DBService.create({
    model: UserModel,
    data: [
      {
        fullName: name,
        email,
        confirmEmail: Date.now(),
        picture,
        provider: providerEnum.google,
      },
    ],
  });
  const credentials = await generatLoginCredentials({ user: newUser });
  return successResponse({ res, status: 201, data: { credentials } });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified } = await verifyGoogleAccount({ idToken });

  if (!email_verified) {
    return next(new Error("not verified account", { cause: 400 }));
  }

  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });

  if (!user) {
    return next(new Error("in-valid login or provider", { cause: 404 }));
  }

  const credentials = await generatLoginCredentials({ user });
  return successResponse({ res, status: 201, data: { credentials } });
});
