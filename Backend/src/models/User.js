import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        trim:true,
        required:true
    },

    email:{
      type:String,
      unique:true,
      required:true,
      trim:true,
      lowercase:true
      
    },

    password:{
        type:String,
        required:true
    },

},
{ timestamps: true },
)

const User = mongoose.model('User',userSchema);

export default User;