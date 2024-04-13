const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try{
        // data fetch 
        const {sectionName,courseId} = req.body; 
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Please fill all the Details'
            });
        } 
        // create section 
        const newSection = await Section.create({sectionName});
        
        // update course with section objectID  
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
                                                             {
                                                                $push:{
                                                                    courseContent:newSection._id,
                                                                }
                                                             },
                                                             {new:true})
                                                             .populate({
                                                                path: "courseContent",
                                                                populate: {
                                                                    path: "subSection",
                                                                },
                                                            })
                                                            .exec();
        
        console.log("Updated course deatils are :",updatedCourseDetails);
        // return response 
        res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		});

    }
    catch(error){
        // Handle errors
		res.status(500).json({
			success: false,
			message: "Unable to create Section, please Try again",
			error: error.message,
		});

    }
}

// update section 

exports.updateSection = async(req,res) =>{
    try{
        const {sectionName,sectionId,courseId} = req.body; 
        if(!sectionName || !courseId || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Please fill all the Details'
            });
        } 
        // update section 
        const section = await Section.findByIdAndUpdate(sectionId,
                                                        {sectionName},
                                                        {new:true});
        
        const course = await Course.findById(courseId)
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        })
        .exec();     
        console.log("After updating section course is ",course); 
        
        res.status(200).json({
			success: true,
			message: "section updated successfully",
			data:course,
		});

    }
    catch(err){
        console.error("Error updating section:", err);
		res.status(500).json({
			success: false,
			message: "Unable to update Section, please Try again",
		});
    }
}

// delete section 
exports.deleteSection = async(req,res)=>{
    try{
        // assuming that we have sent section id in params
        const {sectionId} = req.params;
        // const {sectionId} = req.body; //this is for testing bcz we have sent course id and section id in body
        // delete 
        await Section.findByIdAndDelete(sectionId);
        // TODO : do you need to delete section from course schema 
        // return res 
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully"
        })

    }
    catch(err){
        console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Unable to delete Section, please Try again",
		});
    }
}