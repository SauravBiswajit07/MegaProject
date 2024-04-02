const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email,title,body) =>{
// async function maileSender(email,title,body){
    try{

        let transporter= nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env,MAIl_PASS,
            }
        })
        
        // process to send mail 
        let info= await transporter.sendMail({
            from:'StudyNotion',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        });
        console.log(info);
        return info;

    }
    catch(err){
        console.log(err.message);
    }
}

module.exports=mailSender; 