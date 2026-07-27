import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema(
    {
        question: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        answeredBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        upvotes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },
    {
        timestamps: true
    }
);

export const Answer = mongoose.model("Answer", answerSchema);