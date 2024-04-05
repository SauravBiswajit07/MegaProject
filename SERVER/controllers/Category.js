const Category = require("../models/Category");

// create categories ka handler function 

exports.createCategory = async (req,res) =>{
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
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log("Category Details are ",categoryDetails);

        return res.status(200).json({
            success:true,
            message:"Category Created Successfully",
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}

// get all categories
exports.showAllCategories = async (req,res) =>{
    try{
        const allCategories = await Category.find({},{name:true,description:true})
        return res.status(200).json({
            success:true,
            message:" All Categories fetched Successfully",
            allCategories,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}