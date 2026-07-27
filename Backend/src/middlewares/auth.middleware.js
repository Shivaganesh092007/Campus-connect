import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

const verifyJWT= asyncHandler(async function(req,res,next){
    try {
        const token=req.cookies?.accessToken;

        if(!token){
            throw new ApiError(401,"Unauthorized request");
            return;
        }

        const decoded_token=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user=await User.findById(decoded_token?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user=user;
        next();
        
    } catch (error) {
        console.log("verification/authentication failed",error);
        throw new ApiError(401,"verification/authentication failed",error);
    }
})

export default verifyJWT;