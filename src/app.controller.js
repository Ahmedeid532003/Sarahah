
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import connectDB from "./db/connection.js";
import rateLimit from "express-rate-limit";


const bootstrap =async(app,express)=>{

    await connectDB();

    app.use(express.json());
    app.use(helemt());
const Limiter = rateLimit({
  windowMs: 5 * 60 * 1000,     
  limit: 5,                      
  message: {
    status: 429,
    message: "Too many requests, please try again later",
  },
  legacyHeaders: false,         
});
    app.use(Limiter);
    app.use("/api/v1/auth",authRouter);
    app.use("/api/v1/user",userRouter);
    app.use("/api/v1/message",messageRouter);
  
    app.get("/",(req,res)=>{
        return res.status(200).json({message:"Done"});

    })
    app.all("/*dummy" , (req,res)=>{
        return res.status(404).json({message:"not found handler"});
    });

};
export default bootstrap;