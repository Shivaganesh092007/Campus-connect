import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { deleteFileOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Document } from "../models/document.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const uploadDocument = asyncHandler(async (req,res)=>{
    const {title, courseCode, branch} = req.body;

    if([title,courseCode,branch].some((field)=>!field?.trim())) {
        throw new ApiError(400, "All fields required");
    }

    const uploadedFilePath=req.file?.path;
    if(!uploadedFilePath){
        throw new ApiError(400, "No file found");
    }

    const uploadFile=await uploadOnCloudinary(uploadedFilePath);

    const document=await Document.create({
        title,
        courseCode,
        branch,
        fileUrl: uploadFile.url,
        filePublicId: uploadFile.public_id,
        uploadedBy:req.user._id,
    })

    const uploadedFile = await Document.findById(document._id);
    if(!uploadedFile){
        throw new ApiError(500, "something went wrong while uploading");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,uploadedFile,"file uploaded successfully")
        )
});

export const getAllDocuments = asyncHandler(async(req,res)=>{
    try {
    const { search, branch, courseCode } = req.query; //search :- what user searched for

    //Initializing an empty filter object
    const filter = {};

    if (branch) {
      filter.branch = branch;
    }

    if (courseCode) {
      filter.courseCode = courseCode;
    }

    if (search) {
      // Use regex for partial, case-insensitive matching on the title
      filter.title = { 
        $regex: search, 
        $options: 'i' 
      };
    }

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'username fullName') // Only fetches username and fullName
      .sort({ createdAt: -1 }); //sorts by newest first

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: documents.length,
                data: documents,
            },
            "Data fetched successfully"
        )
    );

    } catch (error) {
        console.error('Error fetching documents:', error);
        
        throw new ApiError(500,error.message,error)
    }
})

export const deleteDocument = asyncHandler(async(req,res)=>{
    const document=await Document.findById(req.params.id);
    if(!document){
        throw new ApiError(404, "Document does not exist");
    }

    if(document.uploadedBy.toString()!==req.user._id.toString()){
        throw new ApiError(403, "Unauthorised access");
    }

    const result = await deleteFileOnCloudinary(document.filePublicId);// deletion on cloudinary

    await Document.findByIdAndDelete(document._id); // deletion on MongoDB

    return res
        .status(200)
        .json(
            new ApiResponse(200,{},"File deleted successfully")
        )
})