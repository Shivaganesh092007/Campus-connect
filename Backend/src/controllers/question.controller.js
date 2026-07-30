import { asyncHandler } from "../utils/asyncHandler.js";
import { Question } from "../models/question.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"

export const createQuestion=asyncHandler(async(req,res)=>{
    const {title, description, branch, topic}=req.body;

    if([title, description, branch, topic].some((field)=>!field.trim())){
        throw new ApiError(400, "All fields required");
    }

    const question=await Question.create({
        title,
        description,
        branch,
        topic,
        askedBy: req.user._id,
    })

    const createdQuestion = await Question.findById(question._id).populate(
        "askedBy",
        "username fullName"
    );

    if (!createdQuestion) {
        throw new ApiError(500, "Something went wrong while posting the question");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201,createdQuestion,"Question posted successfully")
        )
})

export const updateQuestion = asyncHandler(async (req,res)=>{
    const { id } = req.params;
    const { title, description, branch, topic } = req.body;

    if([title, description, branch, topic].some((field)=>!field.trim())){
        throw new ApiError(400, "All fields required");
    }

    const question = await Question.findById(id);

    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    if (question.askedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this question");
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        {
            $set:{
                title,
                description,
                branch,
                topic
            }
        },
        {
            new: true
        }
    ).populate("askedBy","fullName username")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedQuestion, "Question updated successfully"));
})

export const getAllQuestions = asyncHandler(async (req, res) => {
    const { search, branch, topic, status } = req.query;

    const filter = {};
    if (branch) filter.branch = branch;
    if (topic) filter.topic = topic;
    if (status) filter.status = status;
    if (search) {
        filter.title = { $regex: search, $options: "i" };
    }

    const questions = await Question.find(filter)
        .populate("askedBy", "username fullName")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { count: questions.length, questions }, "Questions fetched successfully"));
});

export const getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id).populate(
        "askedBy",
        "username fullName"
    );

    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, question, "Question fetched successfully"));
});

export const toggleQuestionUpvote = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = question.upvotes.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
        question.upvotes = question.upvotes.filter((id) => id.toString() !== userId);
    } else {
        question.upvotes.push(req.user._id);
    }

    await question.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { upvoteCount: question.upvotes.length, upvoted: !alreadyUpvoted }, "Upvote toggled"));
});

export const markQuestionSolved = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    if (question.askedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the person who asked can mark this solved");
    }

    question.status = question.status === "Solved" ? "Unsolved" : "Solved";
    await question.save();

    return res
        .status(200)
        .json(new ApiResponse(200, question, `Marked as ${question.status}`));
});