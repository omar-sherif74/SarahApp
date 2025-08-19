import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";
import joi from "joi";

export const logout = {
  body: joi.object().keys({
    flag: joi.string().valid(...Object.values(logoutEnum)).default(logoutEnum.stayLoggedIn)
  }),
};
export const shareProfile = {
  params: joi.object().keys({
    userId: generalFields.id.required(),
  }),
};
export const updateBasicsInfo = {
  body: joi.object().keys({
    fullName: generalFields.fullName,
    phone: generalFields.phone,
    gender: generalFields.gender,
  }),
};
export const updatePassword = {
  body:logout.body.append({
      oldPassword: generalFields.password.required(),
      password: generalFields.password.not(joi.ref("oldPassword")).required(),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required(),
};
export const profileImage = {
  file: joi.object().keys({
        fieldname: generalFields.files.fieldname.valid("image"),
        originalname: generalFields.files.originalname,
        encoding: generalFields.files.encoding,
        mimetype: generalFields.files.mimetype.valid(...fileValidation.image),
        // finalPath: generalFields.files.finalPath,
        destination: generalFields.files.destination,
        filename: generalFields.files.filename,
        path: generalFields.files.path,
        size: generalFields.files.size,
        }).required()
}
export const coverImage = {
  files: joi.array().items(
    joi.object().keys({
        fieldname: generalFields.files.fieldname.valid("images"),
        originalname: generalFields.files.originalname,
        encoding: generalFields.files.encoding,
        mimetype: generalFields.files.mimetype.valid(...fileValidation.image),
        // finalPath: generalFields.files.finalPath,
        destination: generalFields.files.destination,
        filename: generalFields.files.filename,
        path: generalFields.files.path,
        size: generalFields.files.size,
        }).required()
      ).min(1).max(3).required()
}
export const freezAccount = {
  params: joi.object().keys({
    userId: generalFields.id,
  }),
};
export const restoreAccount = {
  params: joi.object().keys({
    userId: generalFields.id.required(),
  }),
};
export const deleteAccount = {
  params: joi.object().keys({
    userId: generalFields.id,
  }),
};
