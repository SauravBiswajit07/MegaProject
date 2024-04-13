
const User = require("../models/User")
const OTP = require ("../models/OTP")
const otpGenerator = require("otp-generator");
const mailSender = require ("../utils/mailSender");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile")
require("dotenv").config();

// sendOtp in case of signUP

exports.sendotp = async (req,res)=> {
    try{
    const {email}= req.body;
    const checkUserPresent = await User.findOne({email});
    // if user is already present
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User already exist",
        })
    }

    // iif not present then generate otp 
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    console.log("OTP generated => ",otp);

    // now check if otp is unique or not 
    const result = await OTP.findOne({otp:otp});
    while(result){//while we are not getting an unique otp then till that genera te otp
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        // result = await OTP.findOne({otp:otp});
    }
    const otpPayload = {email,otp};
    // create an entry for otp
    // before OTP.create we have a pre save middleware in OTP model 
    // in which before create, a mail will be sent to us having an otp
    const otpBody = await OTP.create(otpPayload);
    console.log("otp body ",otpBody);

    // return success status
    res.status(200).json({
        success:true,
        message:'OTP Sent SUCCESSFULLY',
        otp,
    })
    
    }
    catch(err){
        console.log("OTP can't send ",err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }


}

//signUp
exports.signup= async(req,res)=>{
    try{
        // data fetch from req body 
        const {firstName,lastName,email,password,confirmPassword,
            accountType,contactNumber,otp}= req.body;
        
        // validate the data 
        if(!firstName || !lastName|| !email|| !password|| !confirmPassword|| !otp){
            return res.status(403).json({
                success:false,
                message:"All Fields are Required",
            })
        }

        // 2 password matches or not 
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword are not matching, plaese try again",
            })
        }
        //check user already exist 
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(400).json({
                success:false,
                message:"User already exist",
            })
        }

        // find most recent otp 
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);//sorting according to created at parsam so most recent will be fetched
        console.log("recent opt is ",recentOtp);

        // validate otp 
        if(recentOtp.length===0){
            return res.status(400).json({
                success:false,
                message:"OTP not Found "
            })
        }else if(otp !== recentOtp[0].otp){ //recentOtp re OTP ra model thiba email,otp,createdAt so amaku khali recentOtp ra otp darkar hence recentOtp.otp
            return res.status(400).json({
                success:false,
                message:'OTP is not recent'
            })
        }

        // hash passsword 
        const hashedPassword = await bcrypt.hash(password,10);
        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        // entry created in DB 
        // first create profile details and save it in DB 
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user = await User.create({
            firstName,lastName,email,contactNumber,
            password:hashedPassword,
            accountType:accountType,
			approved: approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        // return res
        return res.status(200).json({
            success:true,
            message:'USer is registered Successfully',
            user,
        });

    }
    catch(err){
        console.log("Error in Singing Up ",err);
        return res.status(500).json({
            success:false,
            message:"User cannot be Registred, please try again "
        })
    }
}

// login
exports.login = async(req,res) =>{
    try{
        // get data 
        const {email,password}= req.body;

        // validation
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are Required',
            });
        }
        // check if user registred 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not Registred'
            });
        }
        // password match and 
        // generate jwt token
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            console.log("Payload of token is ",payload);
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h",
            });
            user.token=token;
            user.password=undefined;
            // create cookie  send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
        
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged In successfully"

            })
  
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is Incorrect',
            });
        }

        
        
    }
    catch(err){
        console.log("Login Failed , please try again");
        return res.status(500).json({
            success:true,
            message:'Login failed, please try again',
        })
    }
}

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id)
    
        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword } = req.body
    
        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
            .status(401)
            .json({ success: false, message: "The password is incorrect" })
        }
    
        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        )
    
        // Send notification email
        try {
            const emailResponse = await mailSender(
            updatedUserDetails.email,
            "Password for your account has been updated",
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            )
            )
            console.log("Email sent successfully: ", emailResponse.response)
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
            })
      }
  
        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
            // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while updating password:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while updating password",
                error: error.message,
      })
    }
  }

