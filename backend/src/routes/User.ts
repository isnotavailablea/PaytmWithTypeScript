import express , {Request , Response} from 'express';
import {User} from "../Schema/User"
import {Account} from "../Schema/Account"
const router = express.Router();
import  zod from  "zod"
import mongoose from "mongoose"
import {Auth} from "../Middleware/Auth"
import { GetToken, verifyToken } from '../Middleware/verifyToken';

// import {Auth} from "../Middleware/Auth.js"
const userSchema = zod.object({
        userId : zod.string().min(3).max(10),
        firstName : zod.string().min(3).max(10),
        lastName : zod.string().min(3).max(10),
        password : zod.string().min(6).max(12)
})

const AccountSchema = zod.object({
        userOId : zod.string().refine((val)=>{
            return mongoose.Types.ObjectId.isValid(val)
        }),
        balance : zod.number().int().positive()
})



interface userBody{
    "userId" : string,
    "firstName" : string,
    "lastName" : string,
    "password" : string
}

type ResponseBody = {
    "userId" : string,
    "firstName" : string,
    "lastName" : string
}

type TokenType = {
    "token" : string
}

interface accountBody{
    "userOId" : mongoose.Types.ObjectId,
    "balance" : Number
}

interface loginBody{
    "userId" : string,
    "password" : string
}

interface Filter{
    "token" : string,
    "filter" : string
}
router.post("/signup" , async (req , res)=>{
    try{    
        const signupBody:userBody = (req.body);
        let validate:Boolean = userSchema.safeParse(signupBody).success
        if(!validate)throw "Not able Signup!"
        const user = await User.create(signupBody)
        const accountForUser:accountBody = {
            "userOId" : user._id,
            "balance" : Math.floor(Math.random() * 1000 + 1)
        }
        validate = AccountSchema.safeParse(accountForUser).success
        const account = await Account.create(accountForUser)
        const token:string = GetToken({
            "userOId" : user._id.toString(),
            "iat" : 0
        })
        const ret:(ResponseBody&TokenType) = {
            firstName:user.firstName,
            lastName:user.lastName,
            userId:user._id.toString(),
            token
        }
        return res.status(200).json({
            message : "Successfull Signup Of User",
            data : ret
        })
    }catch(err){
        return res.status(411).send("Not Able to Confirm")
    }
})


router.get("/login" , async (req : Request<{}, {}, {}, loginBody>, res)=>{
    try{
       const LoginBody:loginBody = req.query
        const user = await User.findOne(LoginBody)
        if(!user)throw "No such User"
        const token:string = GetToken({
            "userOId" : user._id.toString(),
            "iat" : 0
        })
        const ret:(ResponseBody&TokenType) = {
            firstName:user.firstName,
            lastName:user.lastName,
            userId:user._id.toString(),
            token
        }
        return res.status(200).json({
            message : "Found User!",
            data : ret
        })
    }catch(err){
        return res.status(411).send({
            message : "Unable To Login!"
        })
    }
})

router.get("/find" , Auth  ,  async (req: Request<{} , {} , {} , Filter> , res:Response)=>{
    try{
        // console.log("hre")
        const filter:string = req.query.filter || "";
        console.log(filter)
        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }},{
                    userId : {
                        "$regex" :filter
                    }
                }
            ]});
            // console.log(users)
            const data:ResponseBody[] = users.map(el => {
                return {
                    firstName: el.firstName,
                    lastName : el.lastName,
                    userId : el.userId
                }
            })
            // console.log(data)
        return res.status(200).json({
            message : "Here Is What We Could Find",
            data 
         })
    }
    catch(err){
        return res.status(411).json({
            message : "Some Error Occured"
        })
    }
})


router.get("/verify" , Auth , async (req: Request<{} , {} , {} , {
    "token":string
}> , res:Response )=>{
        try{
            const DecodeVal = verifyToken(req.query.token)
            if(!DecodeVal)throw "Not Good"
            const user = await User.findOne({
                _id : DecodeVal.userOId
            })
            if(!user){
                throw "Not Found"
            }
            const ret:ResponseBody = {
                firstName:user.firstName,
                lastName:user.lastName,
                userId:user._id.toString()
            }
            return res.status(200).json({
                message : "User Found!",
                data : ret
            })
            
        }catch(err){
            return res.status(420).json({
                message : "User Not Found!"
            })
        }
})

export{
    router
}