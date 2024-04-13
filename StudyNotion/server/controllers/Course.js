const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create course handler function 
exports.createCourse = async (req,res)=>{
    try{
        // Get user ID from request object
		const userId = req.user.id;
        // fetch data
        let {courseName, courseDescription , whatYouWillLearn, price, tag:_tag,category,status,instructions,} = req.body;
        // fetch thumbnail
        const thumbnail = req.files.thumbnailImage; 
        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)

        // validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category){
            return res.status(400).json({
                success:false,
                message:"All Fields are Required",
            }); 
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

        // check for instructor 
        // const userId = req.user.id; //this is to fetch only user_id
        const instructorDetails = await User.findById(userId,{accountType:"Instructor"}); // instructorDetails-> in this objectId of instructor is present  
        // check if user id and instructor id are same or not 
        console.log("Instructor Details are ",instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructors Details not Found",
            }); 
        }

        // check given tag is valid or not 
        const categoryDetails = await Category.findById(category); // here findById bcz in CAtegory model we created category as ObjectId..so here fetched category will be a id
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Details Details not Found",
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
            tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url, //uploadImageToCloudinary in thisin rsponse it wil send objects having a parametr secure_url
            status: status,
			instructions: instructions,
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
        // update category ka schema
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
              $push: {
                courses: newCourse._id,
              },
            },
            { new: true }
        )
        console.log("HEREEEEEEEE", categoryDetails2);

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

exports.getAllCourses = async(req,res)=>{
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

// get course details 
exports.getCourseDetails = async (req,res) =>{
    try{
        // get course id 
        const {courseId} = req.body;

        // find course details ...here we have to find exact details not objectId 
        // so we have to populate each param which have object id 

        const courseDetails = await Course.find(
                                               {_id:courseId})
                                               .populate(
                                                {
                                                    path:"instructor",
                                                    populate:{
                                                        path:"additionalDetails",
                                                    }
                                                })
                                                .populate("category")
                                                // .populate("ratingAndreviews")
                                                .populate(
                                                {
                                                    path:"courseContent",
                                                    populate:{
                                                        path:"subSection"
                                                    },
                                                })
                                                .exec();
        
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Cannot Get all Course Details ${courseId}`,
            });
        } 
        return res.status(200).json({
            success:true,
            message:"Course Details Fetched Successfully",
            data:courseDetails,
        })                                       
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error while Fetching All Course Details",
        })

    }
}











