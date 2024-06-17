import mongoose from "mongoose"
const AccountSchema = new mongoose.Schema({
    userOId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique : true
    },
    balance : {
        type : Number,
        required : true,
    }
})
const Account = mongoose.model('Account' , AccountSchema)
export {
    Account
}