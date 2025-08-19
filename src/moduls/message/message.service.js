import { asyncHandler, successResponse } from "../../utils/respones.js";
import * as DBserivce from '../../DB/db.services.js'
import { UserModel } from "../../DB/Models/User.model.js";
import { uploadFiles } from "../../utils/multer/cloudinary.js";
import { MessageModel } from "../../DB/Models/message.model.js";


export const sendMessage = asyncHandler(
    async (req , res , next)=>{
        if (!req.body.content && !req.files) {
            return next(new Error("message content is required"))
        }
        const {receiverId} = req.params;
        const user = await DBserivce.findOne({
            model:UserModel,    
            filter:{
                _id: receiverId,
                deleteAt:{$exists: false},
                confirmEmail: {$exists: true},
            }
        })
        
        if (!user) {
            return next(new Error("in-valid recipient account"))
        }
        const {content} = req.body ;
        
        let attachments =[]
        if (req.files) {
            attachments = await uploadFiles({files :req.files , path:`message/${receiverId}`})
        }

        
        const [message] = await DBserivce.create({
            model:MessageModel,
            data:[{
                content,
                attachments,
                receiverId,
                senderId:req.user?._id
            }]


        })
        return successResponse ({res , status:201 , data:{message}})
    }
)