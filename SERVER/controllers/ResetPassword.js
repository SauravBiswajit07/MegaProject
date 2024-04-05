 
//  flow is : forgot password -> link generated -> sent to mail 
                        //   -> link opened -> ui -> new password enter -> update in db 
                        // start from 1hr 28min

const User = require("../models/User");
const mailSender = require ("../utils/mailSender");
const bcrypt= require("bcrypt");

// reset password token 
exports.resetPasswordToken = async (req,res) =>{
    try{
        // get email from body 
        const {email}= req.body;

        // check if user exist or not 
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registred yet",
            });
        }
        //generate token to  be inserted in reset password link 
        const token = crypto.randomUUID(); //this will generate a random uuid means a ling unique number

        // update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate({email:email},
                                                           {
                                                            token:token,
                                                            resetPasswordExpires:Date.now() + 5*10*1000,
                                                           },
                                                           {new:true});   // by this updated document is returned in response
        // create url 
        const url = `http://localhost:3000/update-password/${token}`
        // above url is a frontend link 
        // send mail containing url 
        await mailSender(email,
                         "Password Reset Link",
                         `Password Reset Link : ${url}`);
        // return res 
        return res.json({
            success:true,
            message:'Email sent Successfully, please check email and Change Password',
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'Trouble while creating the Link',
        })
    }
}

// update with resetted password  

exports.resetPassword = async (req,res) =>{
    try{
        // data fetch 
        const {password , confirmPassword, token} = req.body; // we hav esent token in url so how it is coming in body? => so the frontend basically puts this token in body

        // validation 
        if(password!== confirmPassword){
            return res.json({
                success:false,
                messsage:'Password is not matching'
            });
        }
        // get user details from db using token 
        const userDetails= await User.findOne({token:token});
        // if no entry invalid token
        if(!userDetails){
            return res.status(500).json({
                success:false,
                message:'Token Invalid',
            });
        } 
        // token time check if expires 
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(500).json({
                success:false,
                message:'Token Expired, please regenerate token',
            });
        }

        // hash password 
        const hashedPassword = await bcrypt.hash(password,10);
        
        // password update
        await User.findOneAndUpdate({token:token},
                                    {
                                        password:hashedPassword
                                    },
                                    {new:true}) ;
        // return response 
        return res.status(200).json({
            success:true,
            message:"Password Updated Successffully",
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Trouble while Resetting Password",
        })

    }
}
