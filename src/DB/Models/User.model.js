import mongoose from "mongoose";
export const genderEnum = { male: "male", female: "female" };
export const roleEnum = { user: "user", admin: "admin" };
export const providerEnum = { system: "system", google: "google" };

const userShema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLeght: 2,
      MaxLength: 20,
    },

    lastName: {
      type: String,
      required: true,
      minLeght: 2,
      MaxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function name(params) {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    oldPassword: [String],
    phone: {
      type: String,
      required: function name(params) {
        return this.provider === providerEnum.system ? true : false;
      },
    },

    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: `gender only allow ${genderEnum}`,
      },
      default: genderEnum.male,
    },

    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    confirmEmail: Date,
    confirmEmailOtp: String,
    picture: {secure_url:String , public_id:String},
    coverImages:[{secure_url:String , public_id:String}],
    deleteAt: Date,
    forgetPasswordOtp: String,
    changeCredtialsTime:Date,
    deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    restoredAt: Date,
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toObject: true,
    toJSON: true,
  }
);
userShema.virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  }); 
  userShema.virtual('messages' , {
    localField:"_id",
    foreignField:"receiverId",
    ref:"Message"
  })
userShema.set("toJSON", { virtuals: true });
userShema.set("toObject", { virtuals: true });

export const UserModel =
  mongoose.models.User || mongoose.model("User", userShema);
UserModel.syncIndexes();
