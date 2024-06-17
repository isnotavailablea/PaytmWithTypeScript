import express from "express"
import { ConnectionStr } from "../config"
import mongoose from "mongoose"
import {router as userRoute}   from "./User" 
import {router as accountRoute} from "./Account"
try{
    mongoose.connect(ConnectionStr)
    console.log("success")
}catch(err){
    console.log(err)
}
const router = express.Router();

router.use("/user"  ,  userRoute)
router.use("/account" , accountRoute)


export {
    router
}