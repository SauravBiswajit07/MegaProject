const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60
    }
}); 

// a function whose -> to send mail 
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion",otp);
        console.log("Email sent SUCCESSFULLY  ",mailResponse);
    }
    catch(err){
        console.log("error occurded while sending mail ",err);
        throw err;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email,this.otp)
    next();
})


module.exports= mongoose.model("OTP",OTPSchema)