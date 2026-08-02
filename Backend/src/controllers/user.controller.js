import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import fs from "fs";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
};

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

export const registerUser=asyncHandler( async (req,res)=>{
    const {username, email, fullName, password, branch}=req.body;

    let avatarImageLocalPath=null;
    if (req.files && Array.isArray(req.files.avatarImage) && req.files.avatarImage.length > 0) {
        avatarImageLocalPath = req.files.avatarImage[0].path;
    }

    if ([username, email, fullName, password, branch].some(field => !field?.trim())) {
        if (avatarImageLocalPath && fs.existsSync(avatarImageLocalPath)) {
            fs.unlinkSync(avatarImageLocalPath);
        }
        throw new ApiError(400, "All fields required");
    }

    const existedUser=await User.findOne({
        $or: [{email: email.toLowerCase().trim()},{username: username.toLowerCase().trim()}],
    });

    if(existedUser) {
        if (avatarImageLocalPath && fs.existsSync(avatarImageLocalPath)) {
            fs.unlinkSync(avatarImageLocalPath);
        }
        throw new ApiError(409, "User with similar email or username already exists");
    }

    let avatarImage=null;
    if(avatarImageLocalPath) avatarImage=await uploadOnCloudinary(avatarImageLocalPath);

    const user= await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        branch,
        avatarImage: avatarImage?.url|| "",
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        if (avatarImage?.public_id) {
            await deleteFileOnCloudinary(avatarImage.public_id);
        }
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
});

export const loginUser=asyncHandler( async (req,res)=>{
    const {username, password, email} = req.body

    if (!password?.trim() || (!username?.trim() && !email?.trim())) {
        throw new ApiError(400, "Username or email, and password are required");
    }

    const user=await User.findOne({
        $or: [{username},{email}],
    }).select("+password");

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword) {
        throw new ApiError(401, "Wrong password");
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
})

export const logoutUser=asyncHandler( async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

export const refreshingAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken?._id).select("+refreshToken");;
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // Token generation logic...
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200, 
                    { accessToken, refreshToken: refreshToken }, 
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");  
    }
})