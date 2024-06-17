import express , {Request , Response} from "express"
import mongoose from "mongoose"
import {Auth , Authp} from "../Middleware/Auth"
import { verifyToken } from "../Middleware/verifyToken"
import { Account } from "../Schema/Account"
import { User } from "../Schema/User"
const router = express.Router()



router.get("/self" , Auth , async (req  , res) => {
    try{
        const token:string = req.query.token
        const val = verifyToken(token)
        if(!val)throw "Not Good"
        const acc = await Account.findOne({
            userOId : mongoose.Types.ObjectId.createFromHexString(val.userOId)
        })
        if(!acc){
            throw "not Good"
        }
        return res.status(200).json({
            message : "Found Account!",
            data : acc
        })
    }catch(err){
        return res.status(411).json({
            message : "Unable to Find Account Details"
        })
    }
})

interface TransactionReq {
    "token" : string,
    "toId" : string,
    "value" : number
}

router.post("/transfer" , Authp , async (req : Request<{} , {} , TransactionReq , {}> , res:Response) => {
    try{
        console.log(req.body)
        const token:string = req.body.token
        const val = verifyToken(token)
        if(!val)throw "Val Cannot Be Null!"
        const session = await mongoose.startSession();
        session.startTransaction();
        const acc = await Account.findOne({
            userOId : mongoose.Types.ObjectId.createFromHexString(val.userOId)
        }).session(session)
        const us2 = await User.findOne({
            userId : req.body.toId
        }).session(session)
        if(!us2)throw "its null!"
        const acc2 = await Account.findOne({
            userOId : us2._id
        })
        if(!acc || !acc2 || acc.balance < req.body.value || acc._id === acc2._id){
            session.abortTransaction()
            throw "Transaction Cancelled Due to Unavailability of Client or Sender!"
        }
        await Account.updateOne({ _id : acc._id }, { $inc: { balance: -req.body.value } }).session(session);
        await Account.updateOne({ _id: (acc2._id) }, { $inc: { balance: req.body.value } }).session(session);
        await session.commitTransaction();
        res.status(200).json({
            message: "Transfer successful"
        });
        
    }catch(err){
        return res.status(411).json({
            message : "Unable to Complete Transaction!"
        })
    }
})

export  {
    router
}