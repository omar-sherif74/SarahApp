import { roleEnum } from "../../DB/Models/User.model.js";

export const endPoint = {
  profile: [roleEnum.admin, roleEnum.user],
  restorAccount: [roleEnum.admin],
  deleteAccount: [roleEnum.admin],
};
