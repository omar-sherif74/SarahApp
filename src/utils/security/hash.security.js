import bcrypt from "bcryptjs";

export const generatHash = async ({
  plainText = " ",
  saltRound = process.env.SLAT,
} = {}) => {
  return bcrypt.hashSync(plainText, parseInt(saltRound));
};

export const compareHase = async ({
  plainText = " ",
  hashValue = " ",
} = {}) => {
  return bcrypt.compareSync(plainText, hashValue);
};
