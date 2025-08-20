import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.DB_URI;
    const result = await mongoose.connect(uri);
    console.log(result.models);
    console.log("success DB");
  } catch (error) {
    console.log("fail to connect DB");
  }
};
export default connectDB;
