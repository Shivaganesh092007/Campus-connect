import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CampusBuzz } from "../models/campusbuzz.model.js";

export const createPost = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text?.trim()) {
        throw new ApiError(400, "Post text is required");
    }

    if (text.length > 500) {
        throw new ApiError(400, "Post text cannot exceed 500 characters");
    }

    const post = await CampusBuzz.create({
        text,
        postedBy: req.user._id,
    });

    const createdPost = await CampusBuzz.findById(post._id).populate(
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

    if (text.length > 500) {
        throw new ApiError(400, "Post text cannot exceed 500 characters");
    }

    const post = await CampusBuzz.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    if(post.postedBy.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "Unauthorised access");
    }

    const updatedPost = await CampusBuzz.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                text: text
            }
        },
        {
            new: true
        }
    ).populate("postedBy", "username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
})

export const getAllPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await CampusBuzz.find()// no filter arguments, which fetches every single post stored in the database collection.
        .populate("postedBy", "username fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPosts = await CampusBuzz.countDocuments();

    return res
        .status(200)
        .json(new ApiResponse(200, { count: posts.length,totalPosts, currentPage: page, posts }, "Posts fetched successfully"));
});

export const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await CampusBuzz.findById(id);
    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    const alreadyLiked = post.likes.includes(userId);
    const updateQuery = alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } };

    const updatedPost = await CampusBuzz.findByIdAndUpdate(id, updateQuery, { new: true });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { likeCount: updatedPost.likes.length, liked: !alreadyLiked },
                "Like toggled"
            )
        );
});

export const deletePost = asyncHandler(async (req, res) => {
    const post = await CampusBuzz.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post does not exist");
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorised access");
    }

    await CampusBuzz.findByIdAndDelete(post._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});