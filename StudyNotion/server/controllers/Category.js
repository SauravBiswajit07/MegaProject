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

// category page details 

exports.categoryPageDetails = async (req, res) => {
    try {
            // get category id 
            // get all courses for specified id 
            // validation 
            // get course for other diff id 
            // get top selling course 
            // return res

            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Data Not Found',
                });
            }
            //get coursesfor different categories
            const differentCategories = await Category.find({
                                         _id: {$ne: categoryId}, //ne means aise category jinki id not equal to this id  
                                         })
                                         .populate("courses")
                                         .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategories,
                },
            });

    }
    catch(error ) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
    }
}