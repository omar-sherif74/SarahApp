import multer from "multer";

export const fileValidation ={
    image:['image/jpeg' ,'image/peg', 'image/gif'],
    document: ['application/pdf' , 'application/msword']
}

export const cloudFileUpload = ({  validation=[]}={}) => {
    
    const storage =multer.diskStorage({})



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