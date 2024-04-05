const Tag = require("../models/tags");

// create tag ka handler function 

exports.createTag = async (req,res) =>{
    try{
        // fetch data
        const {name,description} = req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required ',
            })
        } 
        //create entry in db 
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log("Tag Details are ",tagDetails);

        return res.status(200).json({
            success:true,
            message:"Tags Created Successfully",
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}

// get all tags 
exports.showAlltags = async (req,res) =>{
    try{
        const allTags = await Tag.find({},{name:true,description:true})
        return res.status(200).json({
            success:true,
            message:" All Tags fetched Successfully",
            allTags,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}