const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail}= require("../mail/templates/courseEnrollmentEmail");


exports.capturePayment = async (req,res)=>{
    // get courseId and userId 
    const {course_id}= req.body;
    
    const userId = req.user.id;
    console.log("Type of course_id ",course_id);
    console.log("Type of userId ",userId);
    // validation 
    // valid courseId 
    if(!course_id){
        return res.json({
            success:false,
            message:"Please Provide valid Course Id "
        });
    }
    // valid courseDetails 
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"Please Provide valid Course Details "
            });
        } 

        // check if user already paid for this course 
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Student is Already Registered ",
            })
        }

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })

    }
    
    // order create 
    const amount = course.price;
    const currency = "INR";
    const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now().toString),
        notes:{
            courseId :course_id,
            userId, 
        }
    };
    try{
        //initiate the payemnt using razorpay 
        const paymentResponse =await instance.orders.create(options);
        console.log("Initiation of payment order ", paymentResponse);

        // return rsponse 
        return res.status(200).json({
            sucess:true,
            courseName:course.courseName,
            courseDescription : course.courseDescription,
            thumbnaile:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });


    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            success:false,
            message:"Initiation of payment order cannot be acheived",
        });
    }
  
};

// verify Signature of Razorpay and server 

exports.verifySignature = async (req,res) =>{
    const webhookSecret= "12345678";

    const signature = req.headers("x-razorpay-signature");

    // now hash function according to syntax 
    const shasum = crypto.createHmac("sha256",webhookSecret); //sha256 is a hashing algo and it will return an object so we have to convert shasum to string format 
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature===digest){
        console.log(" Payment is Authorized ");
        // after it verified add course to user account and also add user to studentEnrolled in course 
        // but now request is not coming from frontend body it is coming from razorpay so how to get courseId and UserID ?
        // during order creation we have passed in option in notes of userID and CourseID
        const {courseId,userId} = req.body.payload.payment.entity.notes;
        
        try{
            const enrolledCourse = await Course.findOneAndUpdate(
                                                                {_id:courseId},
                                                                {$push:{studentsEnrolled:userId}},
                                                                {new:true}
                                                                );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course Not Found",
                });
            }
            console.log("AFter enrollment : ",enrolledCourse);

            // now add course to student's courses
            const enrolledStudent = await User.findOneAndUpdate(
                                                               {_id:userId},
                                                               {$push:{courses:courseId}},
                                                               {new:true}
                                                               );
                                                               
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"Courses of Student Not Found",
                });
            }
            console.log("AFter enrollment from User account : ",enrolledStudent);
            // after alll this work now sent mail confirmation 

            const emailResponse = await mailSender(enrolledStudent.email,
                                                    "Congratulations from StudyNotion",
                                                    courseEnrollmentEmail(
                                                        enrolledCourse.courseName,
                                                        `Congratulations, you are onboarded into StudyNotion Course ${enrolledCourse.courseName}`
                                                    )
                                                    );
            
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added",
            });
            

        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:"Courses Cannot be Added",
            });

        }

    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid request ",
        });
         
    }
};






