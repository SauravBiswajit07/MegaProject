const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require ("../models/Course");


exports.updateProfile = async (req,res) =>{
    try{
        // get data 
        const {dateOfBirth="",about="",contactNumber,gender}= req.body;
        // fetch user id
        const id = req.User.id; //during auth middleware we pushed decode payload cfretaed in login into User
        // do validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are Required",
            });
        }
        // find profile and update it , in Auth controller during signUp we created a dummy Profile having all details as null
        const userDetails = await User.findById(id);
        const profileId= userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        console.log("Profile details are ",profileDetails); 

        // update the profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.gender=gender;

        // when object os not cretaed then we push entry to DB usine CREATE method 
        // but here object is already created so we have to use SAVE() method 
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"Profile Details are updated Successfully",
            profileDetails,
        })




    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Error while Updating Profile",
        })
    }
}

// delete account 
exports.deleteAccount = async (req,res) =>{
    try{
        // get id 
        const id = req.user.id;

        // check validation 
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:" User Id connot be fetched "
            })
        }
        // delete profile first 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
              courseId,
              { $pull: { studentsEnrolled: id } },
              { new: true }
            )
          }

        // delete user acc then 
        await User.findByIdAndDelete({_id:id});  

        return res.status(200).json({
            success:true,
            message:"User Deleted successfully",
        });

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Problem In Deleting Account ",
        });
    }
}

exports.getAllUserDetails = async (req,res)=>{
    try{
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"All User Details are fetched successfully"
        });

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Problem In Deleting Account ",
        })

    }
}

