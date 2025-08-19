import * as authService from "./auth.service.js";
import { Router } from "express";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", validation(validators.singpu), authService.signup);
router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  authService.confirmEmail
);
router.post("/login", validation(validators.login), authService.login);

router.patch(
  "/send-forget-password",
  validation(validators.sendForgetPassword),
  authService.sendForgetPassword
);
router.patch(
  "/verify-forget-password",
  validation(validators.veifyForgetPassword),
  authService.veifyForgetPassword
);
router.patch(
  "/reset-forget-password",
  validation(validators.resetPassword),
  authService.resetPassword
);

router.post(
  "/signup/gmail",
  validation(validators.loginWithGmail),
  authService.signupWithGmail
);
router.post(
  "/login/gmail",
  validation(validators.loginWithGmail),
  authService.loginWithGmail
);
export default router;
