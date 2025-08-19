import fs from "node:fs"
import path from "node:path"
import multer from "multer";

export const fileValidation ={
    image:['image/jpeg' ,'image/peg', 'image/gif'],
    document: ['application/pdf' , 'application/msword']
}

export const localFileUpload = ({ customPath = "general" , validation=[]}={}) => {
    let basePhat = `uploads/${customPath}`
    
    const storage =multer.diskStorage({
        destination: function (req , file , callback){
            if (req.user?._id) {
                basePhat +=  ` ${req.user._id} `
            }
            const fullPath = path.resolve(`./src/${basePhat}`) 

                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath , { recursive:true })
                }
                callback(null , path.resolve(fullPath))
        },
        filename: function (req , file , callback) {
            const uniqueFileName =Date.now() + "__" + Math.random() + "__" + file.originalname;
            file.finalPath = basePhat + "/" + uniqueFileName
            callback(null , uniqueFileName)
        }

    })
    const fileFilter = (req , file , callback)=>{
        if (validation.includes(file.mimetype)) {
            return callback(null , true) 
        }
        return callback(new Error("invalid file format"), false);
    }
    return multer({
        dest:"./temp",
        fileFilter, 
        storage
    })
}