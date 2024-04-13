const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


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
        expires: 60*5,
    }
}); 

// a function whose -> to send mail 
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion",emailTemplate(otp));
        console.log("Email sent SUCCESSFULLY  ",mailResponse);
    }
    catch(err){
        console.log("error occurded while sending mail ",err);
        throw err;
    }
}

OTPSchema.pre("save", async function(next){
	console.log("New document saved to database");
    
    // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	// await sendVerificationEmail(email, otp);

    next();
})


// module.exports= mongoose.model("OTP",OTPSchema)
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;