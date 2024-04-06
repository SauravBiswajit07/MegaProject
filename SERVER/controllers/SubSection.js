const SubSection = require ("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req,res) =>{
    try{
        // fetch data from req body 
        const {sectionId , title, timeDuration, description} = req.body;
        // extract file/video 
        const video = req.files.videoFile;
        // validation
        if(!sectionId || !title|| ! timeDuration|| !description){
            return res.status(400).json({
                success:false,
                message:"All Fields are required to create Subsection",
            });
        }
        // upload video to cloudinary => after uploading cloudinary will give a secure_url 
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create a subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        // push  subsection id into section 
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                               {$push:{
                                                                      subSection:subSectionDetails._id,
                                                               }},{new:true}).populate("subSection");
        
        return res.status(200).json({
            success:true,
            message:"Sub section created successfully",
            updatedSection,
        })
    }
    catch(err){
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error)
        return res.status(500).json({
        success: false,
        message: "Error while creating Subsection",
        error: err.message,
        });

    }
}
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.videoFile !== undefined) {
        const video = req.files.videoFile;
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      console.log("updated section", updatedSection)
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }
