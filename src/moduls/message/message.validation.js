import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

export const sendMessage = {
    params : joi.object().keys({
        receiverId: generalFields.id.required()
    }).required(),

    body : joi.object().keys({
        content : joi.string().min(2).max(20000)
    }).required(),
    
    files:joi.array().items(
        joi.object().keys({
            fieldname: generalFields.files.fieldname.valid("attachments"),
            originalname: generalFields.files.originalname,
            encoding: generalFields.files.encoding,
            mimetype: generalFields.files.mimetype.valid(...fileValidation.image),
            destination: generalFields.files.destination,
            filename: generalFields.files.filename,
            path: generalFields.files.path,
            size: generalFields.files.size,
            })
    ).min(0).max(2)
    
} 
