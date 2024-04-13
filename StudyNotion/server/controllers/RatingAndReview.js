const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");


// createRating 
exports.createRating = async (req,res) =>{
    try{
        // get user id 
        const userId = req.user.id;
        // fetch data from req body 
        const {rating,review,courseId} = req.body;
        // check if user enrolled or not 
        const courseDetails = await Course.findOne({_id:courseId,
                                                    studentsEnrolled:{$elemMatch :{$eq:userId}},
                                                });

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in Course"
            });
        }  

        // chcek if user is already reviewd or not 
        const alreadyReviewed = await RatingAndReview.findOne({user:userId,course:courseId});
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"User already Reviewed Before"
            })
        }
        // create rating and review 
        const ratingReview = await RatingAndReview.create({rating,review,course:courseId,user:userId});
        console.log(ratingReview);

        // update course with this rating and review
        const updatedCourseDetails= await Course.findByIdAndUpdate({_id:courseId},
                                        {
                                            $push:{
                                                ratingAndReviews:ratingReview._id,
                                            }
                                        },{new:true});
        console.log(updatedCourseDetails);
        return res.status(200).json({
            success:true,
            message:"Rating and Review Created Successfully",
            ratingReview,
        });

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,

        });
    }
}

// get avg rating
exports.getAverageRating = async (req,res)=>{
    try{
        // get course id 
        const {courseId} = req.body; //courseID string achi 

        // calculate avg rating 
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null, //this means dont group by any specific criteria ...group all the data that have been found 
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        // return avg rating 
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            });
        }
        // if no rating / review 

        return res.status(200).json({
            success:true,
            message:"Avefrage Rating till now is 0, no ratings given till now",
            averageRating:0,
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,

        });
    }
}

// get all rating and review 
exports.getAllRating = async (req,res) =>{
    try{
        const allReviews = await RatingAndReview.find({})
                                                .sort({rating:"desc"})
                                                .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image", //these fields are only required
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName"
                                                })
                                                .exec();
        
        return res.status(200).json({
            success:true,
            message:"All reviews Fetched Successfully",
            data:allReviews,
        });

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,

        });
    }
}








