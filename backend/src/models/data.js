import mongoose  from "mongoose";
const dataSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    label:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","approved"],
        default:"pending"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
const DataModel = mongoose.model("LabelData", dataSchema);
export default DataModel;


