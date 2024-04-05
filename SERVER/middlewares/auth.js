const jwt= require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth 
exports.auth = async(req,res,next)=>{
    try{
        // extract token 
        const token =  req.cookies.token
                       || req.body.token
                       || req.header("Authorisation").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is Missing",
            });
        }     
        // verify token using secret key 
        try{
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            console.log("decode is ",decode);
            req.user = decode;  //payload is inserted like email,id,accountType
        } 
        catch(err){
            return res.status(401).json({
                success:false,
                message:"Token is Invalid ",
            }); 
        } 
        next();

    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while Validating Token ",
        });

    }
}

// isStudent 
exports.isStudent= async (req,res,next)=>{
    // one way is we have done by fetching the role from decode or say payload 
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                succcess:false,
                message:"Protected Route For Students Only"
            });

        }
        next();

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verfied , please try again ",
        });
    }
}

// isinstructor
exports.isInstructor= async (req,res,next)=>{
    // one way is we have done by fetching the role from decode or say payload 
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                succcess:false,
                message:"Protected Route For Instructor Only"
            });

        }
        next();

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verfied , please try again ",
        });
    }
}

// isAdmin
exports.isAdmin= async (req,res,next)=>{
    // one way is we have done by fetching the role from decode or say payload 
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                succcess:false,
                message:"Protected Route For Admin Only"
            });

        }
        next();

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verfied , please try again ",
        });
    }
}