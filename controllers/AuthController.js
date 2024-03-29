import user from '../models/user.js';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

const generateAccessToken=async(payload)=>{
    return jsonwebtoken.sign(
        payload,
        env.JWT_ACCESS_TOKEN_SECRET,
        {expiresIn:env.JWT_ACCESS_TOKEN_LIFE}
    );
}
const generateRefreshToken=async(payload)=>{
    return jsonwebtoken.sign(
        payload,
        env.JWT_ACCESS_REFRESH_SECRET,
        {expiresIn:env.JWT_ACCESS_REFRESH_LIFE}
    );
}

const env=dotenv.config().parsed;

const register=async(req,res)=>{
    try{
        if(!req.body.fullname){ throw { code:428, message:'FullName is required'}}
        if(!req.body.email){ throw { code:428, message:'email is required'}}
        if(!req.body.password){ throw { code:428, message:'password is required'}}

        //check if password match
        if(req.body.password!==req.body.retype_password){
            throw { code:428, message:"Password and pasword confirmation must match"}
        }
        //check if email exist
        const email=await user.findOne({email:req.body.email});
        if(email){
            throw { code:409, message:"EMAIL_EXIST"}
        }

        let salt=await bcrypt.genSalt(10);
        let hash=await bcrypt.hash(req.body.password, salt);

        const newUser=new user({
            fullname:req.body.fullname,
            email:req.body.email,
            password:hash,
            role:req.body.role,
        });
        const User=await newUser.save();
        if(!user){throw{code:500,message:"USER_REGISTER_FAILED"}}

        return res.status(200).json({
            status:true,
            message:'USER_REGISTER_SUCCESS',
            User
        });
    }catch(err){
        if(!err.code){ err.code=500 }
        return res.status(err.code).json({
            status:false,
            message:err.message
        });
    }
}

const login=async (req,res)=>{
    try{
        if(!req.body.email){ throw { code:428, message:"Email is required"}}
        if(!req.body.password){ throw {code:428, message:"Password is required"}}

        //check is email exist
        const User=await user.findOne({
            email:req.body.email
        });
        if(!User){ throw { code:404, message:"EMAIL_NOT_FOUND"}}

        //check is password match
        const isMatch=await bcrypt.compareSync(req.body.password, User.password);
        if(!isMatch){
            throw {code:428, message:"PASSWORD_WRONG"}
        }

        //generate token
        const payload={id:User._id,role:User.role};
        const accessToken=await generateAccessToken(payload)
        const refreshToken=await generateRefreshToken(payload)
     
        return res.status(200).json({
            status:true,
            message:'LOGIN_SUCCESS',
            accessToken,
            refreshToken
        });
    }catch(err){
        if(!err.code){
            err.code=500
        }
        return res.status(err.code).json({
            status:false,
            message:err.message
        });
    }
}

const refreshToken=async (req,res)=>{
    try{
        if(!req.body.refreshToken){
            throw{code:428, message:"refresh token is required"}
        }
        //verify token
        const verify=await jsonwebtoken.verify(req.body.refreshToken,env.JWT_ACCESS_REFRESH_SECRET);
        if(!verify){ throw {code:401, message:"REFRESH_TOKEN_INVALID"}}

        //generate token
        let payload={_id:verify._id,role:verify.role};
        const accessToken=await generateAccessToken(payload)
        const refreshToken=await generateRefreshToken(payload)

        return res.status(200).json({
            status:true,
            message:'REFRESH_TOKEN_SUCCESS',
            accessToken,
            refreshToken
        });
    }catch(err){
        if(!err.code){ err.code=500}
        return res.status(err.code).json({
            status:false,
            message:err.message
        })

    }
}

export { register,login,refreshToken }