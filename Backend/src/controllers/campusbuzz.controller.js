import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { campusBuzz } from "../models/campusbuzz.model.js";

export const createPost = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text?.trim()) {
        throw new ApiError(400, "Post text is required");
    }

    const post = await campusBuzz.create({
        text,
        postedBy: req.user._id,
    });

    const createdPost = await campusBuzz.findById(post._id).populate(
        "postedBy",
        "username fullName"
    );

    return res
        .status(201)
        .json(new ApiResponse(201, createdPost, "Posted successfully"));
});

export const updatePost = asyncHandler(async (req,res)=>{
    const { text } = req.body;

    if (!text?.trim()) {
        throw new ApiError(400, "Post text is required");
    }

    const post = await campusBuzz.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    if(post.postedBy.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "Unauthorised access");
    }

    const updatedPost = await campusBuzz.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                text: text
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
})

export const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await campusBuzz.find()// no filter arguments, which fetches every single post stored in the database collection.
        .populate("postedBy", "username fullName")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { count: posts.length, posts }, "Posts fetched successfully"));
});

export const toggleLike = asyncHandler(async (req, res) => {
    const post = await campusBuzz.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
        post.likes.push(req.user._id);
    }

    await post.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { likeCount: post.likes.length, liked: !alreadyLiked }, "Like toggled"));
});

export const deletePost = asyncHandler(async (req, res) => {
    const post = await campusBuzz.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorised access");
    }

    await campusBuzz.findByIdAndDelete(post._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});