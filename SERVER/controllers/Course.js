const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create course handler function 
exports.createCourse = async (req,res)=>{
    try{
        // fetch data
        const {courseName, courseDescription , whatYouWillLearn, price, tag} = req.body;
        // fetch thumbnail
        const thumbnail = req.files.thumbnailImage; 

        // validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All Fields are Required",
            }); 
        }

        // check for instructor 
        const userId = req.user.id; //this is to fetch only user_id
        const instructorDetails = await User.findById(userId); // instructorDetails-> in this objectId of instructor is present  
        // check if user id and instructor id are same or not 
        console.log("Instructor Details are ",instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructors Details not Found",
            }); 
        }

        // check given tag is valid or not 
        const tagDetails = await Tag.findById(tag); // here findById bcz in Tag model we created tag as ObjectId..so here fetched tag will be a id
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag Details Details not Found",
            }); 
        }

        // uplload image to cloudinary  
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)
        console.log("Thumbanil image is ",thumbnailImage);

        // create an entry for newCourse 
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url, //uploadImageToCloudinary in thisin rsponse it wil send objects having a parametr secure_url

        });

        // add the new course to user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );
        // update tag ka schema

        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error:err.message,
        })

    }

}

// getAllCourses handler

exports.showAllCourses = async(req,res)=>{
    try{
        // change heba agare jaiki
        const allCourses = await Course.find({},{courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true,})
                                                .populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"Data for AllCourses Fetched Successfully",
            data:allCourses,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:true,
            message:'Cannot Fetch all course data ',
            error:err.message,
        })
    }
}











