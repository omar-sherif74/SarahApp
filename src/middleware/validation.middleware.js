import { Types } from "mongoose";
import { asyncHandler } from "../utils/respones.js";
import joi from "joi";
import { genderEnum } from "../DB/Models/User.model.js";

export const generalFields = {
  fullName: joi
    .string()
    .pattern(new RegExp(/^[A-Z][a-z]{1,19}\s{1}[A-Z][a-z]{1,19}$/))
    .min(2)
    .max(20),
  email: joi.string().email(),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: joi.string().pattern(new RegExp(/^\d{6}/)),
  gender: joi.string().valid(...Object.values(genderEnum)),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) || helper.message("in-valid objectId");
  }),
  files :{
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required()
  },

}
  

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    console.log(req.files);
    
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key]);
      if (validationResult.error) {
        validationError.push({ key, details: validationResult.error });
      }
    }

    if (validationError.length) {
      return res
        .status(400)
        .json({ err_message: "validtion error", validationError });
    }

    return next();
  });
};
