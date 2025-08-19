import { roleEnum, UserModel } from "../../DB/Models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/respones.js";
import {generatDecryption,generatEncrypt} from "../../utils/security/encreption.security.js";
import { createRevokeToken, generatLoginCredentials, logoutEnum } from "../../utils/security/token.security.js";
import * as DBservice from "../../DB/db.services.js";
import {compareHase,generatHash,} from "../../utils/security/hash.security.js";
import { deleteFolderByPrefix, deleteResources, destoryFile, uploadFile, uploadFiles } from "../../utils/multer/cloudinary.js";


export const profile = asyncHandler(async (req, res, next) => {
  const user = await DBservice.findById({
    model:UserModel,
    id: req.user._id,
    populate:[{ path:"messages" }]
  })
  req.user.phone = await generatDecryption({ cipherText: req.user.phone });
  return successResponse({ res, data: { user } });
});
export const logout = asyncHandler(
  async (req, res, next) => {
    let status =200 ;
    const {flag} = req.body;
    switch (flag) {
      case logoutEnum.signoutFromAll:
        await DBservice.updateOne({
          model:UserModel,
          filter:{
            _id:req.decoded.id
          },
          data:{
            changeCredtialsTime:new Date()
          }
        })
        break;
      default:
        await createRevokeToken({req})
        status = 201
        break;
    }
      return successResponse({ res, status , data: {} });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBservice.findOne({
    model: UserModel,
    filter: {
      _id: userId,
      confirmEmail: { $exists: true },
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const profileImage = asyncHandler(async (req, res, next) => {

  const {secure_url , public_id} = await uploadFile({file:req.file , path:`user/${req.user._id}` })

  const user = await DBservice.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:req.user._id
    },
    data:{
      picture: {secure_url , public_id}
    },
    options:{
      new:false
    }
  })
  if (user?.picture?.public_id) {
    await destoryFile({public_id:user.picture.public_id})
  }
  return successResponse({ res, data: { user} })

});
export const profileCoverImage = asyncHandler(
  async (req, res, next) => {
    const attachments =await uploadFiles({files: req.files , path:`user/${req.user._id}/cover`})
  
  const user = await DBservice.findOneAndUpdate({
    model:UserModel,
    filter: {_id:req.user._id},
    data: {coverImages:attachments},
    options: {new:false}
  })
  if (user?.coverImages?.length) {
    await deleteResources({
      public_ids: user.coverImages.map(ele => ele.public_id)
    });
  }
  return successResponse({ res, data: { user } })
  
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password , flag } = req.body;

  if (!(await compareHase({plainText: oldPassword,hashValue: req.user.password}))) {
    return next(new Error("in-valid old password"));
  }
  
  
    for (const hashPassword of req.user.oldPassword) {
      if (await compareHase({plainText: password,hashValue: hashPassword})) {
        return next(new Error("this password used before try to sing new one"))
      }
    }
    let updateDate ={}

    switch (flag) {
      case logoutEnum.signoutFromAll:
        
        updateDate.changeCredtialsTime=Date.now()
        break;
        case logoutEnum.signout:
        await createRevokeToken({req})
    default:

        break;
    }

  const user = await DBservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      password: await generatHash({ plainText: password }),
      ...updateDate,
      $push: { oldPassword: req.user.password },
    },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const updateBasicsInfo = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await generatEncrypt({ plainText: req.body.phone });
  }

  const user = await DBservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: req.body,
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const freezAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum.admin) {
    return next(new Error("noy authorized account", { cause: 403 }));
  }

  const user = await DBservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId || req.user._id, deleteAt: { $exists: false } },

    data: {
      deleteAt: Date.now(),
      deleteBy: req.user._id,
      changeCredtialsTime:Date.now() ,
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
    },
  });

  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const restorAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBservice.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deleteAt: { $exists: true },
      deleteBy: { $ne: userId },
    },

    data: {
      $unset: {
        deleteAt: 1,
        deleteBy: 1,
      },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
    },
  });
  return user
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBservice.deleteOne({
    model: UserModel,
    filter: { _id: userId, deleteAt: { $exists: true } },
  });
if (user.deleteAccount) {
   await deleteFolderByPrefix({prefix:`user / ${userId}`})
}
  return user.deleteAccount
    ? successResponse({ res, data: { user } })
    : next(new Error("in-valid acoount", { cause: 404 }));
});

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const credentials = await generatLoginCredentials({ user: req.user });
  return successResponse({ res, data: { credentials } });
});
