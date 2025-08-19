import * as DBService from "../../DB/db.services.js";
import jwt from "jsonwebtoken";
import { roleEnum, UserModel } from "../../DB/Models/User.model.js";
import { nanoid } from "nanoid";
import { TokenModel } from "../../DB/Models/User.Token.js";

export const signatureLevelEnum = { bearer: "Bearer", system: "System" };
export const tokenTypeEnum = { access: "access", refresh: "refreshs" };
export const logoutEnum = {
  signoutFromAll: "signoutFromAll",
  signout: "signout",
  stayLoggedIn: "stayLoggedIn",
};

export const generatToken = async ({
  payload = {},
  secert = process.env.ACCEES_USER_TOKEN_SIGNATURE,
  options = {
    expiresIn: Number(process.env.ACCEES_TOKEN_EXPIRE_IN),
  },
} = {}) => {
  return jwt.sign(payload, secert, options);
};

export const verifyToken = async ({
  token = "",
  secert = process.env.ACCEES_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, secert);
};

export const getSignatures = async ({
  signatureLevel = signatureLevelEnum.bearer,
} = {}) => {
  let signtures = { accessSignture: undefined, refreshSginture: undefined };

  switch (signatureLevel) {
    case signatureLevelEnum.system:
      signtures.accessSignture = process.env.ACCEES_SYSTEM_TOKEN_SIGNATURE;
      signtures.refreshSginture = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE;
      break;

    default:
      signtures.accessSignture = process.env.ACCEES_USER_TOKEN_SIGNATURE;
      signtures.refreshSginture = process.env.REFRESH_USER_TOKEN_SIGNATURE;
      break;
  }
  return signtures;
};

export const decodeToken = async ({
  next,
  authorization = " ",
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];

  if (!(bearer || token)) {
    return next(new Error("missing token parts", { cause: 401 }));
  }

  let signtures = await getSignatures({ signatureLevel: bearer });

  const decoded = await verifyToken({
    token,
    secert:
      tokenType === tokenTypeEnum.access
        ? signtures.accessSignture
        : signtures.refreshSginture,
  });
  if (
    decoded.jti &&
    (await DBService.findOne({
      model: TokenModel,
      filter: { jti: decoded.jti },
    }))
  ) {
    return next(new Error(" in-valid login credential ", { cause: 401 }));
  }

  const user = await DBService.findById({ model: UserModel, id: decoded.id });

  if (!user) {
    return next(new Error(" in-valid token ", { cause: 400 }));
  }

  if (user.changeCredtialsTime?.getTime() > decoded.iat * 1000) {
    return next(new Error(" in-valid login credential ", { cause: 401 }));
  }
  return { user, decoded };
};

export const createRevokeToken = async ({ req ,res } = {}) => {
  await DBService.create({
    model: TokenModel,
    data: [
      {
        jti: req.decoded.jti,
        expiresIn:
          req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
        userId: req.decoded.id,
      },
    ],
  });
};
export const generatLoginCredentials = async ({ user } = {}) => {
  let signtures = await getSignatures({
    signatureLevel:
      user.role !== roleEnum.user
        ? signatureLevelEnum.system
        : signatureLevelEnum.bearer,
  });
  const jwtid = nanoid();
  const access_token = await generatToken({
    payload: { id: user._id },
    secert: signtures.accessSignture,
    options: { jwtid, expiresIn: Number(process.env.ACCEES_TOKEN_EXPIRE_IN) },
  });
  const refresh_token = await generatToken({
    payload: { id: user._id },
    secert: signtures.refreshSginture,
    options: { jwtid, expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN) },
  });
  return { access_token, refresh_token };
};
