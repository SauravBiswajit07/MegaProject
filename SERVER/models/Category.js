const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        trim:true,
        // white spaces will be removed from both sides of the string in trim:true 
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }]

});

module.exports= mongoose.model("Category",categorySchema)


