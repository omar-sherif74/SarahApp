import {auth,authentication} from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import * as userService from "./user.service.js";
import { Router } from "express";
import * as validators from "./usre.validation.js";
import { endPoint } from "./user.authorization.js";
import { fileValidation, localFileUpload } from "../../utils/multer/local.multer.js";
import { cloudFileUpload } from "../../utils/multer/cloud.multer.js";
const router = Router({
  caseSensitive:true ,
  strict:true
});

router.get(
  "/",
  authentication(),
  validation(validators.logout) ,
  userService.profile
);

router.post(
  "/logout" ,
  authentication() ,
  userService.logout)

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);
router.get(
  "/:userId",
  validation(validators.shareProfile),
  userService.shareProfile
);
router.patch(
  "/",
  authentication(),
  validation(validators.updateBasicsInfo),
  userService.updateBasicsInfo
);


router.delete(
  "/:userId",
  auth({ accessRoles: endPoint.deleteAccount }),
  validation(validators.deleteAccount),
  userService.deleteAccount
);

router.delete(
  "{/:userId}/freez-account",
  authentication(),
  validation(validators.freezAccount),
  userService.freezAccount
);

router.patch(
  "/:userId/restore-account",
  auth({ accessRoles: endPoint.restorAccount }),
  validation(validators.restoreAccount),
  userService.restorAccount
);

router.patch(
  "/update-password",
  authentication(),
  validation(validators.updatePassword),
  userService.updatePassword
); 

router.patch(
  "/image-profile",
  authentication(),
  cloudFileUpload({ validation:fileValidation.image}).single("image"),
  validation(validators.profileImage),
  userService.profileImage
);
router.patch(
  "/image-cover-profile",
  authentication(),
  cloudFileUpload({validation:fileValidation.image}).array("images",2),
  validation(validators.coverImage),
  userService.profileCoverImage
);


export default router;
