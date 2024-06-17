import {Request , Response , NextFunction} from "express"
import { verifyToken } from "./verifyToken"
interface ReqObj{
    "token":string,
    [key:string] : any
}
const Auth = (req:Request<{},{},{},ReqObj> , res:Response , next:NextFunction)=>{
    try{
        const token:string = req.query.token
        const isgood:Boolean = (verifyToken(token) ? true : false)       
        if(isgood){
            next()
            return
        }
        throw "Not Found"
    }catch(err){
        return res.status(411).json({
            message : "Unable to Verify"
        })
    }
}

const Authp = (req:Request<{},{},ReqObj , {}> , res:Response , next:NextFunction)=>{
    try{
        const token:string = req.body.token
        const isgood:Boolean = (verifyToken(token) ? true : false)       
        if(isgood){
            next()
            return
        }
        throw "Not Found"
    }catch(err){
        return res.status(411).json({
            message : "Unable to Verify"
        })
    }
}

export {
    Auth , Authp
}