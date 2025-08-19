import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/confing/.env.DEV") });
import authCOntroller from "./moduls/auth/auth.controller.js";
import userCOntroller from "./moduls/user/user.controller.js";
import messageCOntroller from "./moduls/message/message.controller.js";
import express from "express";
import connectDB from "./DB/Connection.js";
import { glopalErrorHandling } from "./utils/respones.js";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
import { error } from "node:console";
const bootstrab = async () => {
  const app = express();
  const port = process.env.port || 5000;

  //
  app.use(cors());
  app.use(helmet())
  app.use(morgan("dev"))

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20000 , 
    message: {error: "BAS BA to many requst"},
    standardHeaders:'draft-8'
  })
  app.use(limiter);
  //DB
  await connectDB();

  app.use("/uploads" , express.static(path.resolve("./src/uploads")))

  // convert buffer to data
  app.use(express.json());

  //app roting
  app.get("/", (req, res) => res.json("Hello World"));
  app.use("/auth", authCOntroller);
  app.use("/user", userCOntroller);
  app.use("/message", messageCOntroller);
  app.get("{/*dummy}", (req, res) => res.status(404).json("in-valid routing"));

  app.use(glopalErrorHandling);

  app.listen(port, () =>
    console.log(`Server is running at http://localhost:${port}`)
  );
};
export default bootstrab;
