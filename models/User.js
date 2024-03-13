import mongoose from "mongoose";

const Schema= mongoose.Schema({
    fulname:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    role:{
        type:String,
        enum:['admin','cashier','employee'],
        default:'employee', 
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active',
    },
    createdAt:{
        type:Number
    },
    updateAt:{
        type:Number
    }
},
{
    timestamps:{currentTime:()=>Math.floor(Date.now()/1000)}
}
)

export default mongoose.model('User',Schema);