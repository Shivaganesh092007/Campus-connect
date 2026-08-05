import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Answer } from "../models/answer.model.js";
import { Question } from "../models/question.model.js";

export const createAnswer = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { questionId } = req.params;

    if (!text?.trim()) {
        throw new ApiError(400, "Answer text is required");
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    const answer = await Answer.create({
        question: questionId,
        text,
        answeredBy: req.user._id,
    });

    const createdAnswer = await Answer.aggregate([
        { 
            $match: { 
                _id: answer._id 
            } 
        },
        {
            $lookup: {
                from: "users",
                localField: "answeredBy",
                foreignField: "_id",
                as: "answeredBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                answeredBy: {
                    $first: "$answeredBy" 
                }
            }
        }
    ]);

    return res
        .status(201)
        .json(new ApiResponse(201, createdAnswer[0], "Answer posted successfully"));
});

export const updateAnswer = asyncHandler( async(req,res)=>{
    const { text } = req.body;
    const { questionId, id } = req.params;

    if (!text?.trim()) {
        throw new ApiError(400, "Answer text is required");
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question does not exist");
    }

    const ans = await Answer.findById(id);

    if(!ans){
        throw new ApiError(404, "Answer does not exist");
    }

    if (ans.answeredBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this answer");
    }

    if (ans.question.toString() !== questionId) {
        throw new ApiError(400, "This answer does not belong to the specified question");
    }

    await Answer.findByIdAndUpdate(
        id,
        {
            $set:{
                text:text
            }
        },
        {
            new: true
        }
    )

    const updatedAnswer = await Answer.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "answeredBy",
                foreignField: "_id",
                as: "answeredBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                answeredBy: { $first: "$answeredBy" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAnswer[0], "Answer updated successfully"));
})

export const getAnswersForQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const answers = await Answer.aggregate([
        {
            $match: {
                question: new mongoose.Types.ObjectId(questionId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "answeredBy",
                foreignField: "_id",
                as: "answeredBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                answeredBy: { $first: "$answeredBy" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { count: answers.length, answers }, "Answers fetched successfully"));
});

export const toggleAnswerUpvote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const answer = await Answer.findById(id);
    if (!answer) throw new ApiError(404, "Answer does not exist");

    if (answer.question.toString() !== questionId) {
        throw new ApiError(400, "This answer does not belong to the specified question");
    }

    const alreadyUpvoted = answer.upvotes.includes(userId);
    const updateQuery = alreadyUpvoted 
        ? { $pull: { upvotes: userId } } 
        : { $addToSet: { upvotes: userId } };

    const updatedAnswer = await Answer.findByIdAndUpdate(id, updateQuery, { new: true });

    return res.status(200).json(
        new ApiResponse(
            200, 
            { upvoteCount: updatedAnswer.upvotes.length, upvoted: !alreadyUpvoted }, 
            "Upvote toggled"
        )
    );
});

export const deleteAnswer = asyncHandler(async (req, res) => {
    const { questionId, id } = req.params;
    const answer = await Answer.findById(id);

    if (!answer) {
        throw new ApiError(404, "Answer does not exist");
    }

    if (answer.question.toString() !== questionId) {
        throw new ApiError(400, "This answer does not belong to the specified question");
    }
    
    if (answer.answeredBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorised access");
    }

    await Answer.findByIdAndDelete(answer._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Answer deleted successfully"));
});