const mongoose = require('mongoose');

const UserSchema =new mongoose.Schema({
name:{
    type:String, required:true},
    mobile:{type:String,required:true,unique:true,  match: [/^\d{10}$/, 'Mobile number must be exactly 9 digits'],index:true},
    role:{
        type:String,
        enum:['farmer','driver','labour','equipment_provider','admin'],
        default:'farmer'},
    isVerified: { type: Boolean, default: false },

    dob:Date,
    otpHash:{type:String , select:false},
    otpExpires:Date,
    passwordHash:{type:String,select:false},
    gender:{type:String, enum:['male','female'],default:'male'},
     

},{timestamps:true})


module.exports =mongoose.model("User",UserSchema)

