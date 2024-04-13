const mongoose = require("mongoose");


const profileSchema = new mongoose.Schema({
    
    gender:{
        type:String,
    },
    dateOfBirth:{
        type:String,
    },
    about:{
        type:String,
        trim:true,
        // white spaces will be removed from both sides of the string in trim:true 
    },
    contactNumber:{
        type:Number,
        trim:true,
    }

});

module.exports= mongoose.model("Profile",profileSchema)


