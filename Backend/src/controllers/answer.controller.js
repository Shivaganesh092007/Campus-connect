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

    const createdAnswer = await Answer.findById(answer._id).populate(
        "answeredBy",
        "username fullName"
    );

    return res
        .status(201)
        .json(new ApiResponse(201, createdAnswer, "Answer posted successfully"));
});

export const getAnswersForQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const answers = await Answer.find({ question: questionId })
        .populate("answeredBy", "username fullName")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { count: answers.length, answers }, "Answers fetched successfully"));
});

export const toggleAnswerUpvote = asyncHandler(async (req, res) => {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
        throw new ApiError(404, "Answer does not exist");
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = answer.upvotes.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
        answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
    } else {
        answer.upvotes.push(req.user._id);
    }

    await answer.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { upvoteCount: answer.upvotes.length, upvoted: !alreadyUpvoted }, "Upvote toggled"));
});

export const deleteAnswer = asyncHandler(async (req, res) => {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
        throw new ApiError(404, "Answer does not exist");
    }

    if (answer.answeredBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorised access");
    }

    await Answer.findByIdAndDelete(answer._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Answer deleted successfully"));
});