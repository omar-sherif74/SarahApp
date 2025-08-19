import { Router } from "express";
import { cloudFileUpload ,fileValidation} from "../../utils/multer/cloud.multer.js";
import * as messageService from "./message.service.js"
import * as validators from "./message.validation.js"
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router()

router.post("/:receiverId",
    cloudFileUpload({ validation: fileValidation.image }).array("attachments" , 2),
    validation(validators.sendMessage),
    messageService.sendMessage
)
router.post("/:receiverId/sender",
    authentication(),
    cloudFileUpload({ validation: fileValidation.image }).array("attachments" , 2),
    validation(validators.sendMessage),
    messageService.sendMessage
)
export default router