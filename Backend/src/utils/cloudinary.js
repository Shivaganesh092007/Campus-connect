import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// this code assumes that the file has already been saved to your server's local disk by a previous step (previous middleware)[multer]
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        console.log("file is uploaded on cloudinary", response.url);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        // Safe cleanup check
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("Failed to delete local temp file:", unlinkError);
            }
        }
        return null;
    }
}

const deleteFileOnCloudinary = async (publicId) =>{
    try {
        if(!publicId) return null;
        const result=await cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });

        if(result.result === "ok") console.log("File deleted Successfully");
        
        return result.result === "ok" ? result : null;
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFileOnCloudinary};