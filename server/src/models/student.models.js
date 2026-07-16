import mongoose from "mongoose";


const studentSchema = new mongoose.Schema(
  {
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library", 
        required: true
    },
    admissionNumber: {
        type: String,
        required: true, 
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    joiningDate: {
        type: Date,
        default: Date.now
    }
}  ,

    { timestamps: true }    
); 

const Student = mongoose.model("Student", studentSchema);
export default Student;
