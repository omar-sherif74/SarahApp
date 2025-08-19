import CryptoJS from "crypto-js";

export const generatEncrypt = async ({
  plainText = " ",
  secretKey = process.env.ENCRYPT_SECRET,
} = {}) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

export const generatDecryption = async ({
  cipherText = " ",
  secretKey = process.env.ENCRYPT_SECRET,
} = {}) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
};
