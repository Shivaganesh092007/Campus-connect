import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

const verifyJWT= asyncHandler(async function(req,res,next){
    const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new ApiError(401,"Unauthorized request");
        return;
    }

    try {
        const decoded_token=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user=await User.findById(decoded_token?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user=user;
        next();
        
    } catch (error) {
        console.log("verification/authentication failed",error);
        throw new ApiError(401,error?.message ||"verification/authentication failed",error);
    }
})

export default verifyJWT;