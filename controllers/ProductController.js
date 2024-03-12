import product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const index=async(req,res)=>{
    try{
        const products=await product.find({status:'active'});
    if(!products){ throw {code:500, message:"get products failed"}}
    return res.status(200).json({
        status:true,
        total:products.length,
        products
    });
    }catch(err){
        return res.status(err.code).json({
            status:false,
            message:err.message
        });
    }
}

const store=async (req,res)=>{
    try{
        //is required fields
        if(!req.body.title){throw { code : 428, message:"title is required"}}
        if(!req.body.thumbnail){throw { code : 428, message:"Thumbnail is required"}}
        if(!req.body.price){throw { code : 428, message:"price is required"}}
        if(!req.body.categoryId){throw { code : 428, message:"Category ID is required"}}

        //is product exist
        const productExist=await product.findOne({
            title:req.body.title
        });
        if(productExist){
            throw{ code:428, message:"product is exist"}
        }
        //is objectID
        if(!mongoose.Types.ObjectId.isValid(req.body.categoryId)){
            throw{code:500,message:'CategoryID invalid'}
        }
        //is category exist
        const categoryExist=await Category.findOne({
            _id:req.body.categoryId
        });
        if(!categoryExist){
            throw{ code:428, message:"Category is not exist"}
        }


        const title=req.body.title;
        const thumbnail=req.body.thumbnail;
        const price=req.body.price;
        const categoryId=req.body.categoryId;

        const newproduct=new product({
            title:title,
            thumbnail:thumbnail,
            price:price,
            categoryId:categoryId,
        });
        const Product=await newproduct.save();

        if(!Product){ throw {code:500,message:"store product failed"}}

        return res.status(200).json({
            status:true,
            Product
        });
    } catch(err){
        if(!err.code){err.code=500}
        return res.status(err.code).json({
            status:false,
            message:err.message
        });
    }
}

export {index, store};
